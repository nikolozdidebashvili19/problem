import { NextRequest, NextResponse } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/middleware/require-user', () => ({
  requireUser: vi.fn(),
}));

vi.mock('@/features/admin/service/seed.service', () => ({
  seedService: vi.fn(),
}));

import { seedService } from '@/features/admin/service/seed.service';
import { requireUser } from '@/shared/middleware/require-user';

import { POST } from './route';

const mockRequireUser = vi.mocked(requireUser);
const mockSeed = vi.mocked(seedService);
const ADMIN_ID = '507f1f77bcf86cd799439011';

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/admin/seed', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/admin/seed', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires the admin role', async () => {
    mockRequireUser.mockResolvedValueOnce(NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 }));
    const res = await POST(makeRequest({ targets: ['categories'] }));
    expect(mockRequireUser).toHaveBeenCalledWith('admin');
    expect(res.status).toBe(403);
    expect(mockSeed).not.toHaveBeenCalled();
  });

  it('returns 400 on invalid targets', async () => {
    mockRequireUser.mockResolvedValueOnce({ user: { _id: { toString: () => ADMIN_ID } } as never });
    const res = await POST(makeRequest({ targets: ['users'] }));
    expect(res.status).toBe(400);
  });

  it('runs the seed for admins', async () => {
    mockRequireUser.mockResolvedValueOnce({ user: { _id: { toString: () => ADMIN_ID } } as never });
    mockSeed.mockResolvedValueOnce({ data: { categories: 14 }, status: 200 });
    const res = await POST(makeRequest({ targets: ['categories'] }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ categories: 14 });
    expect(mockSeed).toHaveBeenCalledWith({ targets: ['categories'] }, ADMIN_ID);
  });

  it('returns 500 when seeding throws', async () => {
    mockRequireUser.mockResolvedValueOnce({ user: { _id: { toString: () => ADMIN_ID } } as never });
    mockSeed.mockRejectedValueOnce(new Error('db down'));
    const res = await POST(makeRequest({ targets: ['categories'] }));
    expect(res.status).toBe(500);
  });
});
