import { NextRequest, NextResponse } from 'next/server';

import { listProfileCommentsService } from '@/features/profiles/service/profile.service';
import { ProfileCommentsQuerySchema } from '@/features/profiles/validations/profile.validation';
import { validateQuery } from '@/shared/middleware/validate-query';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const validated = validateQuery(req, ProfileCommentsQuerySchema);
    if (validated instanceof NextResponse) return validated;
    const { id } = await params;
    const result = await listProfileCommentsService(id, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
