import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ReportForm } from '@/features/reports/components/report-form';
import { getReportDetailService } from '@/features/reports/service/report-detail.service';
import { getReportFormDataService } from '@/features/reports/service/report-form-data.service';
import { PageHeader } from '@/shared/components/layout/page-header';
import { ROUTES } from '@/shared/const/routes.const';
import { getViewer } from '@/shared/middleware/get-viewer';

type EditReportViewProps = {
  shortId: string;
};

export const EditReportView = async ({ shortId }: EditReportViewProps) => {
  const viewer = await getViewer();
  if (!viewer) redirect(`${ROUTES.signIn}?callbackUrl=${encodeURIComponent(ROUTES.editReport(shortId))}`);

  const result = await getReportDetailService(shortId, viewer);
  if (!('id' in result.data)) notFound();
  const report = result.data;
  if (!report.canEdit) redirect(ROUTES.report(report.shortId, report.slug));

  const [t, data] = await Promise.all([getTranslations('reportForm'), getReportFormDataService()]);

  return (
    <section className="flex flex-col gap-5">
      <PageHeader title={t('editTitle')} description={t('editDescription')} />
      <ReportForm
        {...data}
        editing={{
          shortId: report.shortId,
          values: {
            title: report.title,
            description: report.description,
            categorySlug: report.categorySlug,
            addressHint: report.addressHint ?? '',
            severity: report.severity === 'low' || report.severity === 'medium' || report.severity === 'dangerous' ? report.severity : '',
            regionSlug: '',
            municipalitySlug: '',
            neighborhoodSlug: '',
            point: null,
            images: [],
          },
        }}
      />
    </section>
  );
};
