import { describe, it, expect } from 'vitest';

import { slugify } from './slugify';

describe('slugify', () => {
  it('slugifies English text', () => {
    expect(slugify('Broken streetlight on Chavchavadze Ave.')).toBe('broken-streetlight-on-chavchavadze-ave');
  });

  it('transliterates Georgian', () => {
    expect(slugify('ორმო ვაჟა-ფშაველას გამზირზე')).toBe('ormo-vazha-pshavelas-gamzirze');
  });

  it('caps the length without a trailing dash', () => {
    const slug = slugify('a'.repeat(50) + ' ' + 'b'.repeat(50));
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug.endsWith('-')).toBe(false);
  });

  it('falls back when nothing is left', () => {
    expect(slugify('!!!')).toBe('report');
  });
});
