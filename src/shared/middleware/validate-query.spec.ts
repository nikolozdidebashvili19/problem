import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import { validateQuery } from './validate-query';

const Schema = z.object({ lat: z.coerce.number().min(-90).max(90), q: z.string().optional() });

describe('validateQuery', () => {
  it('parses and coerces search params', () => {
    const req = new NextRequest('http://localhost/api/x?lat=41.7&q=road');
    expect(validateQuery(req, Schema)).toEqual({ data: { lat: 41.7, q: 'road' } });
  });

  it('returns 400 on invalid params', async () => {
    const req = new NextRequest('http://localhost/api/x?lat=999');
    const result = validateQuery(req, Schema);
    expect(result).toBeInstanceOf(NextResponse);
    const res = result as NextResponse;
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'VALIDATION_ERROR' });
  });
});
