// Report status lifecycle (PRODUCT §5)
export const REPORT_STATUSES = [
  'reported',
  'acknowledged',
  'in_progress',
  'fix_pending',
  'fixed',
  'reopened',
  'duplicate',
  'rejected',
  'removed',
] as const;

// Shown in the main feeds (Popular / Newest)
export const OPEN_STATUSES = ['reported', 'acknowledged', 'in_progress', 'fix_pending', 'reopened'] as const;

// Votes are frozen on fixed and moderator-closed reports (PRODUCT §4.4)
export const VOTABLE_STATUSES = OPEN_STATUSES;

export const REPORT_STATUS_LABELS = {
  reported: { en: 'Reported', ka: 'დაფიქსირებული' },
  acknowledged: { en: 'Official response', ka: 'ოფიციალური პასუხი' },
  in_progress: { en: 'In progress', ka: 'მიმდინარეობს' },
  fix_pending: { en: 'Fix pending', ka: 'გადამოწმება' },
  fixed: { en: 'Fixed', ka: 'მოგვარებული' },
  reopened: { en: 'Reopened', ka: 'ხელახლა გახსნილი' },
  duplicate: { en: 'Duplicate', ka: 'დუბლიკატი' },
  rejected: { en: 'Not a public issue', ka: 'არ არის საჯარო პრობლემა' },
  removed: { en: 'Removed', ka: 'წაშლილი' },
} as const;

export const REPORT_SEVERITIES = ['low', 'medium', 'dangerous'] as const;
