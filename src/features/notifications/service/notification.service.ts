import { userRepository } from '@/features/auth/repository/user.repository';
import { notificationRepository } from '@/features/notifications/repository/notification.repository';
import { NotificationDocument } from '@/features/notifications/schema/notification.schema';
import {
  NewNotification,
  NotificationPage,
  NotificationType,
} from '@/features/notifications/types/notification.types';
import {
  MarkNotificationsReadType,
  NotificationsQueryType,
} from '@/features/notifications/validations/notification.validation';
import { reportRepository } from '@/features/reports/repository/report.repository';
import { NOTIFICATIONS_PAGE_SIZE } from '@/shared/const/notifications.const';
import { ServiceResult } from '@/shared/types/common';

import type { QueryFilter } from 'mongoose';

const unique = (values: string[]) => [...new Set(values)];

// Notifications are a side effect: a failure here must never fail the comment or status change that caused it
export async function notifyService(notifications: NewNotification[]): Promise<void> {
  const deliverable = notifications.filter((notification) => notification.userId !== notification.actorId);
  if (deliverable.length === 0) return;
  try {
    await notificationRepository.insertMany(deliverable);
  } catch (error) {
    console.error('Failed to create notifications', error);
  }
}

export async function listNotificationsService(
  userId: string,
  query: NotificationsQueryType
): Promise<ServiceResult<NotificationPage>> {
  const filter: QueryFilter<NotificationDocument> = { userId };
  if (query.after) {
    const [ms, id] = query.after.split('_');
    const createdAt = new Date(Number(ms));
    filter.$or = [{ createdAt: { $lt: createdAt } }, { createdAt, _id: { $lt: id } }];
  }

  const docs = await notificationRepository.findPage(filter, NOTIFICATIONS_PAGE_SIZE + 1);
  const page = docs.slice(0, NOTIFICATIONS_PAGE_SIZE);
  const last = page.at(-1);
  const nextCursor =
    docs.length > NOTIFICATIONS_PAGE_SIZE && last ? `${last.createdAt.getTime()}_${last._id.toString()}` : null;

  const [reports, actors] = await Promise.all([
    reportRepository.findByIds(unique(page.map((doc) => doc.reportId.toString()))),
    userRepository.findPublicByIds(
      unique(page.flatMap((doc) => (doc.actorId ? [doc.actorId.toString()] : [])))
    ),
  ]);
  const reportById = new Map(reports.map((report) => [report._id.toString(), report]));
  const actorById = new Map(actors.map((actor) => [actor._id.toString(), actor]));

  return {
    data: {
      items: page.map((doc) => {
        const report = reportById.get(doc.reportId.toString());
        const actor = doc.actorId ? actorById.get(doc.actorId.toString()) : undefined;
        return {
          id: doc._id.toString(),
          type: doc.type as NotificationType,
          read: doc.read,
          createdAt: doc.createdAt.toISOString(),
          report: report && !report.hidden ? { shortId: report.shortId, slug: report.slug, title: report.title } : null,
          actorName: actor && !actor.deletedAt ? actor.displayName || actor.name : null,
        };
      }),
      nextCursor,
    },
    status: 200,
  };
}

export async function unreadCountService(userId: string): Promise<ServiceResult<{ count: number }>> {
  return { data: { count: await notificationRepository.countUnread(userId) }, status: 200 };
}

export async function markNotificationsReadService(
  userId: string,
  input: MarkNotificationsReadType
): Promise<ServiceResult<{ ok: true }>> {
  if (input.ids) await notificationRepository.markReadByIds(userId, input.ids);
  else await notificationRepository.markAllRead(userId);
  return { data: { ok: true }, status: 200 };
}
