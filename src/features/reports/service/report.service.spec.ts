import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/reports/repository/report.repository', () => ({
  reportRepository: {
    findByIdempotencyKey: vi.fn(),
    countByAuthorSince: vi.fn(),
    create: vi.fn(),
    findByShortId: vi.fn(),
    updateById: vi.fn(),
  },
}));
vi.mock('@/features/reports/repository/status-event.repository', () => ({
  statusEventRepository: { create: vi.fn() },
}));
vi.mock('@/features/categories/repository/category.repository', () => ({
  categoryRepository: { findBySlug: vi.fn() },
}));
vi.mock('@/features/locations/service/location.service', () => ({
  getLocationChainService: vi.fn(),
}));
vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: { incrementReportsCount: vi.fn() },
}));
vi.mock('@/features/votes/repository/vote.repository', () => ({
  voteRepository: { findVoterIds: vi.fn() },
}));
vi.mock('@/features/notifications/service/notification.service', () => ({
  notifyService: vi.fn(),
}));
vi.mock('@/shared/lib/cloudinary', () => ({
  cloudinary: { isConfigured: vi.fn(() => false), isOwnedImage: vi.fn(() => true) },
}));

import { categoryRepository } from '@/features/categories/repository/category.repository';
import { getLocationChainService } from '@/features/locations/service/location.service';
import { notifyService } from '@/features/notifications/service/notification.service';
import { reportRepository } from '@/features/reports/repository/report.repository';
import { statusEventRepository } from '@/features/reports/repository/status-event.repository';
import { voteRepository } from '@/features/votes/repository/vote.repository';
import { cloudinary } from '@/shared/lib/cloudinary';

import {
  createReportService,
  deleteReportService,
  markReportFixedService,
  updateReportService,
} from './report.service';

const mockReports = vi.mocked(reportRepository);
const mockEvents = vi.mocked(statusEventRepository);
const mockCategories = vi.mocked(categoryRepository);
const mockChain = vi.mocked(getLocationChainService);
const mockVotes = vi.mocked(voteRepository);
const mockNotify = vi.mocked(notifyService);
const mockCloudinary = vi.mocked(cloudinary);

const NOW = new Date('2026-11-01T12:00:00Z');
const AUTHOR_ID = '507f1f77bcf86cd799439011';
const OTHER_ID = '507f1f77bcf86cd799439022';
const REPORT_ID = '507f1f77bcf86cd799439033';

const oid = (value: string) => ({ toString: () => value, equals: (other: { toString(): string }) => other.toString() === value });

function fakeUser(id = AUTHOR_ID, overrides: Record<string, unknown> = {}) {
  return { _id: oid(id), role: 'citizen', createdAt: new Date('2026-01-01'), ...overrides } as never;
}

function fakeReport(overrides: Record<string, unknown> = {}) {
  return {
    _id: oid(REPORT_ID),
    shortId: 'abcd2345',
    slug: 'old-title',
    authorId: oid(AUTHOR_ID),
    title: 'Old title',
    description: 'Old description text',
    status: 'reported',
    hidden: false,
    createdAt: new Date('2026-10-29T12:00:00Z'),
    location: { region: 'tbilisi', municipality: 'tbilisi-vake' },
    categorySlug: 'roads',
    images: [],
    ...overrides,
  } as never;
}

const createInput = {
  title: 'Pothole near the school',
  description: 'Deep pothole right at the crossing',
  categorySlug: 'roads',
  locationSlug: 'tbilisi-vake-bagebi',
  images: [],
  idempotencyKey: '3f2b6c1e-8d4a-4f6b-9c2d-1a2b3c4d5e6f',
};

const chain = {
  leaf: { slug: 'tbilisi-vake-bagebi', centroid: { coordinates: [44.733, 41.702] } },
  region: { slug: 'tbilisi', reportingDisabled: false },
  municipality: { slug: 'tbilisi-vake' },
  neighborhood: { slug: 'tbilisi-vake-bagebi' },
};

describe('createReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReports.findByIdempotencyKey.mockResolvedValue(null);
    mockReports.countByAuthorSince.mockResolvedValue(0);
    mockCategories.findBySlug.mockResolvedValue({ slug: 'roads', active: true } as never);
    mockChain.mockResolvedValue(chain as never);
    mockReports.create.mockResolvedValue(fakeReport({ shortId: 'new12345', slug: 'pothole-near-the-school' }));
    mockCloudinary.isConfigured.mockReturnValue(false);
  });

  it('creates a report with the full location chain and the leaf centroid as point', async () => {
    const result = await createReportService(fakeUser(), createInput, NOW);
    expect(result).toEqual({ data: { shortId: 'new12345', slug: 'pothole-near-the-school' }, status: 201 });
    expect(mockReports.create).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'pothole-near-the-school',
        location: { region: 'tbilisi', municipality: 'tbilisi-vake', neighborhood: 'tbilisi-vake-bagebi' },
        point: { type: 'Point', coordinates: [44.733, 41.702] },
        status: 'reported',
        upvoteCount: 0,
      })
    );
    expect(mockEvents.create).toHaveBeenCalledWith(expect.objectContaining({ to: 'reported' }));
  });

  it('returns the existing report for a repeated idempotency key', async () => {
    mockReports.findByIdempotencyKey.mockResolvedValueOnce(fakeReport());
    const result = await createReportService(fakeUser(), createInput, NOW);
    expect(result).toEqual({ data: { shortId: 'abcd2345', slug: 'old-title' }, status: 200 });
    expect(mockReports.create).not.toHaveBeenCalled();
  });

  it('enforces the hourly limit and the stricter new-account limit', async () => {
    mockReports.countByAuthorSince.mockResolvedValueOnce(5);
    expect(await createReportService(fakeUser(), createInput, NOW)).toEqual({ data: { error: 'RATE_LIMITED' }, status: 429 });

    const newUser = fakeUser(AUTHOR_ID, { createdAt: new Date(NOW.getTime() - 60 * 60 * 1000) });
    mockReports.countByAuthorSince.mockResolvedValueOnce(2).mockResolvedValueOnce(2);
    expect(await createReportService(newUser, createInput, NOW)).toEqual({
      data: { error: 'NEW_ACCOUNT_LIMIT' },
      status: 429,
    });
  });

  it('requires a photo once uploads are configured', async () => {
    mockCloudinary.isConfigured.mockReturnValue(true);
    expect(await createReportService(fakeUser(), createInput, NOW)).toEqual({ data: { error: 'PHOTO_REQUIRED' }, status: 400 });
  });

  it('rejects inactive categories, unknown locations, occupied territories and points outside Georgia', async () => {
    mockCategories.findBySlug.mockResolvedValueOnce({ slug: 'roads', active: false } as never);
    expect((await createReportService(fakeUser(), createInput, NOW)).data).toEqual({ error: 'INVALID_CATEGORY' });

    mockChain.mockResolvedValueOnce(null);
    expect((await createReportService(fakeUser(), createInput, NOW)).data).toEqual({ error: 'INVALID_LOCATION' });

    mockChain.mockResolvedValueOnce({ ...chain, region: { slug: 'abkhazia', reportingDisabled: true } } as never);
    expect((await createReportService(fakeUser(), createInput, NOW)).data).toEqual({ error: 'REPORTING_DISABLED' });

    const swapped = { ...createInput, point: [41.702, 44.733] as [number, number] };
    expect((await createReportService(fakeUser(), swapped, NOW)).data).toEqual({ error: 'OUTSIDE_GEORGIA' });
  });
});

describe('updateReportService', () => {
  const input = { title: 'New title here', description: 'Updated description', categorySlug: 'lighting' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCategories.findBySlug.mockResolvedValue({ slug: 'lighting', active: true } as never);
    mockReports.updateById.mockResolvedValue(fakeReport({ slug: 'new-title-here' }));
  });

  it('lets the author edit, regenerates the slug and keeps history', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport());
    const result = await updateReportService(fakeUser(), 'abcd2345', input, NOW);
    expect(result.status).toBe(200);
    expect(mockReports.updateById).toHaveBeenCalledWith(REPORT_ID, {
      $set: expect.objectContaining({ title: 'New title here', slug: 'new-title-here', categorySlug: 'lighting' }),
      $push: { editHistory: { title: 'Old title', description: 'Old description text', editedAt: NOW } },
    });
  });

  it('forbids other citizens', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport());
    expect((await updateReportService(fakeUser(OTHER_ID), 'abcd2345', input, NOW)).status).toBe(403);
  });

  it('locks author edits after the first status change, but not for moderators', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport({ status: 'in_progress' }));
    expect(await updateReportService(fakeUser(), 'abcd2345', input, NOW)).toEqual({ data: { error: 'EDIT_LOCKED' }, status: 409 });

    mockReports.findByShortId.mockResolvedValueOnce(fakeReport({ status: 'in_progress' }));
    expect((await updateReportService(fakeUser(OTHER_ID, { role: 'moderator' }), 'abcd2345', input, NOW)).status).toBe(200);
  });
});

describe('deleteReportService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('soft-deletes and records the event', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport());
    expect((await deleteReportService(fakeUser(), 'abcd2345')).status).toBe(200);
    expect(mockReports.updateById).toHaveBeenCalledWith(REPORT_ID, { $set: { hidden: true, status: 'removed' } });
    expect(mockEvents.create).toHaveBeenCalledWith(expect.objectContaining({ from: 'reported', to: 'removed' }));
  });

  it('returns 404 for already removed reports', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport({ hidden: true }));
    expect((await deleteReportService(fakeUser(), 'abcd2345')).status).toBe(404);
  });
});

describe('markReportFixedService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCloudinary.isConfigured.mockReturnValue(false);
    mockVotes.findVoterIds.mockResolvedValue([OTHER_ID]);
  });

  it('marks fixed, stores days to fix and notifies voters', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport());
    const result = await markReportFixedService(fakeUser(), 'abcd2345', { note: 'Patched today', images: [] }, NOW);
    expect(result.status).toBe(200);
    expect(mockReports.updateById).toHaveBeenCalledWith(REPORT_ID, {
      $set: expect.objectContaining({ status: 'fixed', fixedAt: NOW, daysToFix: 3 }),
    });
    expect(mockNotify).toHaveBeenCalledWith([
      { userId: OTHER_ID, type: 'report_fixed', reportId: REPORT_ID, actorId: AUTHOR_ID },
    ]);
  });

  it('refuses reports that are already fixed', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport({ status: 'fixed' }));
    expect((await markReportFixedService(fakeUser(), 'abcd2345', { images: [] }, NOW)).status).toBe(409);
  });

  it('forbids other citizens', async () => {
    mockReports.findByShortId.mockResolvedValueOnce(fakeReport());
    expect((await markReportFixedService(fakeUser(OTHER_ID), 'abcd2345', { images: [] }, NOW)).status).toBe(403);
  });
});
