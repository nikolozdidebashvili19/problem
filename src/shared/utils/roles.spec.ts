import { describe, it, expect } from 'vitest';

import { hasRole, isUserRole } from './roles';

describe('isUserRole', () => {
  it('accepts known roles', () => {
    expect(isUserRole('citizen')).toBe(true);
    expect(isUserRole('moderator')).toBe(true);
    expect(isUserRole('admin')).toBe(true);
  });

  it('rejects unknown or legacy roles', () => {
    expect(isUserRole('user')).toBe(false);
    expect(isUserRole('')).toBe(false);
  });
});

describe('hasRole', () => {
  it('lets higher roles pass lower requirements', () => {
    expect(hasRole('admin', 'moderator')).toBe(true);
    expect(hasRole('moderator', 'citizen')).toBe(true);
    expect(hasRole('citizen', 'citizen')).toBe(true);
  });

  it('blocks lower roles from higher requirements', () => {
    expect(hasRole('citizen', 'moderator')).toBe(false);
    expect(hasRole('moderator', 'admin')).toBe(false);
  });

  it('blocks unknown roles', () => {
    expect(hasRole('user', 'citizen')).toBe(false);
  });
});
