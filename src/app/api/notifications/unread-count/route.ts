import { NextResponse } from 'next/server';

import { unreadCountService } from '@/features/notifications/service/notification.service';
import { requireUser } from '@/shared/middleware/require-user';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const guard = await requireUser();
    if (guard instanceof NextResponse) return guard;
    const result = await unreadCountService(guard.user._id.toString());
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
