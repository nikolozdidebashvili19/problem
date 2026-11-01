import { NextRequest, NextResponse } from 'next/server';

import { listLocationsService } from '@/features/locations/service/location.service';
import { ListLocationsQuerySchema } from '@/features/locations/validations/location.validation';
import { validateQuery } from '@/shared/middleware/validate-query';

export async function GET(req: NextRequest) {
  try {
    const validated = validateQuery(req, ListLocationsQuerySchema);
    if (validated instanceof NextResponse) return validated;
    const result = await listLocationsService(validated.data);
    return NextResponse.json(result.data, {
      status: result.status,
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
