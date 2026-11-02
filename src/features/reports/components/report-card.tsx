import { Images, MapPin, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { CategoryIcon } from '@/features/categories/components/category-icon';
import { AuthorName } from '@/features/profiles/components/author-name';
import { StatusBadge } from '@/features/reports/components/status-badge';
import { UpvoteButton } from '@/features/reports/components/upvote-button';
import { ReportCard as ReportCardData } from '@/features/reports/types/report.types';
import { ROUTES } from '@/shared/const/routes.const';
import { formatReportDate } from '@/shared/utils/format';
import { localizedName } from '@/shared/utils/locale';

type ReportCardProps = {
  report: ReportCardData;
};

function locationLabel(report: ReportCardData, locale: string): string | null {
  const [mostSpecific] = report.locations;
  const broadest = report.locations.at(-1);
  if (!mostSpecific || !broadest) return null;
  const specificName = localizedName(mostSpecific, locale);
  return mostSpecific.slug === broadest.slug ? specificName : `${specificName}, ${localizedName(broadest, locale)}`;
}

export const ReportCard = ({ report }: ReportCardProps) => {
  const t = useTranslations('report');
  const tPage = useTranslations('reportPage');
  const locale = useLocale();
  const location = locationLabel(report, locale);
  const href = ROUTES.report(report.shortId, report.slug);

  return (
    <article className="flex rounded-lg border border-border bg-card transition-colors hover:border-foreground/25">
      <div className="flex w-14 shrink-0 justify-center rounded-l-lg bg-muted/60 py-3 sm:w-16">
        <UpvoteButton
          shortId={report.shortId}
          title={report.title}
          initialVoted={report.hasVoted}
          initialCount={report.upvoteCount}
          canVote={report.canVote}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {report.category && (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <CategoryIcon icon={report.category.icon} className="size-3.5" />
              {localizedName(report.category, locale)}
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="size-3.5" />
              {location}
            </span>
          )}
          <span aria-hidden="true">·</span>
          <time dateTime={report.createdAt}>{formatReportDate(report.createdAt, locale)}</time>
        </div>

        <h2 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
          <Link href={href} className="rounded-sm outline-none hover:text-link focus-visible:ring-2 focus-visible:ring-ring/50">
            {report.title}
          </Link>
        </h2>
        <p className="line-clamp-3 text-sm text-muted-foreground">{report.excerpt}</p>

        {report.image && (
          <Link
            href={href}
            tabIndex={-1}
            aria-hidden="true"
            className="relative block aspect-video overflow-hidden rounded-md border border-border bg-muted"
          >
            <Image
              src={report.image.url}
              alt={report.title}
              fill
              unoptimized
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-contain"
            />
          </Link>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
          <StatusBadge status={report.status} />
          <AuthorName authorId={report.authorId} name={report.authorName} />
          <Link href={`${href}#comments-heading`} className="inline-flex items-center gap-1 rounded-sm hover:text-link">
            <MessageSquare aria-hidden="true" className="size-3.5" />
            {tPage('comments', { count: report.commentCount })}
          </Link>
          {report.imageCount > 1 && (
            <span className="inline-flex items-center gap-1">
              <Images aria-hidden="true" className="size-3.5" />
              {t('photos', { count: report.imageCount })}
            </span>
          )}
          {report.fixedAt && <span>{t('fixedOn', { date: formatReportDate(report.fixedAt, locale) })}</span>}
        </div>
      </div>
    </article>
  );
};
