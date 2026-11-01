'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { useComments } from '@/features/comments/hooks/use-comments';
import { CommentPage } from '@/features/comments/types/comment.types';
import { CommentFormSchema, CommentFormType } from '@/features/reports/validations/report.validation';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Textarea } from '@/shared/components/ui/textarea';
import { ROUTES } from '@/shared/const/routes.const';
import { useErrorMessage } from '@/shared/hooks/use-error-message';
import { cn } from '@/shared/lib/utils';
import { formatReportDate } from '@/shared/utils/format';

type CommentSectionProps = {
  shortId: string;
  initial: CommentPage;
  total: number;
  signedIn: boolean;
};

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const CommentSection = ({ shortId, initial, total, signedIn }: CommentSectionProps) => {
  const t = useTranslations('comments');
  const tReport = useTranslations('report');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const errorMessage = useErrorMessage();
  const { items, delta, hasMore, loadingMore, loadMore, add, remove, error } = useComments(shortId, initial);

  const form = useForm<CommentFormType>({
    resolver: zodResolver(CommentFormSchema),
    defaultValues: { body: '' },
  });
  const posting = form.formState.isSubmitting;

  const submit = async (values: CommentFormType) => {
    if (await add(values.body)) form.reset();
  };

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-4">
      <h2 id="comments-heading" className="text-lg">
        {t('title')} <span className="font-normal text-muted-foreground">({Math.max(total + delta, items.length)})</span>
      </h2>

      {signedIn ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} noValidate className="flex flex-col gap-2">
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">{t('label')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder={t('placeholder')} className="min-h-20" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={posting} className="h-10 self-end rounded-full px-5 font-semibold">
              {posting ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
              {posting ? t('posting') : t('post')}
            </Button>
          </form>
        </Form>
      ) : (
        <p className="rounded-lg border border-dashed border-border bg-card p-4 text-sm text-muted-foreground">
          <Link
            href={`${ROUTES.signIn}?callbackUrl=${encodeURIComponent(pathname)}`}
            className="font-medium text-link underline-offset-4 hover:underline"
          >
            {tCommon('signIn')}
          </Link>{' '}
          — {t('signInToComment')}
        </p>
      )}

      {error !== null && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {errorMessage(error)}
        </p>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
          {items.map((comment) => {
            const name = comment.authorName ?? tReport('deletedUser');
            return (
              <li key={comment.id} className="flex gap-3 p-3 sm:p-4">
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
                >
                  {initials(name) || '?'}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{name}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={comment.createdAt}>{formatReportDate(comment.createdAt, locale)}</time>
                    {comment.canDelete && (
                      <button
                        type="button"
                        onClick={() => remove(comment.id)}
                        aria-label={t('delete')}
                        title={t('delete')}
                        className={cn(
                          'ml-auto inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors',
                          'outline-none hover:bg-accent hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/50'
                        )}
                      >
                        <Trash2 aria-hidden="true" className="size-4" />
                      </button>
                    )}
                  </div>
                  <p className="whitespace-pre-line break-words text-sm text-foreground">{comment.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {hasMore && (
        <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="h-10">
          {loadingMore && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
          {t('loadMore')}
        </Button>
      )}
    </section>
  );
};
