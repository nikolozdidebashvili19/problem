import { NextRequest, NextResponse } from 'next/server';

import { deleteCommentService } from '@/features/comments/service/comment.service';
import { requireUser } from '@/shared/middleware/require-user';

type RouteContext = { params: Promise<{ id: string }> };

const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const guard = await requireUser();
    if (guard instanceof NextResponse) return guard;
    const { id } = await params;
    if (!OBJECT_ID_PATTERN.test(id)) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    const result = await deleteCommentService(guard.user, id);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
