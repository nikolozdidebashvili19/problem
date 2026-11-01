import { NotificationDocument, NotificationModel } from '@/features/notifications/schema/notification.schema';
import { NewNotification } from '@/features/notifications/types/notification.types';
import { mongo } from '@/shared/lib/mongo';

import type { QueryFilter } from 'mongoose';

export const notificationRepository = {
  async insertMany(notifications: NewNotification[]): Promise<void> {
    await mongo.connect();
    await NotificationModel.insertMany(notifications, { ordered: false });
  },

  async findPage(filter: QueryFilter<NotificationDocument>, limit: number): Promise<NotificationDocument[]> {
    await mongo.connect();
    return NotificationModel.find(filter).sort({ createdAt: -1, _id: -1 }).limit(limit).lean<NotificationDocument[]>().exec();
  },

  async countUnread(userId: string): Promise<number> {
    await mongo.connect();
    return NotificationModel.countDocuments({ userId, read: false }).exec();
  },

  async markReadByIds(userId: string, ids: string[]): Promise<void> {
    await mongo.connect();
    await NotificationModel.updateMany({ userId, _id: { $in: ids }, read: false }, { $set: { read: true } });
  },

  async markAllRead(userId: string): Promise<void> {
    await mongo.connect();
    await NotificationModel.updateMany({ userId, read: false }, { $set: { read: true } });
  },
};
