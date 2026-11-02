import { z } from 'zod';

import { FeedCursorSchema } from '@/features/reports/validations/report.validation';
import { DEFAULT_PROFILE_TAB, PROFILE_REPORT_TABS } from '@/shared/const/profile.const';

export const ProfileReportsQuerySchema = z.object({
  tab: z.enum(PROFILE_REPORT_TABS).default(DEFAULT_PROFILE_TAB),
  after: FeedCursorSchema.optional(),
});

export type ProfileReportsQueryType = z.infer<typeof ProfileReportsQuerySchema>;

export const ProfileCommentsQuerySchema = z.object({
  after: FeedCursorSchema.optional(),
});

export type ProfileCommentsQueryType = z.infer<typeof ProfileCommentsQuerySchema>;
