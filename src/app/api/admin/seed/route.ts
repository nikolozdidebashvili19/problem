import { NextRequest, NextResponse } from 'next/server';

import { seedService } from '@/features/admin/service/seed.service';
import { SeedSchema } from '@/features/admin/validations/admin.validation';
import { requireUser } from '@/shared/middleware/require-user';
import { validateBody } from '@/shared/middleware/validate-body';

export async function POST(req: NextRequest) {
  try {
    const guard = await requireUser('admin');
    if (guard instanceof NextResponse) return guard;
    const validated = await validateBody(req, SeedSchema);
    if (validated instanceof NextResponse) return validated;
    const result = await seedService(validated.data, guard.user._id.toString());
    return NextResponse.json(result.data, { status: result.status });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
