import { NextRequest, NextResponse } from 'next/server';

import { createCommentService, listCommentsService } from '@/features/comments/service/comment.service';
import { CommentsQuerySchema, CreateCommentSchema } from '@/features/reports/validations/report.validation';
import { getViewer } from '@/shared/middleware/get-viewer';
import { requireUser } from '@/shared/middleware/require-user';
import { validateBody } from '@/shared/middleware/validate-body';
import { validateQuery } from '@/shared/middleware/validate-query';

type RouteContext = { params: Promise<{ shortId: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const validated = validateQuery(req, CommentsQuerySchema);
    if (validated instanceof NextResponse) return validated;
    const { shortId } = await params;
    const viewer = await getViewer();
    const result = await listCommentsService(
      shortId,
      validated.data,
      viewer ? { id: viewer._id.toString(), role: viewer.role } : null
    );
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const guard = await requireUser();
    if (guard instanceof NextResponse) return guard;
    const validated = await validateBody(req, CreateCommentSchema);
    if (validated instanceof NextResponse) return validated;
    const { shortId } = await params;
    const result = await createCommentService(guard.user, shortId, validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
