import { NextResponse } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/features/auth/repository/user.repository', () => ({
  userRepository: { findById: vi.fn() },
}));

import { userRepository } from '@/features/auth/repository/user.repository';
import { auth } from '@/shared/lib/auth';

import { requireUser } from './require-user';

const mockAuth = vi.mocked(auth as () => Promise<{ user: { id?: string } } | null>);
const mockFindById = vi.mocked(userRepository.findById);

const USER_ID = '507f1f77bcf86cd799439011';

function fakeUser(overrides: Record<string, unknown> = {}) {
  return { _id: USER_ID, role: 'citizen', status: 'active', ...overrides } as never;
}

async function expectError(result: Awaited<ReturnType<typeof requireUser>>, status: number, error: string) {
  expect(result).toBeInstanceOf(NextResponse);
  const res = result as NextResponse;
  expect(res.status).toBe(status);
  expect(await res.json()).toEqual({ error });
}

describe('requireUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 when there is no session', async () => {
    mockAuth.mockResolvedValueOnce(null);
    await expectError(await requireUser(), 401, 'UNAUTHENTICATED');
    expect(mockFindById).not.toHaveBeenCalled();
  });

  it('returns 401 when the session id is not an ObjectId', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: 'google-sub-123' } });
    await expectError(await requireUser(), 401, 'UNAUTHENTICATED');
  });

  it('returns 401 when the user no longer exists or was deleted', async () => {
    mockAuth.mockResolvedValue({ user: { id: USER_ID } });
    mockFindById.mockResolvedValueOnce(null);
    await expectError(await requireUser(), 401, 'UNAUTHENTICATED');
    mockFindById.mockResolvedValueOnce(fakeUser({ deletedAt: new Date() }));
    await expectError(await requireUser(), 401, 'UNAUTHENTICATED');
  });

  it('returns 403 for banned users', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockFindById.mockResolvedValueOnce(fakeUser({ status: 'banned' }));
    await expectError(await requireUser(), 403, 'BANNED');
  });

  it('returns 403 when the role is too low', async () => {
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockFindById.mockResolvedValueOnce(fakeUser({ role: 'citizen' }));
    await expectError(await requireUser('moderator'), 403, 'FORBIDDEN');
  });

  it('returns the DB user when allowed', async () => {
    const user = fakeUser({ role: 'admin' });
    mockAuth.mockResolvedValueOnce({ user: { id: USER_ID } });
    mockFindById.mockResolvedValueOnce(user);
    expect(await requireUser('moderator')).toEqual({ user });
  });
});
