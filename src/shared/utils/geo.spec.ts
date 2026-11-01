import { describe, it, expect } from 'vitest';

import { isInsideGeorgiaBBox, toGeoPoint } from './geo';

const TBILISI: [number, number] = [44.8271, 41.7151];
const BATUMI: [number, number] = [41.6367, 41.6168];

describe('toGeoPoint', () => {
  it('builds a GeoJSON point with lng first', () => {
    expect(toGeoPoint(44.8271, 41.7151)).toEqual({ type: 'Point', coordinates: TBILISI });
  });
});

describe('isInsideGeorgiaBBox', () => {
  it('accepts points in Georgia', () => {
    expect(isInsideGeorgiaBBox(TBILISI)).toBe(true);
    expect(isInsideGeorgiaBBox(BATUMI)).toBe(true);
  });

  it('rejects swapped [lat, lng] coordinates', () => {
    expect(isInsideGeorgiaBBox([TBILISI[1], TBILISI[0]])).toBe(false);
  });

  it('rejects points outside Georgia', () => {
    expect(isInsideGeorgiaBBox([49.8671, 40.4093])).toBe(false); // Baku
    expect(isInsideGeorgiaBBox([0, 0])).toBe(false);
  });
});
