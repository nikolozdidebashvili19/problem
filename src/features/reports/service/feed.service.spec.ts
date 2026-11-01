import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/reports/repository/report.repository', () => ({
  reportRepository: { findFeed: vi.fn() },
}));
vi.mock('@/features/categories/repository/category.repository', () => ({
  categoryRepository: { findBySlugs: vi.fn() },
}));
vi.mock('@/features/locations/repository/location.repository', () => ({
  locationRepository: { findBySlugs: vi.fn() },
}));
vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: { findPublicByIds: vi.fn() },
}));
vi.mock('@/features/votes/repository/vote.repository', () => ({
  voteRepository: { findByUserAndReports: vi.fn() },
}));

import { userRepository } from '@/features/auth/repository/user.repository';
import { categoryRepository } from '@/features/categories/repository/category.repository';
import { locationRepository } from '@/features/locations/repository/location.repository';
import { reportRepository } from '@/features/reports/repository/report.repository';
import { voteRepository } from '@/features/votes/repository/vote.repository';
import { FEED_PAGE_SIZE } from '@/shared/const/feed.const';

import { decodeCursor, encodeCursor, listFeedService } from './feed.service';

const mockReports = vi.mocked(reportRepository);
const mockCategories = vi.mocked(categoryRepository);
const mockLocations = vi.mocked(locationRepository);
const mockUsers = vi.mocked(userRepository);
const mockVotes = vi.mocked(voteRepository);

const AUTHOR_ID = '507f1f77bcf86cd799439011';
const VIEWER_ID = '507f1f77bcf86cd799439022';

const oid = (value: string) => ({ toString: () => value });

function fakeReport(index: number, overrides: Record<string, unknown> = {}) {
  return {
    _id: oid(index.toString(16).padStart(24, '0')),
    shortId: `short${index}`,
    slug: `report-${index}`,
    authorId: oid(AUTHOR_ID),
    title: `Report ${index}`,
    description: 'A long enough description',
    categorySlug: 'roads',
    location: { region: 'tbilisi', municipality: 'tbilisi-vake', neighborhood: 'tbilisi-vake-bagebi' },
    images: [],
    status: 'reported',
    upvoteCount: 3,
    hotScore: 10 - index,
    createdAt: new Date('2026-10-01T10:00:00Z'),
    ...overrides,
  };
}

function lastFilter() {
  return mockReports.findFeed.mock.calls.at(-1)![0] as { $and: Record<string, unknown>[]; $text?: unknown };
}

describe('cursor encoding', () => {
  it('round-trips value and id, including negative and decimal scores', () => {
    const cursor = encodeCursor(-3.25, '507f1f77bcf86cd799439011');
    expect(decodeCursor(cursor)).toEqual({ value: -3.25, id: '507f1f77bcf86cd799439011' });
  });
});

describe('listFeedService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategories.findBySlugs.mockResolvedValue([
      { slug: 'roads', nameKa: 'გზები', nameEn: 'Roads', icon: 'construction' },
    ] as never);
    mockLocations.findBySlugs.mockResolvedValue([
      { slug: 'tbilisi', nameKa: 'თბილისი', nameEn: 'Tbilisi' },
      { slug: 'tbilisi-vake', nameKa: 'ვაკე', nameEn: 'Vake' },
      { slug: 'tbilisi-vake-bagebi', nameKa: 'ბაგები', nameEn: 'Bagebi' },
    ] as never);
    mockUsers.findPublicByIds.mockResolvedValue([{ _id: oid(AUTHOR_ID), name: 'Nino B', displayName: 'nino' }] as never);
    mockVotes.findByUserAndReports.mockResolvedValue([]);
  });

  it('popular: open statuses, not hidden, sorted by hotScore', async () => {
    mockReports.findFeed.mockResolvedValueOnce([]);
    await listFeedService({ tab: 'popular' });
    const [filter, sort, limit] = mockReports.findFeed.mock.calls[0];
    expect(filter).toEqual({
      $and: [{ status: { $in: ['reported', 'acknowledged', 'in_progress', 'fix_pending', 'reopened'] }, hidden: false }],
    });
    expect(sort).toEqual({ hotScore: -1, _id: -1 });
    expect(limit).toBe(FEED_PAGE_SIZE + 1);
  });

  it('fixed: only fixed reports, newest fix first', async () => {
    mockReports.findFeed.mockResolvedValueOnce([]);
    await listFeedService({ tab: 'fixed' });
    const [filter, sort] = mockReports.findFeed.mock.calls[0];
    expect(filter).toEqual({ $and: [{ status: { $in: ['fixed'] }, hidden: false }] });
    expect(sort).toEqual({ fixedAt: -1, _id: -1 });
  });

  it('applies category, location (any level) and text search', async () => {
    mockReports.findFeed.mockResolvedValueOnce([]);
    await listFeedService({ tab: 'new', category: 'roads', location: 'tbilisi-vake', q: 'pothole' });
    const filter = lastFilter();
    expect(filter.$and).toContainEqual({ categorySlug: 'roads' });
    expect(filter.$and).toContainEqual({
      $or: [
        { 'location.region': 'tbilisi-vake' },
        { 'location.municipality': 'tbilisi-vake' },
        { 'location.neighborhood': 'tbilisi-vake' },
      ],
    });
    expect(filter.$text).toEqual({ $search: 'pothole' });
  });

  it('translates a date cursor into a keyset condition', async () => {
    mockReports.findFeed.mockResolvedValueOnce([]);
    const ms = Date.parse('2026-10-01T10:00:00Z');
    await listFeedService({ tab: 'new', after: `${ms}_507f1f77bcf86cd799439011` });
    expect(lastFilter().$and).toContainEqual({
      $or: [
        { createdAt: { $lt: new Date(ms) } },
        { createdAt: new Date(ms), _id: { $lt: '507f1f77bcf86cd799439011' } },
      ],
    });
  });

  it('returns a next cursor only when there are more results', async () => {
    const reports = Array.from({ length: FEED_PAGE_SIZE + 1 }, (_, i) => fakeReport(i + 1));
    mockReports.findFeed.mockResolvedValueOnce(reports as never);
    const result = await listFeedService({ tab: 'popular' });
    const data = result.data as { items: unknown[]; nextCursor: string | null };
    expect(data.items).toHaveLength(FEED_PAGE_SIZE);
    const last = reports[FEED_PAGE_SIZE - 1];
    expect(data.nextCursor).toBe(`${last.hotScore}_${last._id.toString()}`);

    mockReports.findFeed.mockResolvedValueOnce([fakeReport(1)] as never);
    const single = await listFeedService({ tab: 'popular' });
    expect((single.data as { nextCursor: string | null }).nextCursor).toBeNull();
  });

  it('builds cards with names, most specific location first, and the viewer vote', async () => {
    const report = fakeReport(1);
    mockReports.findFeed.mockResolvedValueOnce([report] as never);
    mockVotes.findByUserAndReports.mockResolvedValueOnce([{ reportId: report._id }] as never);
    const result = await listFeedService({ tab: 'popular' }, VIEWER_ID);
    const [card] = (result.data as { items: Record<string, unknown>[] }).items;
    expect(card).toMatchObject({
      shortId: 'short1',
      category: { slug: 'roads', nameEn: 'Roads' },
      locations: [{ slug: 'tbilisi-vake-bagebi' }, { slug: 'tbilisi-vake' }, { slug: 'tbilisi' }],
      authorName: 'nino',
      hasVoted: true,
      canVote: true,
      createdAt: '2026-10-01T10:00:00.000Z',
    });
  });

  it('marks own and closed reports as not votable', async () => {
    mockReports.findFeed.mockResolvedValueOnce([fakeReport(1), fakeReport(2, { status: 'fixed' })] as never);
    const result = await listFeedService({ tab: 'popular' }, AUTHOR_ID);
    const items = (result.data as { items: { canVote: boolean }[] }).items;
    expect(items.map((item) => item.canVote)).toEqual([false, false]);
  });

  it('skips vote lookups for guests and hides deleted authors', async () => {
    mockReports.findFeed.mockResolvedValueOnce([fakeReport(1)] as never);
    mockUsers.findPublicByIds.mockResolvedValueOnce([{ _id: oid(AUTHOR_ID), name: 'Nino', deletedAt: new Date() }] as never);
    const result = await listFeedService({ tab: 'popular' });
    expect(mockVotes.findByUserAndReports).not.toHaveBeenCalled();
    expect((result.data as { items: { authorName: string | null }[] }).items[0].authorName).toBeNull();
  });
});
