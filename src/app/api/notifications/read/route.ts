import { NextRequest, NextResponse } from 'next/server';

import { markNotificationsReadService } from '@/features/notifications/service/notification.service';
import { MarkNotificationsReadSchema } from '@/features/notifications/validations/notification.validation';
import { requireUser } from '@/shared/middleware/require-user';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const guard = await requireUser();
    if (guard instanceof NextResponse) return guard;
    const validated = await validateBody(req, MarkNotificationsReadSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await markNotificationsReadService(guard.user._id.toString(), validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
