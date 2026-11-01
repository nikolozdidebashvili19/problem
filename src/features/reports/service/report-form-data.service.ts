import { listCategoriesService } from '@/features/categories/service/category.service';
import { CategorySummary } from '@/features/categories/types/category.types';
import { listLocationsService } from '@/features/locations/service/location.service';
import { LocationSummary } from '@/features/locations/types/location.types';
import { cloudinary } from '@/shared/lib/cloudinary';

export type ReportFormData = {
  categories: CategorySummary[];
  regions: LocationSummary[];
  // Tbilisi districts are preloaded so the default region needs no extra request
  preloadedLocations: Record<string, LocationSummary[]>;
  uploadsEnabled: boolean;
};

const DEFAULT_REGION = 'tbilisi';

export async function getReportFormDataService(): Promise<ReportFormData> {
  const [categories, regions, districts] = await Promise.all([
    listCategoriesService(),
    listLocationsService({}),
    listLocationsService({ parent: DEFAULT_REGION }),
  ]);
  return {
    categories: 'items' in categories.data ? categories.data.items : [],
    regions: 'items' in regions.data ? regions.data.items : [],
    preloadedLocations: { [DEFAULT_REGION]: 'items' in districts.data ? districts.data.items : [] },
    uploadsEnabled: cloudinary.isConfigured(),
  };
}
