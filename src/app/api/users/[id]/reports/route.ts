import { NextRequest, NextResponse } from 'next/server';

import { listProfileReportsService } from '@/features/profiles/service/profile.service';
import { ProfileReportsQuerySchema } from '@/features/profiles/validations/profile.validation';
import { getViewerId } from '@/shared/middleware/get-viewer';
import { validateQuery } from '@/shared/middleware/validate-query';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const validated = validateQuery(req, ProfileReportsQuerySchema);
    if (validated instanceof NextResponse) return validated;
    const { id } = await params;
    const result = await listProfileReportsService(id, validated.data, await getViewerId());
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
