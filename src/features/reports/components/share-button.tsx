'use client';
import { Check, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';

const COPIED_RESET_MS = 2000;

type ShareButtonProps = {
  title: string;
};

// Native share sheet on phones (Messenger, Telegram…); copies the link elsewhere
export const ShareButton = ({ title }: ShareButtonProps) => {
  const t = useTranslations('reportPage');
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  return (
    <Button variant="outline" onClick={share} className="h-10 rounded-full px-4">
      {copied ? <Check aria-hidden="true" className="size-4" /> : <Share2 aria-hidden="true" className="size-4" />}
      <span aria-live="polite">{copied ? t('linkCopied') : t('share')}</span>
    </Button>
  );
};
