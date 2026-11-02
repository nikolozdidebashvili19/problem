export const NOTIFICATION_TYPES = ['comment', 'comment_reply', 'report_fixed'] as const;

export const NOTIFICATIONS_PAGE_SIZE = 30;

// In-app notifications expire after 90 days (keeps the free-tier DB small)
export const NOTIFICATION_TTL_S = 60 * 60 * 24 * 90;

// Unread badge polling — no websockets in v1 (PRODUCT §2)
export const NOTIFICATION_POLL_MS = 60000;
