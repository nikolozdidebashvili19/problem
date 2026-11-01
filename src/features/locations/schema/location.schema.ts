import mongoose, { Schema, InferSchemaType } from 'mongoose';

import { LOCATION_LEVELS } from '@/shared/const/locations.const';

export const GeoPointSchema = new Schema(
  {
    type: { type: String, enum: ['Point'], required: true },
    // [lng, lat] — GeoJSON order
    coordinates: { type: [Number], required: true },
  },
  { _id: false }
);

const BoundarySchema = new Schema(
  {
    type: { type: String, enum: ['Polygon', 'MultiPolygon'], required: true },
    coordinates: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    nameKa: { type: String, required: true },
    nameEn: { type: String, required: true },
    level: { type: String, enum: LOCATION_LEVELS, required: true },
    parentSlug: { type: String, required: false },
    centroid: { type: GeoPointSchema, required: true },
    // Imported from OpenStreetMap admin boundaries; optional until imported
    boundary: { type: BoundarySchema, required: false },
    // Occupied territories: listed for completeness, reporting disabled
    reportingDisabled: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

LocationSchema.index({ boundary: '2dsphere' });
LocationSchema.index({ centroid: '2dsphere' });
LocationSchema.index({ parentSlug: 1 });
LocationSchema.index({ level: 1 });

export type LocationDocument = InferSchemaType<typeof LocationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const LocationModel =
  mongoose.models.Location || mongoose.model('Location', LocationSchema);
