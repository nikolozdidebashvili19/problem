'use client';
import { signIn } from 'next-auth/react';

import { getCallbackUrl } from '@/features/auth/hooks/use-login';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { SignUpType } from '@/features/auth/validations/auth.validation';
import { http } from '@/shared/lib/http';

export const useRegister = () => {
  const { setLoading, setError } = useAuthStore();

  const register = async (data: SignUpType) => {
    setLoading(true);
    setError(null);
    try {
      await http.post('/auth/register', data);
      // Sign straight in so a new user can browse and post immediately
      const result = await signIn('credentials', { email: data.email, password: data.password, redirect: false });
      window.location.href = result?.ok ? getCallbackUrl() : '/sign-in';
    } catch (err) {
      // API error codes (e.g. EMAIL_TAKEN) are translated by the form; anything else is generic
      setError(err instanceof Error ? err.message : 'REGISTRATION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return { register };
};
