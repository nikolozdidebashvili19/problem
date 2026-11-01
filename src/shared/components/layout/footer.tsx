import { useTranslations } from 'next-intl';

export const Footer = () => {
  const t = useTranslations('common');

  return (
    <footer className="mt-auto border-t border-border pt-5 text-xs text-muted-foreground">
      <p>{t('freeNotice')}</p>
      <p className="mt-1">{t('emergencyNotice')}</p>
    </footer>
  );
};
