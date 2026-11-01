import { EditReportView } from '@/features/reports/components/edit-report-view';

type EditReportPageProps = {
  params: Promise<{ shortId: string }>;
};

export default async function EditReportPage({ params }: EditReportPageProps) {
  const { shortId } = await params;
  return <EditReportView shortId={shortId} />;
}
