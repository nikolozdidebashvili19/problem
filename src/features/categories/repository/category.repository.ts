import { CategoryDocument, CategoryModel } from '@/features/categories/schema/category.schema';
import { CategorySeedInput } from '@/features/categories/types/category.types';
import { mongo } from '@/shared/lib/mongo';

export const categoryRepository = {
  async findActive(): Promise<CategoryDocument[]> {
    await mongo.connect();
    return CategoryModel.find({ active: true }).sort({ order: 1 }).lean<CategoryDocument[]>().exec();
  },

  // Includes retired categories so old reports still resolve their category
  async findBySlugs(slugs: string[]): Promise<CategoryDocument[]> {
    await mongo.connect();
    return CategoryModel.find({ slug: { $in: slugs } }).lean<CategoryDocument[]>().exec();
  },

  async findById(id: string): Promise<CategoryDocument | null> {
    await mongo.connect();
    return CategoryModel.findById(id).lean<CategoryDocument>().exec();
  },

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    await mongo.connect();
    return CategoryModel.findOne({ slug }).lean<CategoryDocument>().exec();
  },

  // `active` is only set on insert so re-seeding never re-enables a category an admin retired
  async upsertBySlug(data: CategorySeedInput): Promise<void> {
    await mongo.connect();
    await CategoryModel.updateOne(
      { slug: data.slug },
      { $set: data, $setOnInsert: { active: true } },
      { upsert: true }
    );
  },
};
