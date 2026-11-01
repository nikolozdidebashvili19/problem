import mongoose, { Schema, InferSchemaType } from 'mongoose';

import { COMMENT_MAX } from '@/shared/const/reports.const';

const CommentSchema = new Schema(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true, minlength: 1, maxlength: COMMENT_MAX },
    // Soft delete keeps moderation history; deleted comments are never returned
    deletedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

CommentSchema.index({ reportId: 1, deletedAt: 1, createdAt: 1, _id: 1 });

export type CommentDocument = InferSchemaType<typeof CommentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CommentModel =
  mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
