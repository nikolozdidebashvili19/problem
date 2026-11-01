import { Suspense, type ReactNode } from 'react';

import { FeedSidebar } from '@/features/reports/components/feed-sidebar';
import { getFeedSidebarService } from '@/features/reports/service/feed-navigation.service';
import { AboutPanel } from '@/shared/components/layout/about-panel';
import { AppShell } from '@/shared/components/layout/app-shell';
import { Footer } from '@/shared/components/layout/footer';

// Navigation comes from the DB, so never prerender at build time
export const dynamic = 'force-dynamic';

export default async function MainLayout({ children }: { children: ReactNode }) {
  const { categories, districts } = await getFeedSidebarService();

  return (
    <AppShell
      sidebar={
        <Suspense>
          <FeedSidebar categories={categories} districts={districts} />
        </Suspense>
      }
      rail={<AboutPanel />}
    >
      {children}
      <Footer />
    </AppShell>
  );
}
