'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CreateReportType, ReportFormType, UpdateReportType } from '@/features/reports/validations/report.validation';
import { ROUTES } from '@/shared/const/routes.const';
import { http } from '@/shared/lib/http';

type ReportRef = { shortId: string; slug: string };

function detailsPayload(values: ReportFormType): UpdateReportType {
  return {
    title: values.title,
    description: values.description,
    categorySlug: values.categorySlug,
    addressHint: values.addressHint || undefined,
    severity: values.severity || undefined,
  };
}

export const useSaveReport = (editingShortId?: string) => {
  const router = useRouter();
  // One key per form instance: a double tap or network retry can never create two reports
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [error, setError] = useState<unknown>(null);

  const save = async (values: ReportFormType) => {
    setError(null);
    try {
      const saved = editingShortId
        ? await http.patch<ReportRef>(`/reports/${editingShortId}`, detailsPayload(values))
        : await http.post<ReportRef>('/reports', {
          ...detailsPayload(values),
          locationSlug: values.neighborhoodSlug || values.municipalitySlug || values.regionSlug,
          point: values.point ?? undefined,
          images: values.images,
          idempotencyKey,
        } satisfies CreateReportType);
      router.push(ROUTES.report(saved.shortId, saved.slug));
      router.refresh();
    } catch (saveError) {
      setError(saveError);
    }
  };

  return { save, error };
};
