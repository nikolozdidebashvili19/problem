import { describe, it, expect } from 'vitest';

import { generateShortId } from './short-id';

describe('generateShortId', () => {
  it('returns an 8 char url-safe id', () => {
    expect(generateShortId()).toMatch(/^[a-km-np-z2-9]{8}$/);
  });

  it('produces distinct ids', () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateShortId()));
    expect(ids.size).toBe(500);
  });
});
