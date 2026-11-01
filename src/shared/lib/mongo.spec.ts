import mongoose from 'mongoose';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const MONGO_URI = 'mongodb://localhost:27017/problem-ge-test';

vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal<typeof mongoose>();
  return {
    default: {
      ...actual,
      connect: vi.fn(),
      disconnect: vi.fn(),
      connection: { db: undefined },
    },
  };
});

vi.mock('@/shared/lib/env', () => ({
  env: { get: vi.fn(() => MONGO_URI) },
}));

import { MongoClientManager } from './mongo';

describe('MongoClientManager', () => {
  let manager: MongoClientManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new MongoClientManager({ promise: null, lastFailure: null });
  });

  it('connects to MongoDB on first call with a bounded pool', async () => {
    vi.mocked(mongoose.connect).mockResolvedValueOnce(mongoose);
    await manager.connect();
    expect(mongoose.connect).toHaveBeenCalledOnce();
    expect(mongoose.connect).toHaveBeenCalledWith(MONGO_URI, { maxPoolSize: 10, serverSelectionTimeoutMS: 5000 });
  });

  it('does not reconnect when already connected', async () => {
    vi.mocked(mongoose.connect).mockResolvedValueOnce(mongoose);
    await manager.connect();
    await manager.connect();
    expect(mongoose.connect).toHaveBeenCalledOnce();
  });

  it('shares one in-flight connection between concurrent callers', async () => {
    vi.mocked(mongoose.connect).mockResolvedValueOnce(mongoose);
    await Promise.all([manager.connect(), manager.connect(), manager.connect()]);
    expect(mongoose.connect).toHaveBeenCalledOnce();
  });

  it('shares the connection between managers using the same cache', async () => {
    const cache = { promise: null, lastFailure: null };
    vi.mocked(mongoose.connect).mockResolvedValueOnce(mongoose);
    await new MongoClientManager(cache).connect();
    await new MongoClientManager(cache).connect();
    expect(mongoose.connect).toHaveBeenCalledOnce();
  });

  it('retries on failure then succeeds', async () => {
    vi.mocked(mongoose.connect)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce(mongoose);
    await manager.connect();
    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });

  it('fails fast during the cooldown after a failed connect, then retries', async () => {
    vi.useFakeTimers();
    try {
      vi.mocked(mongoose.connect).mockRejectedValueOnce(new Error('always fail'));
      await expect(manager.connect(0)).rejects.toThrow('always fail');

      // Within the cooldown: no new connection attempt, same error immediately
      await expect(manager.connect(0)).rejects.toThrow('always fail');
      expect(mongoose.connect).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(10001);
      vi.mocked(mongoose.connect).mockResolvedValueOnce(mongoose);
      await manager.connect(0);
      expect(mongoose.connect).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('disconnect calls mongoose.disconnect and resets state', async () => {
    vi.mocked(mongoose.connect).mockResolvedValueOnce(mongoose);
    vi.mocked(mongoose.disconnect).mockResolvedValueOnce();
    await manager.connect();
    await manager.disconnect();
    expect(mongoose.disconnect).toHaveBeenCalledOnce();
    vi.mocked(mongoose.connect).mockResolvedValueOnce(mongoose);
    await manager.connect();
    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });

  it('disconnect is a no-op when not connected', async () => {
    vi.mocked(mongoose.disconnect).mockResolvedValueOnce();
    await manager.disconnect();
    expect(mongoose.disconnect).not.toHaveBeenCalled();
  });

  it('ping returns false when the connection fails', async () => {
    vi.mocked(mongoose.connect).mockRejectedValueOnce(new Error('down'));
    expect(await manager.ping()).toBe(false);
  });

  it('ping returns false when connected but no db handle exists', async () => {
    vi.mocked(mongoose.connect).mockResolvedValueOnce(mongoose);
    expect(await manager.ping()).toBe(false);
  });
});
