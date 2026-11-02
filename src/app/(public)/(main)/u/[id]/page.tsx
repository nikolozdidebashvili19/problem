import { ProfileView } from '@/features/profiles/components/profile-view';
import { loadProfilePageService } from '@/features/profiles/service/profile-page.service';

import type { Metadata } from 'next';

type ProfilePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await loadProfilePageService(id);
  return 'error' in result.data ? {} : { title: result.data.name };
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  return <ProfileView id={id} tab={Array.isArray(tab) ? tab[0] : tab} />;
}
