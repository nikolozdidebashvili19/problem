import { useTranslations } from 'next-intl';

const SKELETON_CARDS = 4;

export const FeedSkeleton = () => {
  const t = useTranslations('feed');

  return (
    <div aria-busy="true" aria-label={t('loadingReports')} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-32 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
        <div className="h-4 w-64 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />
      </div>
      <div className="h-12 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
      {Array.from({ length: SKELETON_CARDS }, (_, index) => (
        <div key={index} className="flex h-36 rounded-lg border border-border bg-card">
          <div className="w-14 rounded-l-lg bg-muted/60 sm:w-16" />
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="h-3 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </div>
        </div>
      ))}
    </div>
  );
};
