import { describe, it, expect } from 'vitest';

import { isLocale, localizedName, resolveLocale } from './locale';

describe('resolveLocale', () => {
  it('defaults to Georgian', () => {
    expect(resolveLocale(undefined)).toBe('ka');
    expect(resolveLocale('fr')).toBe('ka');
  });

  it('honours an explicit supported choice', () => {
    expect(resolveLocale('en')).toBe('en');
    expect(resolveLocale('ka')).toBe('ka');
  });
});

describe('isLocale', () => {
  it('only accepts supported locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('EN')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});

describe('localizedName', () => {
  const vake = { nameKa: 'ვაკე', nameEn: 'Vake' };

  it('picks the name for the active locale', () => {
    expect(localizedName(vake, 'ka')).toBe('ვაკე');
    expect(localizedName(vake, 'en')).toBe('Vake');
  });
});
