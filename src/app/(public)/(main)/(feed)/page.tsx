import { FeedView } from '@/features/reports/components/feed-view';

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  return <FeedView searchParams={await searchParams} />;
}
