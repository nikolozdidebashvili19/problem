'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { MarkFixedFormType } from '@/features/reports/validations/report.validation';
import { ROUTES } from '@/shared/const/routes.const';
import { http } from '@/shared/lib/http';

export const useReportActions = (shortId: string) => {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const deleteReport = async () => {
    setDeleting(true);
    setError(null);
    try {
      await http.delete(`/reports/${shortId}`);
      router.push(ROUTES.home);
      router.refresh();
    } catch (deleteError) {
      setError(deleteError);
      setDeleting(false);
    }
  };

  // Returns true on success so the form can close itself
  const markFixed = async (values: MarkFixedFormType): Promise<boolean> => {
    setError(null);
    try {
      await http.post(`/reports/${shortId}/fixed`, { note: values.note || undefined, images: values.images });
      router.refresh();
      return true;
    } catch (fixError) {
      setError(fixError);
      return false;
    }
  };

  return { deleteReport, deleting, markFixed, error };
};
