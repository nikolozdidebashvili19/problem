import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/features/categories/repository/category.repository', () => ({
  categoryRepository: {
    findActive: vi.fn(),
    upsertBySlug: vi.fn(),
  },
}));

import { categoryRepository } from '@/features/categories/repository/category.repository';
import { CATEGORY_SEED } from '@/shared/const/categories.const';

import { listCategoriesService, seedCategoriesService } from './category.service';

const mockRepo = vi.mocked(categoryRepository);

describe('listCategoriesService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns active categories as summaries', async () => {
    mockRepo.findActive.mockResolvedValueOnce([
      { _id: { toString: () => 'cat-1' }, slug: 'roads', nameKa: 'გზები', nameEn: 'Roads', icon: 'construction', order: 0, active: true },
    ] as never);
    const result = await listCategoriesService();
    expect(result.status).toBe(200);
    expect(result.data).toEqual({
      items: [{ id: 'cat-1', slug: 'roads', nameKa: 'გზები', nameEn: 'Roads', icon: 'construction' }],
    });
  });
});

describe('seedCategoriesService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('upserts every seed category with its position as order', async () => {
    const result = await seedCategoriesService();
    expect(result).toEqual({ count: CATEGORY_SEED.length });
    expect(mockRepo.upsertBySlug).toHaveBeenCalledTimes(CATEGORY_SEED.length);
    expect(mockRepo.upsertBySlug).toHaveBeenCalledWith(expect.objectContaining({ slug: 'roads', order: 0 }));
    expect(mockRepo.upsertBySlug).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'other', order: CATEGORY_SEED.length - 1 })
    );
  });

  it('seeds the 14 categories from PRODUCT §7 with unique slugs', () => {
    const slugs = CATEGORY_SEED.map((category) => category.slug);
    expect(slugs).toHaveLength(14);
    expect(new Set(slugs).size).toBe(14);
  });
});
