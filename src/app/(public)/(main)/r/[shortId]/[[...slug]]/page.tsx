import { ReportDetailView } from '@/features/reports/components/report-detail-view';
import { loadReportPageService } from '@/features/reports/service/report-page.service';

import type { Metadata } from 'next';

type ReportPageProps = {
  params: Promise<{ shortId: string; slug?: string[] }>;
};

// Open Graph tags so shared links preview with title, photo and status (PRODUCT §4.3)
export async function generateMetadata({ params }: ReportPageProps): Promise<Metadata> {
  const { shortId } = await params;
  const page = await loadReportPageService(shortId);
  if (page.kind !== 'ok') return {};
  const { report } = page;
  return {
    title: report.title,
    description: report.excerpt,
    openGraph: {
      title: report.title,
      description: report.excerpt,
      type: 'article',
      images: report.images[0] ? [{ url: report.images[0].url, width: report.images[0].width, height: report.images[0].height }] : [],
    },
  };
}

export default async function ReportPage({ params }: ReportPageProps) {
  const { shortId, slug } = await params;
  return <ReportDetailView shortId={shortId} slug={slug?.[0]} />;
}
