'use client';
import { Reply, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { CommentForm } from '@/features/comments/components/comment-form';
import { CommentView } from '@/features/comments/types/comment.types';
import { ROUTES } from '@/shared/const/routes.const';
import { cn } from '@/shared/lib/utils';
import { formatReportDate, getInitials } from '@/shared/utils/format';

type CommentItemProps = {
  comment: CommentView;
  canReply: boolean;
  replying: boolean;
  onReplyOpen: () => void;
  onReplyClose: () => void;
  onReplySubmit: (body: string) => Promise<boolean>;
  onDelete: () => void;
};

export const CommentItem = ({ comment, canReply, replying, onReplyOpen, onReplyClose, onReplySubmit, onDelete }: CommentItemProps) => {
  const t = useTranslations('comments');
  const tReport = useTranslations('report');
  const locale = useLocale();
  const name = comment.authorName ?? tReport('deletedUser');
  // Threads are one level deep, so answering a reply names who it is for
  const mention = comment.parentId && comment.authorName ? `@${comment.authorName} ` : '';

  return (
    <div className="flex gap-3">
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground"
      >
        {getInitials(name) || '?'}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {comment.authorName ? (
            <Link
              href={ROUTES.profile(comment.authorId)}
              className="rounded-sm font-medium text-foreground outline-none hover:text-link focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              {name}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{name}</span>
          )}
          <span aria-hidden="true">·</span>
          <time dateTime={comment.createdAt}>{formatReportDate(comment.createdAt, locale)}</time>
          {comment.canDelete && (
            <button
              type="button"
              onClick={onDelete}
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
        {canReply && !replying && (
          <button
            type="button"
            onClick={onReplyOpen}
            className={cn(
              '-ml-2 inline-flex h-8 items-center gap-1.5 self-start rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors',
              'outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50'
            )}
          >
            <Reply aria-hidden="true" className="size-3.5" />
            {t('reply')}
          </button>
        )}
        {replying && (
          <div className="mt-1">
            <CommentForm
              label={t('replyLabel', { name })}
              placeholder={t('replyPlaceholder')}
              initialBody={mention}
              onCancel={onReplyClose}
              onSubmit={onReplySubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
};
