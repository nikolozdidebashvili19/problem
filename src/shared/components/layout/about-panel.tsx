import { Siren } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { APP_NAME } from '@/shared/const/app.const';

const ABOUT_STEPS = ['report', 'upvote', 'track'] as const;

export const AboutPanel = () => {
  const t = useTranslations('about');
  const tCommon = useTranslations('common');

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="about-heading" className="rounded-lg border border-border bg-card p-4">
        <h2 id="about-heading" className="text-base">
          {t('title', { app: APP_NAME })}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
        <ol className="mt-4 flex flex-col gap-3">
          {ABOUT_STEPS.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm">
              <span
                aria-hidden="true"
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-link/10 text-xs font-semibold text-link"
              >
                {index + 1}
              </span>
              <span>
                <span className="font-medium text-foreground">{t(`steps.${step}.title`)}</span>
                <span className="block text-muted-foreground">{t(`steps.${step}.description`)}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <aside className="flex gap-3 rounded-lg border border-border bg-card p-4 text-sm">
        <Siren aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-destructive" />
        <p className="text-muted-foreground">{tCommon('emergencyNotice')}</p>
      </aside>
    </div>
  );
};
