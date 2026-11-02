import { reportRepository } from '@/features/reports/repository/report.repository';
import { ReportDocument } from '@/features/reports/schema/report.schema';
import { buildReportCards } from '@/features/reports/service/report-card.service';
import { FeedPage, FeedTab, ReportStatus } from '@/features/reports/types/report.types';
import { FeedQueryType } from '@/features/reports/validations/report.validation';
import { FEED_PAGE_SIZE } from '@/shared/const/feed.const';
import { OPEN_STATUSES } from '@/shared/const/report-status.const';
import { ServiceResult } from '@/shared/types/common';

import type { QueryFilter } from 'mongoose';

type SortField = 'hotScore' | 'createdAt' | 'fixedAt';

const TAB_QUERY: Record<FeedTab, { statuses: readonly ReportStatus[]; sortField: SortField }> = {
  popular: { statuses: OPEN_STATUSES, sortField: 'hotScore' },
  new: { statuses: OPEN_STATUSES, sortField: 'createdAt' },
  fixed: { statuses: ['fixed'], sortField: 'fixedAt' },
};

export function sortValue(report: ReportDocument, field: SortField): number {
  if (field === 'hotScore') return report.hotScore;
  const date = field === 'createdAt' ? report.createdAt : report.fixedAt;
  return date ? date.getTime() : 0;
}

export function encodeCursor(value: number, id: string): string {
  return `${value}_${id}`;
}

export function decodeCursor(cursor: string): { value: number; id: string } {
  const separator = cursor.lastIndexOf('_');
  return { value: Number(cursor.slice(0, separator)), id: cursor.slice(separator + 1) };
}

// Keyset pagination: (sortValue, _id) strictly after the cursor — never `skip` (PRODUCT §8)
export function cursorCondition(field: SortField, cursor: string): QueryFilter<ReportDocument> {
  const { value, id } = decodeCursor(cursor);
  const typedValue = field === 'hotScore' ? value : new Date(value);
  return { $or: [{ [field]: { $lt: typedValue } }, { [field]: typedValue, _id: { $lt: id } }] };
}

export async function listFeedService(
  query: FeedQueryType,
  viewerId?: string
): Promise<ServiceResult<FeedPage>> {
  const { statuses, sortField } = TAB_QUERY[query.tab];

  const conditions: QueryFilter<ReportDocument>[] = [{ status: { $in: statuses }, hidden: false }];
  if (query.category) conditions.push({ categorySlug: query.category });
  if (query.location) {
    conditions.push({
      $or: [
        { 'location.region': query.location },
        { 'location.municipality': query.location },
        { 'location.neighborhood': query.location },
      ],
    });
  }
  if (query.after) conditions.push(cursorCondition(sortField, query.after));

  const filter: QueryFilter<ReportDocument> = query.q
    ? { $and: conditions, $text: { $search: query.q } }
    : { $and: conditions };

  const reports = await reportRepository.findFeed(filter, { [sortField]: -1, _id: -1 }, FEED_PAGE_SIZE + 1);
  const page = reports.slice(0, FEED_PAGE_SIZE);
  const last = page.at(-1);
  const nextCursor =
    reports.length > FEED_PAGE_SIZE && last ? encodeCursor(sortValue(last, sortField), last._id.toString()) : null;

  return { data: { items: await buildReportCards(page, viewerId), nextCursor }, status: 200 };
}
