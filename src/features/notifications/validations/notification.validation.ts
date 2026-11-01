import { z } from 'zod';

export const NotificationsQuerySchema = z.object({
  after: z.string().regex(/^\d+_[a-f0-9]{24}$/i).optional(),
});

export type NotificationsQueryType = z.infer<typeof NotificationsQuerySchema>;

export const MarkNotificationsReadSchema = z.object({
  // Omitted → mark every notification as read
  ids: z.array(z.string().min(24).max(24)).max(100).optional(),
});

export type MarkNotificationsReadType = z.infer<typeof MarkNotificationsReadSchema>;
