import { categoryRepository } from '@/features/categories/repository/category.repository';
import { CategoryDocument } from '@/features/categories/schema/category.schema';
import { CategorySummary } from '@/features/categories/types/category.types';
import { CATEGORY_SEED } from '@/shared/const/categories.const';
import { ServiceResult } from '@/shared/types/common';

function toSummary(category: CategoryDocument): CategorySummary {
  return {
    id: category._id.toString(),
    slug: category.slug,
    nameKa: category.nameKa,
    nameEn: category.nameEn,
    icon: category.icon,
  };
}

export async function listCategoriesService(): Promise<ServiceResult<{ items: CategorySummary[] }>> {
  const categories = await categoryRepository.findActive();
  return { data: { items: categories.map(toSummary) }, status: 200 };
}

export async function seedCategoriesService(): Promise<{ count: number }> {
  await Promise.all(
    CATEGORY_SEED.map((category, index) => categoryRepository.upsertBySlug({ ...category, order: index }))
  );
  return { count: CATEGORY_SEED.length };
}
