import { SeedType } from '@/features/admin/validations/admin.validation';
import { seedCategoriesService } from '@/features/categories/service/category.service';
import { seedLocationsService } from '@/features/locations/service/location.service';
import { seedDemoReportsService } from '@/features/reports/service/demo-seed.service';
import { ServiceResult } from '@/shared/types/common';

type SeedTarget = SeedType['targets'][number];

type SeedResult = Partial<Record<SeedTarget, number>>;

const SEEDERS: Record<SeedTarget, (actorId: string) => Promise<{ count: number }>> = {
  categories: () => seedCategoriesService(),
  locations: () => seedLocationsService(),
  'demo-reports': (actorId) => seedDemoReportsService(actorId),
};

// Idempotent: every seeder upserts by a natural key, so re-running is safe
export async function seedService(input: SeedType, actorId: string): Promise<ServiceResult<SeedResult>> {
  if (input.targets.includes('demo-reports') && process.env.NODE_ENV === 'production') {
    return { data: { error: 'DEMO_SEED_DISABLED' }, status: 403 };
  }

  const result: SeedResult = {};
  for (const target of new Set(input.targets)) {
    const { count } = await SEEDERS[target](actorId);
    result[target] = count;
  }
  return { data: result, status: 200 };
}
