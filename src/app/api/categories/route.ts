import { NextResponse } from 'next/server';

import { listCategoriesService } from '@/features/categories/service/category.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await listCategoriesService();
    return NextResponse.json(result.data, {
      status: result.status,
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
