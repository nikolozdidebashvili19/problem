import { NextRequest, NextResponse } from 'next/server';

import { listNotificationsService } from '@/features/notifications/service/notification.service';
import { NotificationsQuerySchema } from '@/features/notifications/validations/notification.validation';
import { requireUser } from '@/shared/middleware/require-user';
import { validateQuery } from '@/shared/middleware/validate-query';

export async function GET(req: NextRequest) {
  try {
    const guard = await requireUser();
    if (guard instanceof NextResponse) return guard;
    const validated = validateQuery(req, NotificationsQuerySchema);
    if (validated instanceof NextResponse) return validated;
    const result = await listNotificationsService(guard.user._id.toString(), validated.data);
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
