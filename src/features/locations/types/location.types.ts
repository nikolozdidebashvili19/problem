import { LOCATION_LEVELS } from '@/shared/const/locations.const';
import { GeoPoint, LngLat } from '@/shared/utils/geo';

export type LocationLevel = (typeof LOCATION_LEVELS)[number];

export type LocationSummary = {
  slug: string;
  nameKa: string;
  nameEn: string;
  level: LocationLevel;
  parentSlug: string | null;
  reportingDisabled: boolean;
};

export type ResolvedLocation = {
  region: LocationSummary | null;
  municipality: LocationSummary | null;
  neighborhood: LocationSummary | null;
  source: 'boundary' | 'centroid';
};

export type LocationSeedEntry = {
  slug: string;
  nameKa: string;
  nameEn: string;
  level: LocationLevel;
  parentSlug?: string;
  centroid: LngLat;
  reportingDisabled?: boolean;
};

export type LocationSeedInput = Omit<LocationSeedEntry, 'centroid' | 'reportingDisabled'> & {
  centroid: GeoPoint;
  reportingDisabled: boolean;
};
