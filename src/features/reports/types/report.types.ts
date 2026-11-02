import { FEED_TABS } from '@/shared/const/feed.const';
import { REPORT_STATUSES } from '@/shared/const/report-status.const';

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type FeedTab = (typeof FEED_TABS)[number];

export type ReportCardLocation = {
  slug: string;
  nameKa: string;
  nameEn: string;
};

export type ReportCard = {
  id: string;
  shortId: string;
  slug: string;
  title: string;
  excerpt: string;
  image: { url: string; width: number; height: number } | null;
  imageCount: number;
  category: { slug: string; nameKa: string; nameEn: string; icon: string } | null;
  // Most specific first: neighborhood → municipality → region
  locations: ReportCardLocation[];
  status: ReportStatus;
  upvoteCount: number;
  commentCount: number;
  hasVoted: boolean;
  canVote: boolean;
  authorId: string;
  authorName: string | null;
  createdAt: string;
  fixedAt: string | null;
};

export type FeedPage = {
  items: ReportCard[];
  nextCursor: string | null;
};

export type VoteResult = {
  voted: boolean;
  upvoteCount: number;
};

export type ReportImage = {
  publicId: string;
  url: string;
  width: number;
  height: number;
};

export type ReportTimelineEvent = {
  to: ReportStatus;
  at: string;
  note: string | null;
};

export type ReportDetail = ReportCard & {
  description: string;
  images: ReportImage[];
  addressHint: string | null;
  severity: string | null;
  locationSlug: string;
  categorySlug: string;
  fixEvidence: { note: string | null; images: ReportImage[] } | null;
  timeline: ReportTimelineEvent[];
  isOwner: boolean;
  canEdit: boolean;
  canMarkFixed: boolean;
  canDelete: boolean;
};

export type RemovedReport = {
  removed: true;
  status: ReportStatus;
};
