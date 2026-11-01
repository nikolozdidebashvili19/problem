import mongoose, { Schema, InferSchemaType } from 'mongoose';

import { GeoPointSchema } from '@/features/locations/schema/location.schema';
import { REPORT_SEVERITIES, REPORT_STATUSES } from '@/shared/const/report-status.const';

const ReportImageSchema = new Schema(
  {
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false }
);

const OfficialResponseSchema = new Schema(
  {
    body: { type: String, required: true },
    text: { type: String, required: true },
    sourceUrl: { type: String, required: false },
    sourceImage: { type: String, required: false },
    date: { type: Date, required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const FixEvidenceSchema = new Schema(
  {
    note: { type: String, required: false, maxlength: 500 },
    images: { type: [ReportImageSchema], default: [] },
    by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: false, timestamps: true }
);

const EditHistorySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    editedAt: { type: Date, required: true },
  },
  { _id: false }
);

// Category and locations are referenced by slug: stable, URL-friendly and directly filterable
const ReportSchema = new Schema(
  {
    shortId: { type: String, required: true, unique: true },
    slug: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, minlength: 5, maxlength: 80 },
    description: { type: String, required: true, minlength: 10, maxlength: 1000 },
    categorySlug: { type: String, required: true },
    severity: { type: String, enum: REPORT_SEVERITIES, required: false },
    location: {
      region: { type: String, required: true },
      municipality: { type: String, required: false },
      neighborhood: { type: String, required: false },
    },
    // Chosen location disagrees with the pin → flagged for moderator review
    locationMismatch: { type: Boolean, required: true, default: false },
    point: { type: GeoPointSchema, required: true },
    addressHint: { type: String, required: false, maxlength: 120 },
    images: { type: [ReportImageSchema], default: [] },
    status: { type: String, enum: REPORT_STATUSES, required: true, default: 'reported' },
    upvoteCount: { type: Number, required: true, default: 0 },
    hotScore: { type: Number, required: true, default: 0 },
    flagCount: { type: Number, required: true, default: 0 },
    commentCount: { type: Number, required: true, default: 0 },
    hidden: { type: Boolean, required: true, default: false },
    mergedInto: { type: Schema.Types.ObjectId, ref: 'Report', required: false },
    officialResponses: { type: [OfficialResponseSchema], default: [] },
    fixedAt: { type: Date, required: false },
    daysToFix: { type: Number, required: false },
    fixEvidence: { type: FixEvidenceSchema, required: false },
    // Previous versions, so popular reports can't be silently rewritten (PRODUCT §12.3)
    editHistory: { type: [EditHistorySchema], default: [] },
    idempotencyKey: { type: String, required: false },
  },
  { timestamps: true }
);

// PRODUCT §9 required indexes
ReportSchema.index({ point: '2dsphere' });
ReportSchema.index({ status: 1, hidden: 1, hotScore: -1, _id: -1 });
ReportSchema.index({ status: 1, hidden: 1, upvoteCount: -1, _id: -1 });
ReportSchema.index({ status: 1, hidden: 1, createdAt: -1, _id: -1 });
ReportSchema.index({ status: 1, hidden: 1, fixedAt: -1, _id: -1 });
ReportSchema.index({ 'location.municipality': 1, status: 1, hotScore: -1 });
ReportSchema.index({ 'location.neighborhood': 1, status: 1, hotScore: -1 });
ReportSchema.index({ categorySlug: 1, status: 1, hotScore: -1 });
ReportSchema.index({ authorId: 1, createdAt: -1 });
ReportSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });
ReportSchema.index({ title: 'text', description: 'text' }, { default_language: 'none' });

export type ReportDocument = InferSchemaType<typeof ReportSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ReportModel =
  mongoose.models.Report || mongoose.model('Report', ReportSchema);
