'use client';
import { Siren } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';

import { CategorySummary } from '@/features/categories/types/category.types';
import { ReportFormType } from '@/features/reports/validations/report.validation';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { NativeSelect } from '@/shared/components/ui/native-select';
import { Textarea } from '@/shared/components/ui/textarea';
import { localizedName } from '@/shared/utils/locale';

type ReportDetailsFieldsProps = {
  categories: CategorySummary[];
};

export const ReportDetailsFields = ({ categories }: ReportDetailsFieldsProps) => {
  const t = useTranslations('reportForm');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const form = useFormContext<ReportFormType>();
  const severity = useWatch({ control: form.control, name: 'severity' });

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('title')}</FormLabel>
            <FormControl>
              <Input {...field} placeholder={t('titlePlaceholder')} className="h-10" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('description')}</FormLabel>
            <FormControl>
              <Textarea {...field} rows={5} placeholder={t('descriptionPlaceholder')} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="categorySlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('category')}</FormLabel>
              <FormControl>
                <NativeSelect {...field}>
                  <option value="">{t('choose')}</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>
                      {localizedName(category, locale)}
                    </option>
                  ))}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('severity')}</FormLabel>
              <FormControl>
                <NativeSelect {...field}>
                  <option value="">{t('severityNone')}</option>
                  <option value="low">{t('severityLow')}</option>
                  <option value="medium">{t('severityMedium')}</option>
                  <option value="dangerous">{t('severityDangerous')}</option>
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      {severity === 'dangerous' && (
        <p role="alert" className="flex gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <Siren aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {tCommon('emergencyNotice')}
        </p>
      )}
    </>
  );
};
