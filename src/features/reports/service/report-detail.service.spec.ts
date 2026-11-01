import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/reports/repository/report.repository', () => ({
  reportRepository: { findByShortId: vi.fn() },
}));
vi.mock('@/features/reports/repository/status-event.repository', () => ({
  statusEventRepository: { findByReport: vi.fn() },
}));
vi.mock('@/features/reports/service/report-card.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/reports/service/report-card.service')>()),
  buildReportCards: vi.fn(),
}));

import { reportRepository } from '@/features/reports/repository/report.repository';
import { statusEventRepository } from '@/features/reports/repository/status-event.repository';
import { buildReportCards } from '@/features/reports/service/report-card.service';

import { getReportDetailService } from './report-detail.service';

const mockReports = vi.mocked(reportRepository);
const mockEvents = vi.mocked(statusEventRepository);
const mockCards = vi.mocked(buildReportCards);

const AUTHOR_ID = '507f1f77bcf86cd799439011';
const OTHER_ID = '507f1f77bcf86cd799439022';
const REPORT_ID = '507f1f77bcf86cd799439033';

const oid = (value: string) => ({ toString: () => value });
const user = (id: string, role = 'citizen') => ({ _id: oid(id), role }) as never;

function fakeReport(overrides: Record<string, unknown> = {}) {
  return {
    _id: oid(REPORT_ID),
    shortId: 'abcd2345',
    authorId: oid(AUTHOR_ID),
    description: 'Full description text',
    status: 'reported',
    hidden: false,
    location: { region: 'tbilisi', municipality: 'tbilisi-vake' },
    categorySlug: 'roads',
    images: [],
    ...overrides,
  } as never;
}

describe('getReportDetailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCards.mockResolvedValue([{ id: REPORT_ID, shortId: 'abcd2345' }] as never);
    mockEvents.findByReport.mockResolvedValue([
      { to: 'reported', createdAt: new Date('2026-11-01T10:00:00Z'), note: undefined },
    ] as never);
  });

  it('returns 404 for unknown reports and 410 with the status for removed ones', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(null);
    expect((await getReportDetailService('nope', null)).status).toBe(404);

    mockReports.findByShortId.mockResolvedValueOnce(fakeReport({ hidden: true, status: 'removed' }));
    expect(await getReportDetailService('abcd2345', null)).toEqual({ data: { removed: true, status: 'removed' }, status: 410 });
  });

  it('gives owner actions only to the author', async () => {
    mockReports.findByShortId.mockResolvedValue(fakeReport());
    const owner = (await getReportDetailService('abcd2345', user(AUTHOR_ID))).data;
    expect(owner).toMatchObject({ isOwner: true, canEdit: true, canMarkFixed: true, canDelete: true });

    const stranger = (await getReportDetailService('abcd2345', user(OTHER_ID))).data;
    expect(stranger).toMatchObject({ isOwner: false, canEdit: false, canMarkFixed: false, canDelete: false });

    const guest = (await getReportDetailService('abcd2345', null)).data;
    expect(guest).toMatchObject({
      isOwner: false,
      canDelete: false,
      locationSlug: 'tbilisi-vake',
      description: 'Full description text',
      timeline: [{ to: 'reported', at: '2026-11-01T10:00:00.000Z', note: null }],
    });
  });

  it('lets moderators manage any report but not edit-lock bypass for authors', async () => {
    mockReports.findByShortId.mockResolvedValue(fakeReport({ status: 'in_progress' }));
    const moderator = (await getReportDetailService('abcd2345', user(OTHER_ID, 'moderator'))).data;
    expect(moderator).toMatchObject({ isOwner: false, canEdit: true, canDelete: true });

    const author = (await getReportDetailService('abcd2345', user(AUTHOR_ID))).data;
    expect(author).toMatchObject({ isOwner: true, canEdit: false, canMarkFixed: true });
  });

  it('closes the fix action once the report is fixed', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport({ status: 'fixed' }));
    const owner = (await getReportDetailService('abcd2345', user(AUTHOR_ID))).data;
    expect(owner).toMatchObject({ canMarkFixed: false });
  });
});
