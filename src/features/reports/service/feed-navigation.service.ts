import { categoryRepository } from '@/features/categories/repository/category.repository';
import { listCategoriesService } from '@/features/categories/service/category.service';
import { CategorySummary } from '@/features/categories/types/category.types';
import { locationRepository } from '@/features/locations/repository/location.repository';
import { listLocationsService } from '@/features/locations/service/location.service';
import { LocationSummary } from '@/features/locations/types/location.types';
import { FeedQueryType } from '@/features/reports/validations/report.validation';

export type FeedSidebarData = {
  categories: CategorySummary[];
  districts: LocationSummary[];
};

type LocalizedLabel = { nameKa: string; nameEn: string };

export type FeedFilterLabels = {
  category: LocalizedLabel | null;
  location: LocalizedLabel | null;
};

const TBILISI_SLUG = 'tbilisi';

// The app shell must render even when the DB is unreachable, so navigation degrades to empty lists
export async function getFeedSidebarService(): Promise<FeedSidebarData> {
  try {
    const [categories, districts] = await Promise.all([
      listCategoriesService(),
      listLocationsService({ parent: TBILISI_SLUG }),
    ]);
    return {
      categories: 'items' in categories.data ? categories.data.items : [],
      districts: 'items' in districts.data ? districts.data.items : [],
    };
  } catch (error) {
    console.error('Failed to load feed navigation', error);
    return { categories: [], districts: [] };
  }
}

export async function getFeedFilterLabelsService(
  query: Pick<FeedQueryType, 'category' | 'location'>
): Promise<FeedFilterLabels> {
  const [category, location] = await Promise.all([
    query.category ? categoryRepository.findBySlug(query.category) : Promise.resolve(null),
    query.location ? locationRepository.findBySlug(query.location) : Promise.resolve(null),
  ]);
  return {
    category: category ? { nameKa: category.nameKa, nameEn: category.nameEn } : null,
    location: location ? { nameKa: location.nameKa, nameEn: location.nameEn } : null,
  };
}
