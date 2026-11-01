'use client';
import { useEffect } from 'react';

import { FeedErrorState } from '@/features/reports/components/feed-error-state';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <FeedErrorState onRetry={reset} />;
}
