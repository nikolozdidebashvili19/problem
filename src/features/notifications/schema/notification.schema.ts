import mongoose, { Schema, InferSchemaType } from 'mongoose';

import { NOTIFICATION_TTL_S, NOTIFICATION_TYPES } from '@/shared/const/notifications.const';

const NotificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    read: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, createdAt: -1, _id: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: NOTIFICATION_TTL_S });

export type NotificationDocument = InferSchemaType<typeof NotificationSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const NotificationModel =
  mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
