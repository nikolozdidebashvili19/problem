import { describe, it, expect } from 'vitest';

import { safeCallbackUrl } from './safe-callback-url';

describe('safeCallbackUrl', () => {
  it('keeps same-origin paths', () => {
    expect(safeCallbackUrl('/report/new')).toBe('/report/new');
    expect(safeCallbackUrl('/?tab=new&location=tbilisi-vake')).toBe('/?tab=new&location=tbilisi-vake');
  });

  it('rejects external and protocol-relative targets', () => {
    expect(safeCallbackUrl('https://evil.example')).toBe('/');
    expect(safeCallbackUrl('//evil.example')).toBe('/');
    expect(safeCallbackUrl('/\\evil.example')).toBe('/');
    expect(safeCallbackUrl(null)).toBe('/');
  });
});
