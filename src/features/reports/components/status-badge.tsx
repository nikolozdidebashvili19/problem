import { useLocale } from 'next-intl';

import { ReportStatus } from '@/features/reports/types/report.types';
import { REPORT_STATUS_LABELS } from '@/shared/const/report-status.const';
import { cn } from '@/shared/lib/utils';

// Status is always shown as text + color, never color alone (WCAG, PRODUCT §16)
const STATUS_STYLES: Record<ReportStatus, string> = {
  reported: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  acknowledged: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  in_progress: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  fix_pending: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  fixed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  reopened: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  duplicate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  rejected: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  removed: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
};

type StatusBadgeProps = {
  status: ReportStatus;
  className?: string;
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const locale = useLocale();
  const labels = REPORT_STATUS_LABELS[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status],
        className
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {locale === 'en' ? labels.en : labels.ka}
    </span>
  );
};
