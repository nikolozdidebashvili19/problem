'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import { getCallbackUrl, useLogin } from '@/features/auth/hooks/use-login';
import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { LoginSchema, LoginType } from '@/features/auth/validations/auth.validation';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

export const LoginForm = () => {
  const { login } = useLogin();
  const t = useTranslations('auth');
  const { loading, error } = useAuthStore();
  const errorKey = `errors.${error}`;

  const form = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' },
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{t('signInTitle')}</CardTitle>
        <CardDescription>{t('signInDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(login)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {t.has(errorKey) ? t(errorKey) : t('errors.LOGIN_FAILED')}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('signingIn') : t('signInTitle')}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t('or')}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn('google', { callbackUrl: getCallbackUrl() })}
            >
              {t('continueWithGoogle')}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/sign-up" className="underline underline-offset-4 hover:text-primary">
                {t('signUp')}
              </Link>
            </p>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
