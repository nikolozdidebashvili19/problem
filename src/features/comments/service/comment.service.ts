import { userRepository } from '@/features/auth/repository/user.repository';
import { UserDocument } from '@/features/auth/schema/user.schema';
import { commentRepository } from '@/features/comments/repository/comment.repository';
import { CommentDocument } from '@/features/comments/schema/comment.schema';
import { CommentPage, CommentView } from '@/features/comments/types/comment.types';
import { notifyService } from '@/features/notifications/service/notification.service';
import { reportRepository } from '@/features/reports/repository/report.repository';
import { CommentsQueryType, CreateCommentType } from '@/features/reports/validations/report.validation';
import { COMMENTS_PAGE_SIZE } from '@/shared/const/reports.const';
import { ServiceResult } from '@/shared/types/common';
import { hasRole } from '@/shared/utils/roles';

import type { QueryFilter } from 'mongoose';

type Viewer = { id: string; role: string } | null;

function canDelete(comment: CommentDocument, viewer: Viewer): boolean {
  if (!viewer) return false;
  return comment.authorId.toString() === viewer.id || hasRole(viewer.role, 'moderator');
}

async function toViews(comments: CommentDocument[], viewer: Viewer): Promise<CommentView[]> {
  const authorIds = [...new Set(comments.map((comment) => comment.authorId.toString()))];
  const authors = authorIds.length > 0 ? await userRepository.findPublicByIds(authorIds) : [];
  const authorById = new Map(authors.map((author) => [author._id.toString(), author]));

  return comments.map((comment) => {
    const author = authorById.get(comment.authorId.toString());
    return {
      id: comment._id.toString(),
      body: comment.body,
      authorName: author && !author.deletedAt ? author.displayName || author.name : null,
      createdAt: comment.createdAt.toISOString(),
      canDelete: canDelete(comment, viewer),
    };
  });
}

// Oldest first, keyset-paginated like the feed
export async function listCommentsService(
  shortId: string,
  query: CommentsQueryType,
  viewer: Viewer
): Promise<ServiceResult<CommentPage>> {
  const report = await reportRepository.findByShortId(shortId);
  if (!report || report.hidden) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const filter: QueryFilter<CommentDocument> = { reportId: report._id, deletedAt: null };
  if (query.after) {
    const separator = query.after.lastIndexOf('_');
    const createdAt = new Date(Number(query.after.slice(0, separator)));
    const id = query.after.slice(separator + 1);
    filter.$or = [{ createdAt: { $gt: createdAt } }, { createdAt, _id: { $gt: id } }];
  }

  const docs = await commentRepository.findPage(filter, COMMENTS_PAGE_SIZE + 1);
  const page = docs.slice(0, COMMENTS_PAGE_SIZE);
  const last = page.at(-1);
  const nextCursor =
    docs.length > COMMENTS_PAGE_SIZE && last ? `${last.createdAt.getTime()}_${last._id.toString()}` : null;

  return { data: { items: await toViews(page, viewer), nextCursor }, status: 200 };
}

export async function createCommentService(
  user: UserDocument,
  shortId: string,
  input: CreateCommentType
): Promise<ServiceResult<CommentView>> {
  const report = await reportRepository.findByShortId(shortId);
  if (!report || report.hidden) return { data: { error: 'NOT_FOUND' }, status: 404 };

  const userId = user._id.toString();
  const reportId = report._id.toString();
  const comment = await commentRepository.create({ reportId, authorId: userId, body: input.body });
  await reportRepository.incrementCommentCount(reportId, 1);
  await notifyService([{ userId: report.authorId.toString(), type: 'comment', reportId, actorId: userId }]);

  const [view] = await toViews([comment], { id: userId, role: user.role });
  return { data: view, status: 201 };
}

export async function deleteCommentService(user: UserDocument, commentId: string): Promise<ServiceResult<{ ok: true }>> {
  const comment = await commentRepository.findById(commentId);
  if (!comment || comment.deletedAt) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (!canDelete(comment, { id: user._id.toString(), role: user.role })) {
    return { data: { error: 'FORBIDDEN' }, status: 403 };
  }

  const deleted = await commentRepository.softDelete(commentId);
  if (deleted) await reportRepository.incrementCommentCount(comment.reportId.toString(), -1);
  return { data: { ok: true }, status: 200 };
}
