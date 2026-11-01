import mongoose, { Schema, InferSchemaType } from 'mongoose';

const CategorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    nameKa: { type: String, required: true },
    nameEn: { type: String, required: true },
    icon: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    // Retired categories stay in the DB so old reports still resolve them
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ active: 1, order: 1 });

export type CategoryDocument = InferSchemaType<typeof CategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CategoryModel =
  mongoose.models.Category || mongoose.model('Category', CategorySchema);
