import { NextRequest, NextResponse } from 'next/server';

import { resolvePointService } from '@/features/locations/service/location.service';
import { ResolvePointQuerySchema } from '@/features/locations/validations/location.validation';
import { validateQuery } from '@/shared/middleware/validate-query';

export async function GET(req: NextRequest) {
  try {
    const validated = validateQuery(req, ResolvePointQuerySchema);
    if (validated instanceof NextResponse) return validated;
    const result = await resolvePointService(validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
