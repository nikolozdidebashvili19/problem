import { NextRequest, NextResponse } from 'next/server';

import { deleteReportService, updateReportService } from '@/features/reports/service/report.service';
import { UpdateReportSchema } from '@/features/reports/validations/report.validation';
import { requireUser } from '@/shared/middleware/require-user';
import { validateBody } from '@/shared/middleware/validate-body';

type RouteContext = { params: Promise<{ shortId: string }> };

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const guard = await requireUser();
    if (guard instanceof NextResponse) return guard;
    const validated = await validateBody(req, UpdateReportSchema);
    if (validated instanceof NextResponse) return validated;
    const { shortId } = await params;
    const result = await updateReportService(guard.user, shortId, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const guard = await requireUser();
    if (guard instanceof NextResponse) return guard;
    const { shortId } = await params;
    const result = await deleteReportService(guard.user, shortId);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
