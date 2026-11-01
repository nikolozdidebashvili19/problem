'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheckBig, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { ImageUploader } from '@/features/reports/components/image-uploader';
import { MarkFixedFormSchema, MarkFixedFormType } from '@/features/reports/validations/report.validation';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Textarea } from '@/shared/components/ui/textarea';

type MarkFixedFormProps = {
  uploadsEnabled: boolean;
  onSubmit: (values: MarkFixedFormType) => Promise<boolean>;
  onCancel: () => void;
};

export const MarkFixedForm = ({ uploadsEnabled, onSubmit, onCancel }: MarkFixedFormProps) => {
  const t = useTranslations('reportPage');
  const tForm = useTranslations('reportForm');
  const tErrors = useTranslations('errors');
  const [uploading, setUploading] = useState(false);

  const form = useForm<MarkFixedFormType>({
    resolver: zodResolver(MarkFixedFormSchema),
    defaultValues: { note: '', images: [] },
  });
  const submitting = form.formState.isSubmitting;

  const submit = async (values: MarkFixedFormType) => {
    // "After" photo is the evidence for a fix whenever uploads are available (PRODUCT §1)
    if (uploadsEnabled && values.images.length === 0) {
      form.setError('images', { message: tErrors('PHOTO_REQUIRED') });
      return;
    }
    if (await onSubmit(values)) onCancel();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        noValidate
        className="flex flex-col gap-4 rounded-lg border border-emerald-600/30 bg-emerald-50/50 p-4 dark:bg-emerald-950/30"
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-base">{t('fixTitle')}</h3>
          <p className="text-sm text-muted-foreground">{t('fixDescription')}</p>
        </div>

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

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('fixNote')} <span className="font-normal text-muted-foreground">({tForm('optional')})</span>
              </FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} placeholder={t('fixNotePlaceholder')} className="min-h-16 bg-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onCancel} className="h-10">
            {tForm('cancel')}
          </Button>
          <Button type="submit" disabled={submitting || uploading} className="h-10 rounded-full px-5 font-semibold">
            {submitting ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <CircleCheckBig aria-hidden="true" className="size-4" />}
            {submitting ? t('markingFixed') : t('confirmFixed')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
