'use client';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CommentForm } from '@/features/comments/components/comment-form';
import { CommentItem } from '@/features/comments/components/comment-item';
import { useComments } from '@/features/comments/hooks/use-comments';
import { CommentPage, CommentView } from '@/features/comments/types/comment.types';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/const/routes.const';
import { useErrorMessage } from '@/shared/hooks/use-error-message';
import { groupCommentThreads } from '@/shared/utils/comment-threads';

type CommentSectionProps = {
  shortId: string;
  initial: CommentPage;
  total: number;
  signedIn: boolean;
};

export const CommentSection = ({ shortId, initial, total, signedIn }: CommentSectionProps) => {
  const t = useTranslations('comments');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const errorMessage = useErrorMessage();
  const { items, delta, hasMore, loadingMore, loadMore, add, remove, error } = useComments(shortId, initial);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const submitReply = async (commentId: string, body: string) => {
    const posted = await add(body, commentId);
    if (posted) setReplyingTo(null);
    return posted;
  };

  const renderComment = (comment: CommentView) => (
    <CommentItem
      comment={comment}
      canReply={signedIn}
      replying={replyingTo === comment.id}
      onReplyOpen={() => setReplyingTo(comment.id)}
      onReplyClose={() => setReplyingTo(null)}
      onReplySubmit={(body) => submitReply(comment.id, body)}
      onDelete={() => remove(comment.id)}
    />
  );

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-4">
      <h2 id="comments-heading" className="text-lg">
        {t('title')} <span className="font-normal text-muted-foreground">({Math.max(total + delta, items.length)})</span>
      </h2>

      {signedIn ? (
        <CommentForm label={t('label')} placeholder={t('placeholder')} onSubmit={(body) => add(body)} />
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
          {groupCommentThreads(items).map((thread) => (
            <li key={thread.id} className="flex flex-col gap-3 p-3 sm:p-4">
              {thread.root ? renderComment(thread.root) : <p className="text-sm text-muted-foreground">{t('deletedComment')}</p>}
              {thread.replies.length > 0 && (
                <ul aria-label={t('repliesLabel')} className="ml-4 flex flex-col gap-3 border-l border-border pl-3 sm:ml-11">
                  {thread.replies.map((reply) => (
                    <li key={reply.id}>{renderComment(reply)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
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
