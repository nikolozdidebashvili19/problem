import { locationRepository } from '@/features/locations/repository/location.repository';
import { LocationDocument } from '@/features/locations/schema/location.schema';
import { LocationLevel, LocationSummary, ResolvedLocation } from '@/features/locations/types/location.types';
import {
  ListLocationsQueryType,
  ResolvePointQueryType,
} from '@/features/locations/validations/location.validation';
import {
  MUNICIPALITY_FALLBACK_RADIUS_M,
  NEIGHBORHOOD_FALLBACK_RADIUS_M,
  REGION_FALLBACK_RADIUS_M,
} from '@/shared/const/geo.const';
import { LOCATION_SEED } from '@/shared/const/locations.const';
import { ServiceResult } from '@/shared/types/common';
import { GeoPoint, isInsideGeorgiaBBox, toGeoPoint } from '@/shared/utils/geo';

function toSummary(location: LocationDocument): LocationSummary {
  return {
    slug: location.slug,
    nameKa: location.nameKa,
    nameEn: location.nameEn,
    level: location.level as LocationLevel,
    parentSlug: location.parentSlug ?? null,
    reportingDisabled: location.reportingDisabled,
  };
}

export async function listLocationsService(
  query: ListLocationsQueryType
): Promise<ServiceResult<{ items: LocationSummary[] }>> {
  const locations = query.parent
    ? await locationRepository.findByParent(query.parent)
    : await locationRepository.findRoots();
  return { data: { items: locations.map(toSummary) }, status: 200 };
}

async function resolveByCentroid(point: GeoPoint) {
  const municipality = await locationRepository.findNearestByCentroid(
    point,
    'municipality',
    MUNICIPALITY_FALLBACK_RADIUS_M
  );
  const nearestNeighborhood = municipality
    ? await locationRepository.findNearestByCentroid(point, 'neighborhood', NEIGHBORHOOD_FALLBACK_RADIUS_M)
    : null;
  const neighborhood = nearestNeighborhood?.parentSlug === municipality?.slug ? nearestNeighborhood : null;
  return { municipality, neighborhood };
}

export async function resolvePointService(
  query: ResolvePointQueryType
): Promise<ServiceResult<ResolvedLocation>> {
  if (!isInsideGeorgiaBBox([query.lng, query.lat])) {
    return { data: { error: 'OUTSIDE_GEORGIA' }, status: 400 };
  }
  const point = toGeoPoint(query.lng, query.lat);

  // Prefer real boundary polygons; fall back to nearest centroids while boundaries are not imported
  const containing = await locationRepository.findContaining(point);
  const source = containing.length > 0 ? 'boundary' : 'centroid';
  const byLevel = (level: LocationLevel) => containing.find((location) => location.level === level) ?? null;

  const { municipality, neighborhood } =
    source === 'boundary'
      ? { municipality: byLevel('municipality'), neighborhood: byLevel('neighborhood') }
      : await resolveByCentroid(point);

  const region =
    byLevel('region') ??
    (municipality?.parentSlug
      ? await locationRepository.findBySlug(municipality.parentSlug)
      : await locationRepository.findNearestByCentroid(point, 'region', REGION_FALLBACK_RADIUS_M));

  return {
    data: {
      region: region ? toSummary(region) : null,
      municipality: municipality ? toSummary(municipality) : null,
      neighborhood: neighborhood ? toSummary(neighborhood) : null,
      source,
    },
    status: 200,
  };
}

export async function seedLocationsService(): Promise<{ count: number }> {
  await Promise.all(
    LOCATION_SEED.map(({ centroid, reportingDisabled, ...location }) =>
      locationRepository.upsertBySlug({
        ...location,
        centroid: toGeoPoint(centroid[0], centroid[1]),
        reportingDisabled: reportingDisabled ?? false,
      })
    )
  );
  return { count: LOCATION_SEED.length };
}

export type LocationChain = {
  leaf: LocationDocument;
  region: LocationDocument;
  municipality: LocationDocument | null;
  neighborhood: LocationDocument | null;
};

// Expands the most specific location a user picked into region → municipality → neighborhood
export async function getLocationChainService(slug: string): Promise<LocationChain | null> {
  const leaf = await locationRepository.findBySlug(slug);
  if (!leaf) return null;

  const chain: LocationDocument[] = [leaf];
  let current = leaf;
  // Hierarchy depth is at most 3, the bound guards against a malformed parent cycle
  for (let depth = 0; current.parentSlug && depth < 3; depth += 1) {
    const parent = await locationRepository.findBySlug(current.parentSlug);
    if (!parent) return null;
    chain.push(parent);
    current = parent;
  }

  const byLevel = (level: LocationLevel) => chain.find((location) => location.level === level) ?? null;
  const region = byLevel('region');
  if (!region) return null;
  return { leaf, region, municipality: byLevel('municipality'), neighborhood: byLevel('neighborhood') };
}
