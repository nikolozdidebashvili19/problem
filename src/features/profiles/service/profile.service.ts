import { userRepository } from '@/features/auth/repository/user.repository';
import { UserDocument } from '@/features/auth/schema/user.schema';
import { commentRepository } from '@/features/comments/repository/comment.repository';
import { CommentDocument } from '@/features/comments/schema/comment.schema';
import { ProfileCommentPage, ProfileReportTab, ProfileView } from '@/features/profiles/types/profile.types';
import { ProfileCommentsQueryType, ProfileReportsQueryType } from '@/features/profiles/validations/profile.validation';
import { reportRepository } from '@/features/reports/repository/report.repository';
import { ReportDocument } from '@/features/reports/schema/report.schema';
import { cursorCondition, decodeCursor, encodeCursor, sortValue } from '@/features/reports/service/feed.service';
import { buildReportCards } from '@/features/reports/service/report-card.service';
import { FeedPage } from '@/features/reports/types/report.types';
import { FEED_PAGE_SIZE } from '@/shared/const/feed.const';
import { ServiceResult } from '@/shared/types/common';

import type { QueryFilter } from 'mongoose';

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

const NOT_FOUND = { data: { error: 'NOT_FOUND' }, status: 404 };

const reportsByAuthor = (userId: string): QueryFilter<ReportDocument> => ({ authorId: userId, hidden: false });

const reportsFixedBy = (userId: string): QueryFilter<ReportDocument> => ({
  'fixEvidence.by': userId,
  status: 'fixed',
  hidden: false,
});

const REPORT_TAB_QUERY = {
  reports: { filter: reportsByAuthor, sortField: 'createdAt' },
  fixed: { filter: reportsFixedBy, sortField: 'fixedAt' },
} as const satisfies Record<ProfileReportTab, unknown>;

async function findActiveUser(id: string): Promise<UserDocument | null> {
  if (!OBJECT_ID_PATTERN.test(id)) return null;
  const user = await userRepository.findById(id);
  return user && !user.deletedAt ? user : null;
}

export async function getProfileService(id: string): Promise<ServiceResult<ProfileView>> {
  const user = await findActiveUser(id);
  if (!user) return NOT_FOUND;

  const [reports, fixed, upvotes, comments] = await Promise.all([
    reportRepository.count(reportsByAuthor(id)),
    reportRepository.count(reportsFixedBy(id)),
    reportRepository.sumUpvotesByAuthor(id),
    commentRepository.count({ authorId: id, deletedAt: null }),
  ]);

  return {
    data: {
      id,
      name: user.displayName || user.name,
      avatar: user.avatar ?? null,
      joinedAt: user.createdAt.toISOString(),
      stats: { reports, fixed, upvotes, comments },
    },
    status: 200,
  };
}

export async function listProfileReportsService(
  id: string,
  query: ProfileReportsQueryType,
  viewerId?: string
): Promise<ServiceResult<FeedPage>> {
  if (!(await findActiveUser(id))) return NOT_FOUND;

  const { filter, sortField } = REPORT_TAB_QUERY[query.tab];
  const conditions = [filter(id), ...(query.after ? [cursorCondition(sortField, query.after)] : [])];
  const reports = await reportRepository.findFeed({ $and: conditions }, { [sortField]: -1, _id: -1 }, FEED_PAGE_SIZE + 1);
  const page = reports.slice(0, FEED_PAGE_SIZE);
  const last = page.at(-1);
  const nextCursor =
    reports.length > FEED_PAGE_SIZE && last ? encodeCursor(sortValue(last, sortField), last._id.toString()) : null;

  return { data: { items: await buildReportCards(page, viewerId), nextCursor }, status: 200 };
}

export async function listProfileCommentsService(
  id: string,
  query: ProfileCommentsQueryType
): Promise<ServiceResult<ProfileCommentPage>> {
  if (!(await findActiveUser(id))) return NOT_FOUND;

  const filter: QueryFilter<CommentDocument> = { authorId: id, deletedAt: null };
  if (query.after) {
    const { value, id: lastId } = decodeCursor(query.after);
    const createdAt = new Date(value);
    filter.$or = [{ createdAt: { $lt: createdAt } }, { createdAt, _id: { $lt: lastId } }];
  }

  const comments = await commentRepository.findByAuthor(filter, FEED_PAGE_SIZE + 1);
  const page = comments.slice(0, FEED_PAGE_SIZE);
  const last = page.at(-1);
  const nextCursor =
    comments.length > FEED_PAGE_SIZE && last ? encodeCursor(last.createdAt.getTime(), last._id.toString()) : null;

  const reports = await reportRepository.findByIds([...new Set(page.map((comment) => comment.reportId.toString()))]);
  const reportById = new Map(reports.map((report) => [report._id.toString(), report]));

  return {
    data: {
      // Comments on removed reports stay out of public view
      items: page.flatMap((comment) => {
        const report = reportById.get(comment.reportId.toString());
        if (!report || report.hidden) return [];
        return [
          {
            id: comment._id.toString(),
            body: comment.body,
            createdAt: comment.createdAt.toISOString(),
            report: { shortId: report.shortId, slug: report.slug, title: report.title },
          },
        ];
      }),
      nextCursor,
    },
    status: 200,
  };
}
