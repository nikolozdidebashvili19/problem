import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/shared/lib/mongo', () => ({
  mongo: { ping: vi.fn() },
}));

import { mongo } from '@/shared/lib/mongo';

import { GET } from './route';

const mockPing = vi.mocked(mongo.ping);

describe('GET /api/health', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 when the database answers', async () => {
    mockPing.mockResolvedValueOnce(true);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok', db: 'up' });
  });

  it('returns 503 when the database is unreachable', async () => {
    mockPing.mockResolvedValueOnce(false);
    const res = await GET();
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ status: 'degraded', db: 'down' });
  });
});
