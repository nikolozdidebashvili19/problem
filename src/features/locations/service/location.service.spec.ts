import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/locations/repository/location.repository', () => ({
  locationRepository: {
    findRoots: vi.fn(),
    findByParent: vi.fn(),
    findBySlug: vi.fn(),
    findContaining: vi.fn(),
    findNearestByCentroid: vi.fn(),
    upsertBySlug: vi.fn(),
  },
}));

import { locationRepository } from '@/features/locations/repository/location.repository';
import { LOCATION_SEED } from '@/shared/const/locations.const';

import { listLocationsService, resolvePointService, seedLocationsService } from './location.service';

const mockRepo = vi.mocked(locationRepository);

function loc(slug: string, level: string, parentSlug?: string, reportingDisabled = false) {
  return { slug, level, parentSlug, nameKa: slug, nameEn: slug, reportingDisabled } as never;
}

const TBILISI = loc('tbilisi', 'region');
const SABURTALO = loc('tbilisi-saburtalo', 'municipality', 'tbilisi');
const DIGHOMI = loc('tbilisi-saburtalo-dighomi-massive', 'neighborhood', 'tbilisi-saburtalo');
const VAKE_BAGEBI = loc('tbilisi-vake-bagebi', 'neighborhood', 'tbilisi-vake');

const IN_TBILISI = { lat: 41.762, lng: 44.765 };

describe('listLocationsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns regions when no parent is given', async () => {
    mockRepo.findRoots.mockResolvedValueOnce([TBILISI]);
    const result = await listLocationsService({});
    expect(mockRepo.findRoots).toHaveBeenCalled();
    expect(result.data).toEqual({ items: [expect.objectContaining({ slug: 'tbilisi', parentSlug: null })] });
  });

  it('returns children of the given parent', async () => {
    mockRepo.findByParent.mockResolvedValueOnce([SABURTALO]);
    await listLocationsService({ parent: 'tbilisi' });
    expect(mockRepo.findByParent).toHaveBeenCalledWith('tbilisi');
  });
});

describe('resolvePointService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rejects points outside Georgia', async () => {
    const result = await resolvePointService({ lat: 40.4093, lng: 49.8671 });
    expect(result).toEqual({ data: { error: 'OUTSIDE_GEORGIA' }, status: 400 });
    expect(mockRepo.findContaining).not.toHaveBeenCalled();
  });

  it('rejects swapped lat/lng', async () => {
    const result = await resolvePointService({ lat: IN_TBILISI.lng, lng: IN_TBILISI.lat });
    expect(result.status).toBe(400);
  });

  it('queries with GeoJSON [lng, lat] order', async () => {
    mockRepo.findContaining.mockResolvedValueOnce([TBILISI, SABURTALO, DIGHOMI]);
    await resolvePointService(IN_TBILISI);
    expect(mockRepo.findContaining).toHaveBeenCalledWith({ type: 'Point', coordinates: [44.765, 41.762] });
  });

  it('uses boundary polygons when available', async () => {
    mockRepo.findContaining.mockResolvedValueOnce([DIGHOMI, TBILISI, SABURTALO]);
    const result = await resolvePointService(IN_TBILISI);
    expect(result.data).toMatchObject({
      region: { slug: 'tbilisi' },
      municipality: { slug: 'tbilisi-saburtalo' },
      neighborhood: { slug: 'tbilisi-saburtalo-dighomi-massive' },
      source: 'boundary',
    });
    expect(mockRepo.findNearestByCentroid).not.toHaveBeenCalled();
  });

  it('fills the region from the municipality parent when only district boundaries exist', async () => {
    mockRepo.findContaining.mockResolvedValueOnce([SABURTALO]);
    mockRepo.findBySlug.mockResolvedValueOnce(TBILISI);
    const result = await resolvePointService(IN_TBILISI);
    expect(mockRepo.findBySlug).toHaveBeenCalledWith('tbilisi');
    expect(result.data).toMatchObject({ region: { slug: 'tbilisi' }, neighborhood: null });
  });

  it('falls back to nearest centroids without boundaries', async () => {
    mockRepo.findContaining.mockResolvedValueOnce([]);
    mockRepo.findNearestByCentroid.mockResolvedValueOnce(SABURTALO).mockResolvedValueOnce(DIGHOMI);
    mockRepo.findBySlug.mockResolvedValueOnce(TBILISI);
    const result = await resolvePointService(IN_TBILISI);
    expect(result.data).toMatchObject({
      region: { slug: 'tbilisi' },
      municipality: { slug: 'tbilisi-saburtalo' },
      neighborhood: { slug: 'tbilisi-saburtalo-dighomi-massive' },
      source: 'centroid',
    });
  });

  it('drops a nearest neighborhood that belongs to another district', async () => {
    mockRepo.findContaining.mockResolvedValueOnce([]);
    mockRepo.findNearestByCentroid.mockResolvedValueOnce(SABURTALO).mockResolvedValueOnce(VAKE_BAGEBI);
    mockRepo.findBySlug.mockResolvedValueOnce(TBILISI);
    const result = await resolvePointService(IN_TBILISI);
    expect(result.data).toMatchObject({ neighborhood: null });
  });

  it('resolves only the region for rural points far from any municipality', async () => {
    mockRepo.findContaining.mockResolvedValueOnce([]);
    mockRepo.findNearestByCentroid.mockResolvedValueOnce(null).mockResolvedValueOnce(loc('kakheti', 'region'));
    const result = await resolvePointService({ lat: 41.65, lng: 45.9 });
    expect(result.data).toMatchObject({ region: { slug: 'kakheti' }, municipality: null, neighborhood: null });
  });

  it('surfaces reportingDisabled for occupied territories', async () => {
    mockRepo.findContaining.mockResolvedValueOnce([loc('abkhazia', 'region', undefined, true)]);
    const result = await resolvePointService({ lat: 43.0, lng: 41.02 });
    expect(result.data).toMatchObject({ region: { slug: 'abkhazia', reportingDisabled: true } });
  });
});

describe('seedLocationsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('upserts every location with a GeoJSON centroid', async () => {
    const result = await seedLocationsService();
    expect(result).toEqual({ count: LOCATION_SEED.length });
    expect(mockRepo.upsertBySlug).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'tbilisi',
        centroid: { type: 'Point', coordinates: [44.8271, 41.7151] },
        reportingDisabled: false,
      })
    );
    expect(mockRepo.upsertBySlug).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'abkhazia', reportingDisabled: true })
    );
  });
});

describe('LOCATION_SEED', () => {
  const slugs = new Set(LOCATION_SEED.map((location) => location.slug));

  it('has unique slugs', () => {
    expect(slugs.size).toBe(LOCATION_SEED.length);
  });

  it('includes all 10 Tbilisi districts', () => {
    expect(LOCATION_SEED.filter((location) => location.parentSlug === 'tbilisi')).toHaveLength(10);
  });

  it('only references existing parents', () => {
    for (const location of LOCATION_SEED) {
      if (location.parentSlug) expect(slugs.has(location.parentSlug)).toBe(true);
    }
  });

  it('stores every centroid inside Georgia in [lng, lat] order', () => {
    for (const { centroid } of LOCATION_SEED) {
      expect(centroid[0]).toBeGreaterThan(39.9);
      expect(centroid[0]).toBeLessThan(46.8);
      expect(centroid[1]).toBeGreaterThan(41.0);
      expect(centroid[1]).toBeLessThan(43.65);
    }
  });
});
