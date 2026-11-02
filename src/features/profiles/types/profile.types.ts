import { PROFILE_REPORT_TABS, PROFILE_TABS } from '@/shared/const/profile.const';

export type ProfileTab = (typeof PROFILE_TABS)[number];

export type ProfileReportTab = (typeof PROFILE_REPORT_TABS)[number];

export type ProfileStats = {
  reports: number;
  // Reports this user marked as fixed
  fixed: number;
  upvotes: number;
  comments: number;
};

// Public by design: never add email or other private account fields here (PRODUCT §14)
export type ProfileView = {
  id: string;
  name: string;
  avatar: string | null;
  joinedAt: string;
  stats: ProfileStats;
};

export type ProfileComment = {
  id: string;
  body: string;
  createdAt: string;
  report: { shortId: string; slug: string; title: string };
};

export type ProfileCommentPage = {
  items: ProfileComment[];
  nextCursor: string | null;
};
