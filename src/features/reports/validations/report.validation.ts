import { z } from 'zod';

import { DEFAULT_FEED_TAB, FEED_TABS } from '@/shared/const/feed.const';
import { REPORT_SEVERITIES } from '@/shared/const/report-status.const';
import {
  COMMENT_MAX,
  FIX_NOTE_MAX,
  MAX_REPORT_IMAGES,
  REPORT_ADDRESS_HINT_MAX,
  REPORT_DESCRIPTION_MAX,
  REPORT_DESCRIPTION_MIN,
  REPORT_TITLE_MAX,
  REPORT_TITLE_MIN,
} from '@/shared/const/reports.const';

const SlugSchema = z.string().min(1).max(80).regex(/^[a-z0-9-]+$/);

// `<sortValue>_<objectId>` — sort value is hotScore or a timestamp in ms
export const FeedCursorSchema = z.string().regex(/^-?\d+(\.\d+)?(e[-+]?\d+)?_[a-f0-9]{24}$/i);

export const FeedQuerySchema = z.object({
  tab: z.enum(FEED_TABS).default(DEFAULT_FEED_TAB),
  category: SlugSchema.optional(),
  location: SlugSchema.optional(),
  q: z.string().trim().min(2).max(100).optional(),
  after: FeedCursorSchema.optional(),
});

export type FeedQueryType = z.infer<typeof FeedQuerySchema>;

export const VoteSchema = z.object({
  voted: z.boolean(),
});

export type VoteType = z.infer<typeof VoteSchema>;

// Plain text only: angle brackets are stripped so nothing can ever be interpreted as markup (PRODUCT §12.3)
const plainText = (min: number, max: number) =>
  z
    .string()
    .transform((value) => value.replace(/[<>]/g, '').trim())
    .pipe(z.string().min(min).max(max));

export const ReportImageSchema = z.object({
  publicId: z.string().min(1).max(200),
  url: z.string().url().max(500),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export type ReportImageType = z.infer<typeof ReportImageSchema>;

export const ReportDetailsSchema = z.object({
  title: plainText(REPORT_TITLE_MIN, REPORT_TITLE_MAX),
  description: plainText(REPORT_DESCRIPTION_MIN, REPORT_DESCRIPTION_MAX),
  categorySlug: SlugSchema,
  addressHint: plainText(0, REPORT_ADDRESS_HINT_MAX).optional(),
  severity: z.enum(REPORT_SEVERITIES).optional(),
});

export const CreateReportSchema = ReportDetailsSchema.extend({
  // Most specific location the user picked (municipality or neighborhood); parents are derived server-side
  locationSlug: SlugSchema,
  // GeoJSON order [lng, lat]; omitted → the chosen location's centroid is used
  point: z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]).optional(),
  images: z.array(ReportImageSchema).max(MAX_REPORT_IMAGES),
  idempotencyKey: z.string().uuid(),
});

export type CreateReportType = z.infer<typeof CreateReportSchema>;

export const UpdateReportSchema = ReportDetailsSchema;

export type UpdateReportType = z.infer<typeof UpdateReportSchema>;

export const MarkFixedSchema = z.object({
  note: plainText(0, FIX_NOTE_MAX).optional(),
  images: z.array(ReportImageSchema).max(MAX_REPORT_IMAGES),
});

export type MarkFixedType = z.infer<typeof MarkFixedSchema>;

export const CreateCommentSchema = z.object({
  body: plainText(1, COMMENT_MAX),
  parentId: z.string().min(24).max(24).regex(/^[a-f0-9]{24}$/i).optional(),
});

export type CreateCommentType = z.infer<typeof CreateCommentSchema>;

export const CommentsQuerySchema = z.object({
  after: FeedCursorSchema.optional(),
});

export type CommentsQueryType = z.infer<typeof CommentsQuerySchema>;

// Client form schemas: same limits as the API schemas, without transforms so form input and output types match
export const ReportFormSchema = z.object({
  title: z.string().trim().min(REPORT_TITLE_MIN).max(REPORT_TITLE_MAX),
  description: z.string().trim().min(REPORT_DESCRIPTION_MIN).max(REPORT_DESCRIPTION_MAX),
  categorySlug: z.string().min(1),
  addressHint: z.string().max(REPORT_ADDRESS_HINT_MAX),
  severity: z.enum(REPORT_SEVERITIES).or(z.literal('')),
  regionSlug: z.string(),
  municipalitySlug: z.string(),
  neighborhoodSlug: z.string(),
  point: z.tuple([z.number(), z.number()]).nullable(),
  images: z.array(ReportImageSchema).max(MAX_REPORT_IMAGES),
});

export type ReportFormType = z.infer<typeof ReportFormSchema>;

export const MarkFixedFormSchema = z.object({
  note: z.string().max(FIX_NOTE_MAX),
  images: z.array(ReportImageSchema).max(MAX_REPORT_IMAGES),
});

export type MarkFixedFormType = z.infer<typeof MarkFixedFormSchema>;

export const CommentFormSchema = z.object({
  body: z.string().trim().min(1).max(COMMENT_MAX),
});

export type CommentFormType = z.infer<typeof CommentFormSchema>;
