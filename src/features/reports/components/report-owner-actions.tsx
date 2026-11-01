'use client';
import { CircleCheckBig, Loader2, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { MarkFixedForm } from '@/features/reports/components/mark-fixed-form';
import { useReportActions } from '@/features/reports/hooks/use-report-actions';
import { Button } from '@/shared/components/ui/button';
import { ROUTES } from '@/shared/const/routes.const';
import { useErrorMessage } from '@/shared/hooks/use-error-message';

type ReportOwnerActionsProps = {
  shortId: string;
  canEdit: boolean;
  canMarkFixed: boolean;
  canDelete: boolean;
  uploadsEnabled: boolean;
};

type Panel = 'none' | 'fix' | 'delete';

export const ReportOwnerActions = ({ shortId, canEdit, canMarkFixed, canDelete, uploadsEnabled }: ReportOwnerActionsProps) => {
  const t = useTranslations('reportPage');
  const tForm = useTranslations('reportForm');
  const errorMessage = useErrorMessage();
  const [panel, setPanel] = useState<Panel>('none');
  const { deleteReport, deleting, markFixed, error } = useReportActions(shortId);

  if (!canEdit && !canMarkFixed && !canDelete) return null;

  return (
    <section aria-label={t('ownerActions')} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {canMarkFixed && (
          <Button
            onClick={() => setPanel(panel === 'fix' ? 'none' : 'fix')}
            aria-expanded={panel === 'fix'}
            className="h-10 rounded-full bg-emerald-700 px-4 font-semibold text-white hover:bg-emerald-800"
          >
            <CircleCheckBig aria-hidden="true" className="size-4" />
            {t('markFixed')}
          </Button>
        )}
        {canEdit && (
          <Button variant="outline" asChild className="h-10 rounded-full px-4">
            <Link href={ROUTES.editReport(shortId)}>
              <Pencil aria-hidden="true" className="size-4" />
              {t('edit')}
            </Link>
          </Button>
        )}
        {canDelete && (
          <Button
            variant="outline"
            onClick={() => setPanel(panel === 'delete' ? 'none' : 'delete')}
            aria-expanded={panel === 'delete'}
            className="h-10 rounded-full px-4 text-destructive hover:text-destructive"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            {t('delete')}
          </Button>
        )}
      </div>

      {panel === 'fix' && (
        <MarkFixedForm uploadsEnabled={uploadsEnabled} onSubmit={markFixed} onCancel={() => setPanel('none')} />
      )}

      {panel === 'delete' && (
        <div role="alertdialog" aria-label={t('deleteConfirm')} className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-foreground">{t('deleteConfirm')}</p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setPanel('none')} className="h-10">
              {tForm('cancel')}
            </Button>
            <Button variant="destructive" onClick={deleteReport} disabled={deleting} className="h-10 rounded-full px-5 font-semibold">
              {deleting && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
              {deleting ? t('deleting') : t('deleteYes')}
            </Button>
          </div>
        </div>
      )}

      {error !== null && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {errorMessage(error)}
        </p>
      )}
    </section>
  );
};
