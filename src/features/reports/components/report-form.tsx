'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';

import { CategorySummary } from '@/features/categories/types/category.types';
import { LocationSummary } from '@/features/locations/types/location.types';
import { ImageUploader } from '@/features/reports/components/image-uploader';
import { LocationPicker } from '@/features/reports/components/location-picker';
import { ReportDetailsFields } from '@/features/reports/components/report-details-fields';
import { useSaveReport } from '@/features/reports/hooks/use-save-report';
import { ReportFormSchema, ReportFormType } from '@/features/reports/validations/report.validation';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { useErrorMessage } from '@/shared/hooks/use-error-message';

type ReportFormProps = {
  categories: CategorySummary[];
  regions: LocationSummary[];
  preloadedLocations: Record<string, LocationSummary[]>;
  uploadsEnabled: boolean;
  // Present when editing; location and photos are fixed after publishing
  editing?: { shortId: string; values: ReportFormType };
};

const EMPTY_VALUES: ReportFormType = {
  title: '',
  description: '',
  categorySlug: '',
  addressHint: '',
  severity: '',
  regionSlug: 'tbilisi',
  municipalitySlug: '',
  neighborhoodSlug: '',
  point: null,
  images: [],
};

const FormSection = ({ title, description, children }: { title: string; description?: string; children: ReactNode }) => (
  <fieldset className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:p-5">
    <legend className="sr-only">{title}</legend>
    <div className="flex flex-col gap-1">
      <h2 className="text-base">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    {children}
  </fieldset>
);

export const ReportForm = ({ categories, regions, preloadedLocations, uploadsEnabled, editing }: ReportFormProps) => {
  const t = useTranslations('reportForm');
  const tErrors = useTranslations('errors');
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const { save, error } = useSaveReport(editing?.shortId);
  const [uploading, setUploading] = useState(false);

  const form = useForm<ReportFormType>({
    resolver: zodResolver(ReportFormSchema),
    defaultValues: editing?.values ?? EMPTY_VALUES,
  });
  const submitting = form.formState.isSubmitting;

  const onSubmit = async (values: ReportFormType) => {
    if (!editing) {
      if (!values.regionSlug) {
        form.setError('regionSlug', { message: tErrors('INVALID_LOCATION') });
        return;
      }
      if (uploadsEnabled && values.images.length === 0) {
        form.setError('images', { message: tErrors('PHOTO_REQUIRED') });
        return;
      }
    }
    await save(values);
  };

  const submitLabel = editing ? (submitting ? t('saving') : t('save')) : submitting ? t('submitting') : t('submit');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {!editing && (
          <FormSection title={t('photos')} description={uploadsEnabled ? t('photosHint') : t('photosDisabled')}>
            {uploadsEnabled && (
              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    <ImageUploader
                      onChange={(images) => form.setValue('images', images, { shouldValidate: images.length > 0 })}
                      onUploadingChange={setUploading}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </FormSection>
        )}

        {!editing && (
          <FormSection title={t('location')}>
            <LocationPicker regions={regions} preloaded={preloadedLocations} />
            <FormField
              control={form.control}
              name="addressHint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t('addressHint')} <span className="font-normal text-muted-foreground">({t('optional')})</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('addressHintPlaceholder')} className="h-10" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormSection>
        )}

        <FormSection title={t('details')}>
          <ReportDetailsFields categories={categories} />
        </FormSection>

        {error !== null && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {errorMessage(error)}
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="h-11">
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={submitting || uploading} className="h-11 rounded-full px-6 font-semibold">
            {submitting && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
};
