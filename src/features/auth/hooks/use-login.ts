'use client';
import { signIn, getSession } from 'next-auth/react';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { User } from '@/features/auth/types/auth.types';
import { LoginType } from '@/features/auth/validations/auth.validation';
import { safeCallbackUrl } from '@/shared/utils/safe-callback-url';

// Where the proxy sent the user from (e.g. /report/new), read at submit time
export function getCallbackUrl(): string {
  return safeCallbackUrl(new URLSearchParams(window.location.search).get('callbackUrl'));
}

export const useLogin = () => {
  const { setUser, setLoading, setError } = useAuthStore();

  const handleSession = async (setUserFn: typeof setUser) => {
    const session = await getSession();
    const sessionUser = session?.user as User | undefined;
    if (!sessionUser) return;

    setUserFn({
      id: sessionUser.id ?? '',
      name: sessionUser.name ?? '',
      email: sessionUser.email ?? '',
      role: sessionUser.role ?? 'citizen',
      status: sessionUser.status ?? 'active',
      avatar: sessionUser.avatar ?? '',
    });

    // Full navigation so every server component re-renders with the new session
    window.location.href = getCallbackUrl();
  };

  const login = async (data: LoginType) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Error codes, translated by the form (auth.errors.*)
        setError('INVALID_CREDENTIALS');
        return;
      }

      if (result?.ok) {
        await handleSession(setUser);
      }
    } catch {
      setError('LOGIN_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return { login };
};
