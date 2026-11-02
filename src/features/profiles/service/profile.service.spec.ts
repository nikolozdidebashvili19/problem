import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: { findById: vi.fn() },
}));
vi.mock('@/features/comments/repository/comment.repository', () => ({
  commentRepository: { count: vi.fn(), findByAuthor: vi.fn() },
}));
vi.mock('@/features/reports/repository/report.repository', () => ({
  reportRepository: { count: vi.fn(), sumUpvotesByAuthor: vi.fn(), findFeed: vi.fn(), findByIds: vi.fn() },
}));
vi.mock('@/features/reports/service/report-card.service', () => ({
  buildReportCards: vi.fn(async () => []),
}));

import { userRepository } from '@/features/auth/repository/user.repository';
import { commentRepository } from '@/features/comments/repository/comment.repository';
import { reportRepository } from '@/features/reports/repository/report.repository';

import { getProfileService, listProfileCommentsService, listProfileReportsService } from './profile.service';

const mockUsers = vi.mocked(userRepository);
const mockComments = vi.mocked(commentRepository);
const mockReports = vi.mocked(reportRepository);

const USER_ID = '507f1f77bcf86cd799439011';
const REPORT_ID = '507f1f77bcf86cd799439033';
const REMOVED_REPORT_ID = '507f1f77bcf86cd799439044';
const COMMENT_ID = '507f1f77bcf86cd799439055';

const oid = (value: string) => ({ toString: () => value });
const fakeUser = (overrides: Record<string, unknown> = {}) =>
  ({
    _id: oid(USER_ID),
    name: 'Nika Real',
    displayName: 'nika',
    email: 'private@example.com',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    ...overrides,
  }) as never;

describe('getProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReports.count.mockResolvedValueOnce(7).mockResolvedValueOnce(3);
    mockReports.sumUpvotesByAuthor.mockResolvedValue(42);
    mockComments.count.mockResolvedValue(5);
  });

  it('returns public fields and activity counts', async () => {
    mockUsers.findById.mockResolvedValueOnce(fakeUser());
    const result = await getProfileService(USER_ID);
    expect(result).toEqual({
      data: {
        id: USER_ID,
        name: 'nika',
        avatar: null,
        joinedAt: '2026-01-01T00:00:00.000Z',
        stats: { reports: 7, fixed: 3, upvotes: 42, comments: 5 },
      },
      status: 200,
    });
    expect(JSON.stringify(result.data)).not.toContain('private@example.com');
  });

  it('counts only visible reports, and fixes credited to this user', async () => {
    mockUsers.findById.mockResolvedValueOnce(fakeUser());
    await getProfileService(USER_ID);
    expect(mockReports.count).toHaveBeenCalledWith({ authorId: USER_ID, hidden: false });
    expect(mockReports.count).toHaveBeenCalledWith({ 'fixEvidence.by': USER_ID, status: 'fixed', hidden: false });
    expect(mockComments.count).toHaveBeenCalledWith({ authorId: USER_ID, deletedAt: null });
  });

  it('is 404 for unknown users, deleted accounts and malformed ids', async () => {
    mockUsers.findById.mockResolvedValueOnce(null);
    expect((await getProfileService(USER_ID)).status).toBe(404);
    mockUsers.findById.mockResolvedValueOnce(fakeUser({ deletedAt: new Date() }));
    expect((await getProfileService(USER_ID)).status).toBe(404);
    mockUsers.findById.mockClear();
    expect((await getProfileService('not-an-id')).status).toBe(404);
    expect(mockUsers.findById).not.toHaveBeenCalled();
  });
});

describe('listProfileReportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsers.findById.mockResolvedValue(fakeUser());
    mockReports.findFeed.mockResolvedValue([]);
  });

  it('lists the user’s reports newest first', async () => {
    await listProfileReportsService(USER_ID, { tab: 'reports' });
    expect(mockReports.findFeed).toHaveBeenCalledWith(
      { $and: [{ authorId: USER_ID, hidden: false }] },
      { createdAt: -1, _id: -1 },
      21
    );
  });

  it('lists fixes by fix date and continues from the cursor', async () => {
    await listProfileReportsService(USER_ID, { tab: 'fixed', after: `1767225600000_${REPORT_ID}` });
    const [filter, sort] = mockReports.findFeed.mock.calls[0];
    expect(sort).toEqual({ fixedAt: -1, _id: -1 });
    expect(filter.$and?.[0]).toEqual({ 'fixEvidence.by': USER_ID, status: 'fixed', hidden: false });
    expect(filter.$and?.[1]).toHaveProperty('$or');
  });
});

describe('listProfileCommentsService', () => {
  const fakeComment = (reportId: string) => ({
    _id: oid(COMMENT_ID),
    reportId: oid(reportId),
    body: 'Same here',
    createdAt: new Date('2026-02-01T00:00:00Z'),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockUsers.findById.mockResolvedValue(fakeUser());
  });

  it('links comments to their report and leaves out removed reports', async () => {
    mockComments.findByAuthor.mockResolvedValueOnce([fakeComment(REPORT_ID), fakeComment(REMOVED_REPORT_ID)] as never);
    mockReports.findByIds.mockResolvedValueOnce([
      { _id: oid(REPORT_ID), shortId: 'abcd2345', slug: 'pothole', title: 'Pothole', hidden: false },
      { _id: oid(REMOVED_REPORT_ID), shortId: 'zzzz2345', slug: 'gone', title: 'Gone', hidden: true },
    ] as never);
    const result = await listProfileCommentsService(USER_ID, {});
    expect(result.data).toEqual({
      items: [
        {
          id: COMMENT_ID,
          body: 'Same here',
          createdAt: '2026-02-01T00:00:00.000Z',
          report: { shortId: 'abcd2345', slug: 'pothole', title: 'Pothole' },
        },
      ],
      nextCursor: null,
    });
  });
});
