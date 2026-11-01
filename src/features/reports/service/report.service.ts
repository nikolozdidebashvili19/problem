import { userRepository } from '@/features/auth/repository/user.repository';
import { UserDocument } from '@/features/auth/schema/user.schema';
import { categoryRepository } from '@/features/categories/repository/category.repository';
import { getLocationChainService } from '@/features/locations/service/location.service';
import { notifyService } from '@/features/notifications/service/notification.service';
import { reportRepository } from '@/features/reports/repository/report.repository';
import { statusEventRepository } from '@/features/reports/repository/status-event.repository';
import { ReportDocument } from '@/features/reports/schema/report.schema';
import { isVotableStatus } from '@/features/reports/service/report-card.service';
import {
  checkPostingLimits,
  EDITABLE_STATUSES,
  isAuthor,
  isModerator,
  validateImages,
} from '@/features/reports/service/report-rules.service';
import {
  CreateReportType,
  MarkFixedType,
  UpdateReportType,
} from '@/features/reports/validations/report.validation';
import { voteRepository } from '@/features/votes/repository/vote.repository';
import { MAX_FIX_NOTIFICATIONS } from '@/shared/const/reports.const';
import { ServiceResult } from '@/shared/types/common';
import { isInsideGeorgiaBBox, toGeoPoint } from '@/shared/utils/geo';
import { computeHotScore } from '@/shared/utils/hot-score';
import { generateShortId } from '@/shared/utils/short-id';
import { slugify } from '@/shared/utils/slugify';

const DAY_MS = 24 * 60 * 60 * 1000;


type ReportRef = { shortId: string; slug: string };

export async function createReportService(
  user: UserDocument,
  input: CreateReportType,
  now = new Date()
): Promise<ServiceResult<ReportRef>> {
  // Idempotent submit: a retried request returns the report created by the first one
  const existing = await reportRepository.findByIdempotencyKey(input.idempotencyKey);
  if (existing) return { data: { shortId: existing.shortId, slug: existing.slug }, status: 200 };

  const limitError = await checkPostingLimits(user, now);
  if (limitError) return { data: { error: limitError }, status: 429 };

  const imageError = validateImages(input.images);
  if (imageError) return { data: { error: imageError }, status: 400 };

  const category = await categoryRepository.findBySlug(input.categorySlug);
  if (!category || !category.active) return { data: { error: 'INVALID_CATEGORY' }, status: 400 };

  const chain = await getLocationChainService(input.locationSlug);
  if (!chain) return { data: { error: 'INVALID_LOCATION' }, status: 400 };
  if (chain.region.reportingDisabled) return { data: { error: 'REPORTING_DISABLED' }, status: 400 };

  const coordinates = input.point ?? chain.leaf.centroid.coordinates;
  const [lng, lat] = coordinates;
  if (!isInsideGeorgiaBBox([lng, lat])) return { data: { error: 'OUTSIDE_GEORGIA' }, status: 400 };

  const report = await reportRepository.create({
    shortId: generateShortId(),
    slug: slugify(input.title),
    authorId: user._id,
    title: input.title,
    description: input.description,
    categorySlug: category.slug,
    severity: input.severity,
    location: {
      region: chain.region.slug,
      municipality: chain.municipality?.slug,
      neighborhood: chain.neighborhood?.slug,
    },
    locationMismatch: false,
    point: toGeoPoint(lng, lat),
    addressHint: input.addressHint || undefined,
    images: input.images,
    status: 'reported',
    upvoteCount: 0,
    hotScore: computeHotScore(0, now),
    flagCount: 0,
    hidden: false,
    idempotencyKey: input.idempotencyKey,
  });

  await Promise.all([
    statusEventRepository.create({ reportId: report._id.toString(), actorId: user._id.toString(), to: 'reported' }),
    userRepository.incrementReportsCount(user._id.toString()),
  ]);

  return { data: { shortId: report.shortId, slug: report.slug }, status: 201 };
}

async function findManageableReport(
  user: UserDocument,
  shortId: string
): Promise<{ report: ReportDocument } | { error: string; status: number }> {
  const report = await reportRepository.findByShortId(shortId);
  if (!report || report.hidden) return { error: 'NOT_FOUND', status: 404 };
  if (!isAuthor(report, user._id.toString()) && !isModerator(user)) return { error: 'FORBIDDEN', status: 403 };
  return { report };
}

export async function updateReportService(
  user: UserDocument,
  shortId: string,
  input: UpdateReportType,
  now = new Date()
): Promise<ServiceResult<ReportRef>> {
  const found = await findManageableReport(user, shortId);
  if ('error' in found) return { data: { error: found.error }, status: found.status };
  const { report } = found;
  if (!isModerator(user) && !EDITABLE_STATUSES.includes(report.status)) {
    return { data: { error: 'EDIT_LOCKED' }, status: 409 };
  }

  const category = await categoryRepository.findBySlug(input.categorySlug);
  if (!category) return { data: { error: 'INVALID_CATEGORY' }, status: 400 };

  // Old links keep working: pages resolve by shortId and redirect to the new slug
  const updated = await reportRepository.updateById(report._id.toString(), {
    $set: {
      title: input.title,
      slug: slugify(input.title),
      description: input.description,
      categorySlug: category.slug,
      addressHint: input.addressHint || undefined,
      severity: input.severity,
    },
    $push: { editHistory: { title: report.title, description: report.description, editedAt: now } },
  });
  if (!updated) return { data: { error: 'NOT_FOUND' }, status: 404 };
  return { data: { shortId: updated.shortId, slug: updated.slug }, status: 200 };
}

// Soft delete: the report disappears from feeds but history and votes stay for moderation
export async function deleteReportService(user: UserDocument, shortId: string): Promise<ServiceResult<{ ok: true }>> {
  const found = await findManageableReport(user, shortId);
  if ('error' in found) return { data: { error: found.error }, status: found.status };
  const { report } = found;

  await reportRepository.updateById(report._id.toString(), { $set: { hidden: true, status: 'removed' } });
  await statusEventRepository.create({
    reportId: report._id.toString(),
    actorId: user._id.toString(),
    from: report.status,
    to: 'removed',
  });
  return { data: { ok: true }, status: 200 };
}

export async function markReportFixedService(
  user: UserDocument,
  shortId: string,
  input: MarkFixedType,
  now = new Date()
): Promise<ServiceResult<ReportRef>> {
  const found = await findManageableReport(user, shortId);
  if ('error' in found) return { data: { error: found.error }, status: found.status };
  const { report } = found;
  if (!isVotableStatus(report.status)) return { data: { error: 'ALREADY_CLOSED' }, status: 409 };

  const imageError = validateImages(input.images);
  if (imageError) return { data: { error: imageError }, status: 400 };

  const reportId = report._id.toString();
  const userId = user._id.toString();
  await reportRepository.updateById(reportId, {
    $set: {
      status: 'fixed',
      fixedAt: now,
      daysToFix: Math.max(0, Math.round((now.getTime() - report.createdAt.getTime()) / DAY_MS)),
      fixEvidence: { note: input.note || undefined, images: input.images, by: user._id },
    },
  });
  await statusEventRepository.create({ reportId, actorId: userId, from: report.status, to: 'fixed', note: input.note });

  // Everyone who upvoted hears about the fix — the platform's real impact (PRODUCT §4.7)
  const voterIds = await voteRepository.findVoterIds(reportId, MAX_FIX_NOTIFICATIONS);
  await notifyService(voterIds.map((voterId) => ({ userId: voterId, type: 'report_fixed', reportId, actorId: userId })));

  return { data: { shortId: report.shortId, slug: report.slug }, status: 200 };
}
