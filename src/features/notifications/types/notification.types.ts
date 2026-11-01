import { NOTIFICATION_TYPES } from '@/shared/const/notifications.const';

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NewNotification = {
  userId: string;
  type: NotificationType;
  reportId: string;
  actorId?: string;
};

export type NotificationView = {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  report: { shortId: string; slug: string; title: string } | null;
  // null when the actor deleted their account or the notification has no actor
  actorName: string | null;
};

export type NotificationPage = {
  items: NotificationView[];
  nextCursor: string | null;
};
