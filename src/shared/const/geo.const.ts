// Coarse bounding box around Georgia's borders (incl. occupied territories). Used as a cheap pre-check
// before the polygon check that lands with the OSM boundary import (T-007 step 7).
export const GEORGIA_BBOX = {
  minLng: 39.9,
  maxLng: 46.8,
  minLat: 41.0,
  maxLat: 43.65,
} as const;

// Max distance from a district centroid for the centroid fallback in point resolution
export const MUNICIPALITY_FALLBACK_RADIUS_M = 20000;

export const NEIGHBORHOOD_FALLBACK_RADIUS_M = 1500;

export const REGION_FALLBACK_RADIUS_M = 300000;
