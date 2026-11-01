'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { VoteResult } from '@/features/reports/types/report.types';
import { http } from '@/shared/lib/http';

type UseUpvoteOptions = {
  shortId: string;
  initialVoted: boolean;
  initialCount: number;
};

type HttpError = Error & { status?: number };

export const useUpvote = ({ shortId, initialVoted, initialCount }: UseUpvoteOptions) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status: sessionStatus } = useSession();
  const [voted, setVoted] = useState(initialVoted);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const goToSignIn = () => {
    const query = searchParams.toString();
    const callbackUrl = query ? `${pathname}?${query}` : pathname;
    router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  const toggle = async () => {
    if (pending) return;
    if (sessionStatus !== 'authenticated') {
      goToSignIn();
      return;
    }

    const previous = { voted, count };
    const next = !voted;
    // Optimistic update, rolled back if the server rejects it
    setVoted(next);
    setCount(count + (next ? 1 : -1));
    setPending(true);
    try {
      const result = await http.post<VoteResult>(`/reports/${shortId}/vote`, { voted: next });
      setVoted(result.voted);
      setCount(result.upvoteCount);
    } catch (error) {
      setVoted(previous.voted);
      setCount(previous.count);
      if ((error as HttpError).status === 401) goToSignIn();
    } finally {
      setPending(false);
    }
  };

  return { voted, count, pending, toggle };
};
