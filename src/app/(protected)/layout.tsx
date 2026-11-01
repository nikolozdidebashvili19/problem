import { redirect } from 'next/navigation';
import { type ReactNode } from 'react';

import { UserRole } from '@/features/auth/types/auth.types';
import { DashboardShell } from '@/shared/components/layout/dashboard-shell';
import { Header } from '@/shared/components/layout/header';
import { auth } from '@/shared/lib/auth';
import { SessionProvider } from '@/shared/providers/session-provider';
import { StoreProvider } from '@/shared/providers/store-provider';

type SessionUser = {
  role?: UserRole;
};

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const sessionUser = session?.user as SessionUser | undefined;

  if (!session) redirect('/');
  if (sessionUser?.role !== 'admin') redirect('/');

  return (
    <SessionProvider>
      <StoreProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <DashboardShell>{children}</DashboardShell>
        </div>
      </StoreProvider>
    </SessionProvider>
  );
}
