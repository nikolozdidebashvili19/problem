import { describe, it, expect } from 'vitest';

import { computeHotScore } from './hot-score';

const EPOCH = new Date(1735689600 * 1000);
const TWO_DAYS_MS = 172800 * 1000;

describe('computeHotScore', () => {
  it('is 0 for a report with no votes created at the epoch', () => {
    expect(computeHotScore(0, EPOCH)).toBe(0);
  });

  it('treats 0 and 1 votes the same', () => {
    expect(computeHotScore(0, EPOCH)).toBe(computeHotScore(1, EPOCH));
  });

  it('values 10x votes the same as being 2 days newer', () => {
    const older = computeHotScore(100, EPOCH);
    const newer = computeHotScore(10, new Date(EPOCH.getTime() + TWO_DAYS_MS));
    expect(older).toBeCloseTo(newer);
  });

  it('ranks newer reports higher at equal votes', () => {
    expect(computeHotScore(5, new Date(EPOCH.getTime() + 1000))).toBeGreaterThan(computeHotScore(5, EPOCH));
  });
});
