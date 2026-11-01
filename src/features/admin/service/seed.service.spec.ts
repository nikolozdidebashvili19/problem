import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@/features/categories/service/category.service', () => ({
  seedCategoriesService: vi.fn(),
}));

vi.mock('@/features/locations/service/location.service', () => ({
  seedLocationsService: vi.fn(),
}));

vi.mock('@/features/reports/service/demo-seed.service', () => ({
  seedDemoReportsService: vi.fn(),
}));

import { seedCategoriesService } from '@/features/categories/service/category.service';
import { seedLocationsService } from '@/features/locations/service/location.service';
import { seedDemoReportsService } from '@/features/reports/service/demo-seed.service';

import { seedService } from './seed.service';

const mockSeedCategories = vi.mocked(seedCategoriesService);
const mockSeedLocations = vi.mocked(seedLocationsService);
const mockSeedDemo = vi.mocked(seedDemoReportsService);

const ADMIN_ID = '507f1f77bcf86cd799439011';

describe('seedService', () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllEnvs());

  it('runs only the requested seeders and reports counts', async () => {
    mockSeedCategories.mockResolvedValueOnce({ count: 14 });
    const result = await seedService({ targets: ['categories'] }, ADMIN_ID);
    expect(result).toEqual({ data: { categories: 14 }, status: 200 });
    expect(mockSeedLocations).not.toHaveBeenCalled();
  });

  it('runs each target once even if repeated', async () => {
    mockSeedCategories.mockResolvedValue({ count: 14 });
    mockSeedLocations.mockResolvedValue({ count: 37 });
    const result = await seedService({ targets: ['categories', 'locations', 'categories'] }, ADMIN_ID);
    expect(result.data).toEqual({ categories: 14, locations: 37 });
    expect(mockSeedCategories).toHaveBeenCalledOnce();
  });

  it('seeds demo reports authored by the admin outside production', async () => {
    mockSeedDemo.mockResolvedValueOnce({ count: 8 });
    const result = await seedService({ targets: ['demo-reports'] }, ADMIN_ID);
    expect(mockSeedDemo).toHaveBeenCalledWith(ADMIN_ID);
    expect(result.data).toEqual({ 'demo-reports': 8 });
  });

  it('refuses demo reports in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const result = await seedService({ targets: ['categories', 'demo-reports'] }, ADMIN_ID);
    expect(result).toEqual({ data: { error: 'DEMO_SEED_DISABLED' }, status: 403 });
    expect(mockSeedCategories).not.toHaveBeenCalled();
  });
});
