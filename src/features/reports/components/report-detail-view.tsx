import { ArrowLeft, MapPin, Siren } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import { CategoryIcon } from '@/features/categories/components/category-icon';
import { CommentSection } from '@/features/comments/components/comment-section';
import { AuthorName } from '@/features/profiles/components/author-name';
import { RemovedReport } from '@/features/reports/components/removed-report';
import { ReportGallery } from '@/features/reports/components/report-gallery';
import { ReportOwnerActions } from '@/features/reports/components/report-owner-actions';
import { ReportTimeline } from '@/features/reports/components/report-timeline';
import { ShareButton } from '@/features/reports/components/share-button';
import { StatusBadge } from '@/features/reports/components/status-badge';
import { UpvoteButton } from '@/features/reports/components/upvote-button';
import { loadReportPageService } from '@/features/reports/service/report-page.service';
import { ROUTES } from '@/shared/const/routes.const';
import { cloudinary } from '@/shared/lib/cloudinary';
import { formatReportDate } from '@/shared/utils/format';
import { localizedName } from '@/shared/utils/locale';

type ReportDetailViewProps = {
  shortId: string;
  slug: string | undefined;
};

export const ReportDetailView = async ({ shortId, slug }: ReportDetailViewProps) => {
  const page = await loadReportPageService(shortId);
  if (page.kind === 'not-found') notFound();
  if (page.kind === 'removed') return <RemovedReport />;

  const { report, comments, signedIn } = page;
  // Slugs change on edit; old links resolve by shortId and land on the canonical URL
  if (slug !== report.slug) redirect(ROUTES.report(report.shortId, report.slug));

  const [t, tForm, tCommon, locale] = await Promise.all([
    getTranslations('reportPage'),
    getTranslations('reportForm'),
    getTranslations('common'),
    getLocale(),
  ]);
  const locationTrail = [...report.locations].reverse().map((location) => localizedName(location, locale));

  return (
    <article className="flex flex-col gap-6">
      <Link
        href={ROUTES.home}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {t('backToFeed')}
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {report.category && (
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <CategoryIcon icon={report.category.icon} />
              {localizedName(report.category, locale)}
            </span>
          )}
          {locationTrail.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="size-4" />
              {locationTrail.join(' › ')}
            </span>
          )}
        </div>
        <h1 className="text-2xl leading-tight sm:text-3xl">{report.title}</h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <StatusBadge status={report.status} />
          <AuthorName authorId={report.authorId} name={report.authorName} />
          <span aria-hidden="true">·</span>
          <time dateTime={report.createdAt}>{formatReportDate(report.createdAt, locale)}</time>
        </div>
      </header>

      <ReportGallery images={report.images} title={report.title} />

      <p className="whitespace-pre-line break-words text-base leading-relaxed text-foreground">{report.description}</p>

      {(report.addressHint || report.severity === 'dangerous') && (
        <dl className="flex flex-col gap-2 text-sm">
          {report.addressHint && (
            <div className="flex gap-2">
              <dt className="font-medium text-foreground">{t('address')}:</dt>
              <dd className="text-muted-foreground">{report.addressHint}</dd>
            </div>
          )}
          {report.severity === 'dangerous' && (
            <div className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-destructive">
              <dt className="sr-only">{t('severity')}</dt>
              <dd className="flex gap-2">
                <Siren aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {tForm('severityDangerous')} — {tCommon('emergencyNotice')}
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="flex flex-wrap items-center gap-3 border-y border-border py-3">
        <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
          <UpvoteButton
            shortId={report.shortId}
            title={report.title}
            initialVoted={report.hasVoted}
            initialCount={report.upvoteCount}
            canVote={report.canVote}
          />
        </div>
        <ShareButton title={report.title} />
      </div>

      <ReportOwnerActions
        shortId={report.shortId}
        canEdit={report.canEdit}
        canMarkFixed={report.canMarkFixed}
        canDelete={report.canDelete}
        uploadsEnabled={cloudinary.isConfigured()}
      />

      {report.fixEvidence && (
        <section
          aria-labelledby="fix-heading"
          className="flex flex-col gap-3 rounded-lg border border-emerald-600/30 bg-emerald-50/50 p-4 dark:bg-emerald-950/30"
        >
          <h2 id="fix-heading" className="text-lg">
            {t('fixEvidence')}
          </h2>
          {report.fixEvidence.note && <p className="text-sm text-foreground">{report.fixEvidence.note}</p>}
          <ReportGallery images={report.fixEvidence.images} title={report.title} />
        </section>
      )}

      <ReportTimeline events={report.timeline} />

      <CommentSection shortId={report.shortId} initial={comments} total={report.commentCount} signedIn={signedIn} />
    </article>
  );
};
