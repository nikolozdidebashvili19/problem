import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/reports/repository/report.repository', () => ({
  reportRepository: { findByShortId: vi.fn(), incrementUpvotes: vi.fn() },
}));
vi.mock('@/features/votes/repository/vote.repository', () => ({
  voteRepository: { insertIfAbsent: vi.fn(), deleteOne: vi.fn() },
}));

import { reportRepository } from '@/features/reports/repository/report.repository';
import { voteRepository } from '@/features/votes/repository/vote.repository';

import { setVoteService } from './vote.service';

const mockReports = vi.mocked(reportRepository);
const mockVotes = vi.mocked(voteRepository);

const oid = (value: string) => ({ toString: () => value });

const VOTER = { _id: oid('507f1f77bcf86cd799439022') } as never;
const REPORT_ID = '507f1f77bcf86cd799439033';

function fakeReport(overrides: Record<string, unknown> = {}) {
  return {
    _id: oid(REPORT_ID),
    authorId: oid('507f1f77bcf86cd799439011'),
    status: 'reported',
    hidden: false,
    upvoteCount: 4,
    ...overrides,
  } as never;
}

describe('setVoteService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 for missing or hidden reports', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(null);
    expect((await setVoteService(VOTER, 'abc', { voted: true })).status).toBe(404);
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport({ hidden: true }));
    expect((await setVoteService(VOTER, 'abc', { voted: true })).status).toBe(404);
  });

  it('blocks voting on your own report', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport({ authorId: oid('507f1f77bcf86cd799439022') }));
    expect(await setVoteService(VOTER, 'abc', { voted: true })).toEqual({ data: { error: 'OWN_REPORT' }, status: 403 });
  });

  it('freezes votes on fixed reports', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport({ status: 'fixed' }));
    expect(await setVoteService(VOTER, 'abc', { voted: true })).toEqual({
      data: { error: 'VOTING_CLOSED' },
      status: 409,
    });
  });

  it('adds a vote and increments the counter', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport());
    mockVotes.insertIfAbsent.mockResolvedValueOnce(true);
    mockReports.incrementUpvotes.mockResolvedValueOnce({ upvoteCount: 5 } as never);
    const result = await setVoteService(VOTER, 'abc', { voted: true });
    expect(mockReports.incrementUpvotes).toHaveBeenCalledWith(REPORT_ID, 1);
    expect(result).toEqual({ data: { voted: true, upvoteCount: 5 }, status: 200 });
  });

  it('is idempotent when the vote already exists', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport());
    mockVotes.insertIfAbsent.mockResolvedValueOnce(false);
    const result = await setVoteService(VOTER, 'abc', { voted: true });
    expect(mockReports.incrementUpvotes).not.toHaveBeenCalled();
    expect(result.data).toEqual({ voted: true, upvoteCount: 4 });
  });

  it('removes a vote and decrements the counter', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport());
    mockVotes.deleteOne.mockResolvedValueOnce(true);
    mockReports.incrementUpvotes.mockResolvedValueOnce({ upvoteCount: 3 } as never);
    const result = await setVoteService(VOTER, 'abc', { voted: false });
    expect(mockReports.incrementUpvotes).toHaveBeenCalledWith(REPORT_ID, -1);
    expect(result.data).toEqual({ voted: false, upvoteCount: 3 });
  });
});
