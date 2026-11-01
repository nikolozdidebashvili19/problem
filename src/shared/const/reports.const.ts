export const REPORT_TITLE_MIN = 5;
export const REPORT_TITLE_MAX = 80;
export const REPORT_DESCRIPTION_MIN = 10;
export const REPORT_DESCRIPTION_MAX = 1000;
export const REPORT_ADDRESS_HINT_MAX = 120;
export const FIX_NOTE_MAX = 500;

export const MAX_REPORT_IMAGES = 4;

// Anti-spam without Redis (PRODUCT §4.1, §12.3); Upstash limits come with T-008
export const REPORTS_PER_HOUR = 5;
export const NEW_ACCOUNT_REPORTS_PER_DAY = 2;
export const NEW_ACCOUNT_AGE_MS = 24 * 60 * 60 * 1000;

export const COMMENT_MAX = 1000;
export const COMMENTS_PAGE_SIZE = 50;

// Voters notified when a report is fixed — bounded so one popular report can't flood the DB
export const MAX_FIX_NOTIFICATIONS = 500;
