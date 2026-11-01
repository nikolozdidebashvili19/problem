import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { ReportForm } from '@/features/reports/components/report-form';
import { getReportFormDataService } from '@/features/reports/service/report-form-data.service';
import { PageHeader } from '@/shared/components/layout/page-header';
import { ROUTES } from '@/shared/const/routes.const';
import { getViewerId } from '@/shared/middleware/get-viewer';

export const NewReportView = async () => {
  if (!(await getViewerId())) redirect(`${ROUTES.signIn}?callbackUrl=${encodeURIComponent(ROUTES.newReport)}`);

  const t = await getTranslations('reportForm');
  const data = await getReportFormDataService();

  return (
    <section className="flex flex-col gap-5">
      <PageHeader title={t('newTitle')} description={t('newDescription')} />
      <ReportForm {...data} />
    </section>
  );
};
