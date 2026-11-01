import mongoose, { Schema, InferSchemaType } from 'mongoose';

// Votes live in their own collection (no unbounded arrays on reports — PRODUCT §12.2)
const VoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
  },
  { timestamps: true }
);

VoteSchema.index({ userId: 1, reportId: 1 }, { unique: true });
VoteSchema.index({ reportId: 1 });

export type VoteDocument = InferSchemaType<typeof VoteSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const VoteModel =
  mongoose.models.Vote || mongoose.model('Vote', VoteSchema);
