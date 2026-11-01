'use client';
import { Search } from 'lucide-react';
import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

type HeaderSearchProps = {
  className?: string;
};

// Plain GET form to the feed — no client state, works without JS
export const HeaderSearch = ({ className }: HeaderSearchProps) => {
  const t = useTranslations('search');
  const searchParams = useSearchParams();

  return (
    <Form action="/" role="search" className={cn('relative w-full', className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        key={searchParams.get('q') ?? ''}
        type="search"
        name="q"
        defaultValue={searchParams.get('q') ?? ''}
        placeholder={t('placeholder')}
        aria-label={t('label')}
        minLength={2}
        maxLength={100}
        className="h-10 rounded-full bg-muted pl-9 shadow-none focus-visible:bg-background"
      />
    </Form>
  );
};
