import mongoose, { Schema, InferSchemaType } from 'mongoose';

import { REPORT_STATUSES } from '@/shared/const/report-status.const';

// One entry per status change — drives the timeline on the report page (PRODUCT §4.5)
const StatusEventSchema = new Schema(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    from: { type: String, enum: REPORT_STATUSES, required: false },
    to: { type: String, enum: REPORT_STATUSES, required: true },
    note: { type: String, required: false, maxlength: 500 },
  },
  { timestamps: true }
);

StatusEventSchema.index({ reportId: 1, createdAt: 1 });

export type StatusEventDocument = InferSchemaType<typeof StatusEventSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const StatusEventModel =
  mongoose.models.StatusEvent || mongoose.model('StatusEvent', StatusEventSchema);
