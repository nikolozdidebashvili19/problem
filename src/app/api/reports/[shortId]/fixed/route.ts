import { NextRequest, NextResponse } from 'next/server';

import { markReportFixedService } from '@/features/reports/service/report.service';
import { MarkFixedSchema } from '@/features/reports/validations/report.validation';
import { requireUser } from '@/shared/middleware/require-user';
import { validateBody } from '@/shared/middleware/validate-body';

type RouteContext = { params: Promise<{ shortId: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const guard = await requireUser();
    if (guard instanceof NextResponse) return guard;
    const validated = await validateBody(req, MarkFixedSchema);
    if (validated instanceof NextResponse) return validated;
    const { shortId } = await params;
    const result = await markReportFixedService(guard.user, shortId, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
