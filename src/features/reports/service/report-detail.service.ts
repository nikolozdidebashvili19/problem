import { UserDocument } from '@/features/auth/schema/user.schema';
import { reportRepository } from '@/features/reports/repository/report.repository';
import { statusEventRepository } from '@/features/reports/repository/status-event.repository';
import { buildReportCards, isVotableStatus } from '@/features/reports/service/report-card.service';
import { EDITABLE_STATUSES, isAuthor, isModerator } from '@/features/reports/service/report-rules.service';
import { RemovedReport, ReportDetail, ReportStatus } from '@/features/reports/types/report.types';
import { ServiceResult } from '@/shared/types/common';

// Everything the report page needs, including which owner/moderator actions the viewer may take
export async function getReportDetailService(
  shortId: string,
  viewer: UserDocument | null
): Promise<ServiceResult<ReportDetail | RemovedReport>> {
  const report = await reportRepository.findByShortId(shortId);
  if (!report) return { data: { error: 'NOT_FOUND' }, status: 404 };
  if (report.hidden) return { data: { removed: true, status: report.status as ReportStatus }, status: 410 };

  const viewerId = viewer?._id.toString();
  const [[card], events] = await Promise.all([
    buildReportCards([report], viewerId),
    statusEventRepository.findByReport(report._id.toString()),
  ]);

  const owner = isAuthor(report, viewerId);
  const moderator = viewer !== null && isModerator(viewer);
  const manager = owner || moderator;
  const { neighborhood, municipality, region } = report.location ?? {};

  return {
    data: {
      ...card,
      description: report.description,
      images: report.images.map(({ publicId, url, width, height }) => ({ publicId, url, width, height })),
      addressHint: report.addressHint ?? null,
      severity: report.severity ?? null,
      locationSlug: neighborhood || municipality || region || '',
      categorySlug: report.categorySlug,
      fixEvidence: report.fixEvidence
        ? {
          note: report.fixEvidence.note ?? null,
          images: report.fixEvidence.images.map(({ publicId, url, width, height }) => ({ publicId, url, width, height })),
        }
        : null,
      timeline: events.map((event) => ({
        to: event.to as ReportStatus,
        at: event.createdAt.toISOString(),
        note: event.note ?? null,
      })),
      isOwner: owner,
      canEdit: manager && (moderator || EDITABLE_STATUSES.includes(report.status)),
      canMarkFixed: manager && isVotableStatus(report.status),
      canDelete: manager,
    },
    status: 200,
  };
}
