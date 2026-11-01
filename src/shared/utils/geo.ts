import { GEORGIA_BBOX } from '@/shared/const/geo.const';

export type LngLat = [number, number];

export type GeoPoint = { type: 'Point'; coordinates: LngLat };

// GeoJSON order is [lng, lat] — never [lat, lng]
export function toGeoPoint(lng: number, lat: number): GeoPoint {
  return { type: 'Point', coordinates: [lng, lat] };
}

export function isInsideGeorgiaBBox([lng, lat]: LngLat): boolean {
  return (
    lng >= GEORGIA_BBOX.minLng &&
    lng <= GEORGIA_BBOX.maxLng &&
    lat >= GEORGIA_BBOX.minLat &&
    lat <= GEORGIA_BBOX.maxLat
  );
}
