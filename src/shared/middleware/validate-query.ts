import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export function validateQuery<T>(
  req: NextRequest,
  schema: ZodSchema<T>
): { data: T } | NextResponse {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const result = schema.safeParse(params);
  if (!result.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR', details: result.error.flatten() },
      { status: 400 }
    );
  }
  return { data: result.data };
}
