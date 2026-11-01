import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/comments/repository/comment.repository', () => ({
  commentRepository: { findPage: vi.fn(), findById: vi.fn(), create: vi.fn(), softDelete: vi.fn() },
}));
vi.mock('@/features/reports/repository/report.repository', () => ({
  reportRepository: { findByShortId: vi.fn(), incrementCommentCount: vi.fn() },
}));
vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: { findPublicByIds: vi.fn() },
}));
vi.mock('@/features/notifications/service/notification.service', () => ({
  notifyService: vi.fn(),
}));

import { userRepository } from '@/features/auth/repository/user.repository';
import { commentRepository } from '@/features/comments/repository/comment.repository';
import { notifyService } from '@/features/notifications/service/notification.service';
import { reportRepository } from '@/features/reports/repository/report.repository';

import { createCommentService, deleteCommentService, listCommentsService } from './comment.service';

const mockComments = vi.mocked(commentRepository);
const mockReports = vi.mocked(reportRepository);
const mockUsers = vi.mocked(userRepository);
const mockNotify = vi.mocked(notifyService);

const AUTHOR_ID = '507f1f77bcf86cd799439011';
const COMMENTER_ID = '507f1f77bcf86cd799439022';
const REPORT_ID = '507f1f77bcf86cd799439033';
const COMMENT_ID = '507f1f77bcf86cd799439044';

const oid = (value: string) => ({ toString: () => value });
const user = (id: string, role = 'citizen') => ({ _id: oid(id), role }) as never;

const report = { _id: oid(REPORT_ID), authorId: oid(AUTHOR_ID), hidden: false } as never;

function fakeComment(overrides: Record<string, unknown> = {}) {
  return {
    _id: oid(COMMENT_ID),
    reportId: oid(REPORT_ID),
    authorId: oid(COMMENTER_ID),
    body: 'Same here, it is dangerous',
    createdAt: new Date('2026-11-01T10:00:00Z'),
    ...overrides,
  } as never;
}

describe('createCommentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUsers.findPublicByIds.mockResolvedValue([{ _id: oid(COMMENTER_ID), name: 'Nika', displayName: 'nika' }] as never);
  });

  it('creates the comment, bumps the counter and notifies the report author', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(report);
    mockComments.create.mockResolvedValueOnce(fakeComment());
    const result = await createCommentService(user(COMMENTER_ID), 'abcd2345', { body: 'Same here, it is dangerous' });
    expect(result.status).toBe(201);
    expect(result.data).toMatchObject({ body: 'Same here, it is dangerous', authorName: 'nika', canDelete: true });
    expect(mockReports.incrementCommentCount).toHaveBeenCalledWith(REPORT_ID, 1);
    expect(mockNotify).toHaveBeenCalledWith([
      { userId: AUTHOR_ID, type: 'comment', reportId: REPORT_ID, actorId: COMMENTER_ID },
    ]);
  });

  it('refuses comments on removed reports', async () => {
    mockReports.findByShortId.mockResolvedValueOnce({ ...(report as object), hidden: true } as never);
    expect((await createCommentService(user(COMMENTER_ID), 'abcd2345', { body: 'hi' })).status).toBe(404);
    expect(mockComments.create).not.toHaveBeenCalled();
  });
});

describe('listCommentsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists live comments oldest first and marks which the viewer may delete', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(report);
    mockComments.findPage.mockResolvedValueOnce([fakeComment()]);
    mockUsers.findPublicByIds.mockResolvedValueOnce([]);
    const result = await listCommentsService('abcd2345', {}, { id: AUTHOR_ID, role: 'citizen' });
    expect(mockComments.findPage).toHaveBeenCalledWith({ reportId: expect.anything(), deletedAt: null }, 51);
    expect(result.data).toMatchObject({ items: [{ id: COMMENT_ID, authorName: null, canDelete: false }], nextCursor: null });
  });
});

describe('deleteCommentService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lets the comment author delete and decrements the counter once', async () => {
    mockComments.findById.mockResolvedValueOnce(fakeComment());
    mockComments.softDelete.mockResolvedValueOnce(true);
    expect((await deleteCommentService(user(COMMENTER_ID), COMMENT_ID)).status).toBe(200);
    expect(mockReports.incrementCommentCount).toHaveBeenCalledWith(REPORT_ID, -1);
  });

  it('lets moderators delete but forbids other citizens', async () => {
    mockComments.findById.mockResolvedValue(fakeComment());
    mockComments.softDelete.mockResolvedValue(true);
    expect((await deleteCommentService(user(AUTHOR_ID), COMMENT_ID)).status).toBe(403);
    expect((await deleteCommentService(user(AUTHOR_ID, 'moderator'), COMMENT_ID)).status).toBe(200);
  });
});
