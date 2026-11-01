'use client';
import { Crosshair, Loader2, MapPinCheck } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useFormContext, useWatch } from 'react-hook-form';

import { useCurrentLocation } from '@/features/locations/hooks/use-current-location';
import { useLocationOptions } from '@/features/locations/hooks/use-location-options';
import { LocationSummary } from '@/features/locations/types/location.types';
import { ReportFormType } from '@/features/reports/validations/report.validation';
import { Button } from '@/shared/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { NativeSelect } from '@/shared/components/ui/native-select';
import { useErrorMessage } from '@/shared/hooks/use-error-message';
import { localizedName } from '@/shared/utils/locale';

type LocationPickerProps = {
  regions: LocationSummary[];
  preloaded: Record<string, LocationSummary[]>;
};

export const LocationPicker = ({ regions, preloaded }: LocationPickerProps) => {
  const t = useTranslations('reportForm');
  const tFeed = useTranslations('feed');
  const locale = useLocale();
  const errorMessage = useErrorMessage();
  const form = useFormContext<ReportFormType>();
  const [regionSlug, municipalitySlug, point] = useWatch({
    control: form.control,
    name: ['regionSlug', 'municipalitySlug', 'point'],
  });

  const municipalities = useLocationOptions(regionSlug, preloaded);
  const neighborhoods = useLocationOptions(municipalitySlug, preloaded);

  const { locate, locating, error } = useCurrentLocation(({ resolved, point: located }) => {
    form.setValue('regionSlug', resolved.region?.slug ?? '', { shouldValidate: true });
    form.setValue('municipalitySlug', resolved.municipality?.slug ?? '');
    form.setValue('neighborhoodSlug', resolved.neighborhood?.slug ?? '');
    form.setValue('point', located);
  });

  // A manual change of place means the GPS point no longer describes the report
  const clearPoint = () => form.setValue('point', null);

  const optionList = (items: LocationSummary[]) =>
    items.map((item) => (
      <option key={item.slug} value={item.slug} disabled={item.reportingDisabled}>
        {localizedName(item, locale)}
      </option>
    ));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={locate} disabled={locating} className="h-10">
          {locating ? <Loader2 aria-hidden="true" className="size-4 animate-spin" /> : <Crosshair aria-hidden="true" className="size-4" />}
          {locating ? t('locating') : t('useMyLocation')}
        </Button>
        {point && (
          <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-300">
            <MapPinCheck aria-hidden="true" className="size-4" />
            {t('locationSet')}
          </span>
        )}
        {error && (
          <p role="alert" className="w-full text-sm text-destructive">
            {errorMessage(error)}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          control={form.control}
          name="regionSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('region')}</FormLabel>
              <FormControl>
                <NativeSelect
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    form.setValue('municipalitySlug', '');
                    form.setValue('neighborhoodSlug', '');
                    clearPoint();
                  }}
                >
                  <option value="">{t('choose')}</option>
                  {optionList(regions)}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="municipalitySlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('municipality')}</FormLabel>
              <FormControl>
                <NativeSelect
                  {...field}
                  disabled={!regionSlug || municipalities.loading}
                  onChange={(event) => {
                    field.onChange(event);
                    form.setValue('neighborhoodSlug', '');
                    clearPoint();
                  }}
                >
                  <option value="">{municipalities.loading ? tFeed('loading') : t('choose')}</option>
                  {optionList(municipalities.options)}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="neighborhoodSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('neighborhood')} <span className="font-normal text-muted-foreground">({t('optional')})</span>
              </FormLabel>
              <FormControl>
                <NativeSelect
                  {...field}
                  disabled={!municipalitySlug || neighborhoods.options.length === 0}
                  onChange={(event) => {
                    field.onChange(event);
                    clearPoint();
                  }}
                >
                  <option value="">{t('choose')}</option>
                  {optionList(neighborhoods.options)}
                </NativeSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
