import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/notifications/repository/notification.repository', () => ({
  notificationRepository: {
    insertMany: vi.fn(),
    findPage: vi.fn(),
    countUnread: vi.fn(),
    markReadByIds: vi.fn(),
    markAllRead: vi.fn(),
  },
}));
vi.mock('@/features/reports/repository/report.repository', () => ({
  reportRepository: { findByIds: vi.fn() },
}));
vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: { findPublicByIds: vi.fn() },
}));

import { userRepository } from '@/features/auth/repository/user.repository';
import { notificationRepository } from '@/features/notifications/repository/notification.repository';
import { reportRepository } from '@/features/reports/repository/report.repository';

import { listNotificationsService, markNotificationsReadService, notifyService } from './notification.service';

const mockRepo = vi.mocked(notificationRepository);
const mockReports = vi.mocked(reportRepository);
const mockUsers = vi.mocked(userRepository);

const USER_ID = '507f1f77bcf86cd799439011';
const ACTOR_ID = '507f1f77bcf86cd799439022';
const REPORT_ID = '507f1f77bcf86cd799439033';

const oid = (value: string) => ({ toString: () => value });

describe('notifyService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('never notifies people about their own actions', async () => {
    await notifyService([
      { userId: USER_ID, type: 'comment', reportId: REPORT_ID, actorId: USER_ID },
      { userId: ACTOR_ID, type: 'report_fixed', reportId: REPORT_ID, actorId: USER_ID },
    ]);
    expect(mockRepo.insertMany).toHaveBeenCalledWith([
      { userId: ACTOR_ID, type: 'report_fixed', reportId: REPORT_ID, actorId: USER_ID },
    ]);
  });

  it('skips the DB when nothing is deliverable and swallows write errors', async () => {
    await notifyService([{ userId: USER_ID, type: 'comment', reportId: REPORT_ID, actorId: USER_ID }]);
    expect(mockRepo.insertMany).not.toHaveBeenCalled();

    mockRepo.insertMany.mockRejectedValueOnce(new Error('db down'));
    vi.spyOn(console, 'error').mockImplementationOnce(() => undefined);
    await expect(
      notifyService([{ userId: ACTOR_ID, type: 'comment', reportId: REPORT_ID, actorId: USER_ID }])
    ).resolves.toBeUndefined();
  });
});

describe('listNotificationsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('joins report and actor names and hides removed reports', async () => {
    mockRepo.findPage.mockResolvedValueOnce([
      {
        _id: oid('a'.repeat(24)),
        type: 'comment',
        read: false,
        reportId: oid(REPORT_ID),
        actorId: oid(ACTOR_ID),
        createdAt: new Date('2026-11-01T10:00:00Z'),
      },
    ] as never);
    mockReports.findByIds.mockResolvedValueOnce([
      { _id: oid(REPORT_ID), shortId: 'abcd2345', slug: 'pothole', title: 'Pothole', hidden: false },
    ] as never);
    mockUsers.findPublicByIds.mockResolvedValueOnce([{ _id: oid(ACTOR_ID), name: 'Nika', displayName: '' }] as never);

    const result = await listNotificationsService(USER_ID, {});
    expect(mockRepo.findPage).toHaveBeenCalledWith({ userId: USER_ID }, 31);
    expect(result.data).toEqual({
      items: [
        {
          id: 'a'.repeat(24),
          type: 'comment',
          read: false,
          createdAt: '2026-11-01T10:00:00.000Z',
          report: { shortId: 'abcd2345', slug: 'pothole', title: 'Pothole' },
          actorName: 'Nika',
        },
      ],
      nextCursor: null,
    });
  });
});

describe('markNotificationsReadService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('marks specific ids or everything', async () => {
    await markNotificationsReadService(USER_ID, { ids: ['b'.repeat(24)] });
    expect(mockRepo.markReadByIds).toHaveBeenCalledWith(USER_ID, ['b'.repeat(24)]);
    await markNotificationsReadService(USER_ID, {});
    expect(mockRepo.markAllRead).toHaveBeenCalledWith(USER_ID);
  });
});
