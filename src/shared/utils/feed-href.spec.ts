import { describe, it, expect } from 'vitest';

import { buildFeedHref } from './feed-href';

describe('buildFeedHref', () => {
  it('returns the root for the default view', () => {
    expect(buildFeedHref({})).toBe('/');
    expect(buildFeedHref({ tab: 'popular' })).toBe('/');
  });

  it('keeps existing filters when switching tabs', () => {
    expect(buildFeedHref({ category: 'roads', location: 'tbilisi-vake' }, { tab: 'new' })).toBe(
      '/?tab=new&category=roads&location=tbilisi-vake'
    );
  });

  it('clears a filter when patched with undefined', () => {
    expect(buildFeedHref({ tab: 'fixed', category: 'roads' }, { category: undefined })).toBe('/?tab=fixed');
  });

  it('encodes search text', () => {
    expect(buildFeedHref({ q: 'ორმო ვაკე' })).toBe('/?q=%E1%83%9D%E1%83%A0%E1%83%9B%E1%83%9D+%E1%83%95%E1%83%90%E1%83%99%E1%83%94');
  });
});
