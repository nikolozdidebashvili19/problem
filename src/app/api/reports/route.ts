import { NextRequest, NextResponse } from 'next/server';

import { listFeedService } from '@/features/reports/service/feed.service';
import { createReportService } from '@/features/reports/service/report.service';
import { CreateReportSchema, FeedQuerySchema } from '@/features/reports/validations/report.validation';
import { getViewerId } from '@/shared/middleware/get-viewer';
import { requireUser } from '@/shared/middleware/require-user';
import { validateBody } from '@/shared/middleware/validate-body';
import { validateQuery } from '@/shared/middleware/validate-query';

export async function GET(req: NextRequest) {
  try {
    const validated = validateQuery(req, FeedQuerySchema);
    if (validated instanceof NextResponse) return validated;
    const result = await listFeedService(validated.data, await getViewerId());
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const guard = await requireUser();
    if (guard instanceof NextResponse) return guard;
    const validated = await validateBody(req, CreateReportSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await createReportService(guard.user, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
