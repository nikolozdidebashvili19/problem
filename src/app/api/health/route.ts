import { NextResponse } from 'next/server';

import { mongo } from '@/shared/lib/mongo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const dbUp = await mongo.ping();
  return NextResponse.json(
    { status: dbUp ? 'ok' : 'degraded', db: dbUp ? 'up' : 'down', timestamp: new Date().toISOString() },
    { status: dbUp ? 200 : 503 }
  );
}
