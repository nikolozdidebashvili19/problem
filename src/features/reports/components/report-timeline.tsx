import { useLocale, useTranslations } from 'next-intl';

import { StatusBadge } from '@/features/reports/components/status-badge';
import { ReportTimelineEvent } from '@/features/reports/types/report.types';
import { formatReportDate } from '@/shared/utils/format';

type ReportTimelineProps = {
  events: ReportTimelineEvent[];
};

export const ReportTimeline = ({ events }: ReportTimelineProps) => {
  const t = useTranslations('reportPage');
  const locale = useLocale();
  if (events.length === 0) return null;

  return (
    <section aria-labelledby="timeline-heading" className="flex flex-col gap-3">
      <h2 id="timeline-heading" className="text-lg">
        {t('timeline')}
      </h2>
      <ol className="flex flex-col gap-3 border-l-2 border-border pl-4">
        {events.map((event) => (
          <li key={`${event.to}-${event.at}`} className="relative flex flex-col gap-1">
            <span aria-hidden="true" className="absolute -left-5 top-1.5 size-2 rounded-full bg-border ring-4 ring-background" />
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={event.to} />
              <time dateTime={event.at} className="text-xs text-muted-foreground">
                {formatReportDate(event.at, locale)}
              </time>
            </div>
            {event.note && <p className="text-sm text-muted-foreground">{event.note}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
};
