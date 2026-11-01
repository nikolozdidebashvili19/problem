import { cache } from 'react';

import { listCommentsService } from '@/features/comments/service/comment.service';
import { CommentPage } from '@/features/comments/types/comment.types';
import { getReportDetailService } from '@/features/reports/service/report-detail.service';
import { RemovedReport, ReportDetail } from '@/features/reports/types/report.types';
import { getViewer } from '@/shared/middleware/get-viewer';

export type ReportPageData =
  | { kind: 'not-found' }
  | { kind: 'removed'; report: RemovedReport }
  | { kind: 'ok'; report: ReportDetail; comments: CommentPage; signedIn: boolean };

// Memoised per request: generateMetadata and the page share one DB round trip
export const loadReportPageService = cache(async (shortId: string): Promise<ReportPageData> => {
  const viewer = await getViewer();
  const detail = await getReportDetailService(shortId, viewer);
  if ('removed' in detail.data) return { kind: 'removed', report: detail.data };
  if (!('id' in detail.data)) return { kind: 'not-found' };

  const comments = await listCommentsService(
    shortId,
    {},
    viewer ? { id: viewer._id.toString(), role: viewer.role } : null
  );
  return {
    kind: 'ok',
    report: detail.data,
    comments: 'items' in comments.data ? comments.data : { items: [], nextCursor: null },
    signedIn: viewer !== null,
  };
});
