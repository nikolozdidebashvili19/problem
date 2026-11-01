import { NextResponse } from 'next/server';

import { cloudinary } from '@/shared/lib/cloudinary';
import { requireUser } from '@/shared/middleware/require-user';

export const dynamic = 'force-dynamic';

// Short-lived signature for a direct browser → Cloudinary upload (PRODUCT §10)
export async function GET() {
  try {
    const guard = await requireUser();
    if (guard instanceof NextResponse) return guard;
    const signature = cloudinary.signUpload();
    if (!signature) return NextResponse.json({ error: 'UPLOADS_DISABLED' }, { status: 503 });
    return NextResponse.json(signature, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
