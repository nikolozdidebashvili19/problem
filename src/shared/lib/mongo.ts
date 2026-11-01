import mongoose from 'mongoose';

import { env } from '@/shared/lib/env';

const MAX_RETRIES = 1;
const RETRY_DELAY_MS = 500;
const MAX_POOL_SIZE = 10;
// Driver default is 30s — a request would hang that long when the cluster is unreachable
const SERVER_SELECTION_TIMEOUT_MS = 5000;
// After a failed connect, fail fast instead of making every request wait through the retries again
const FAILURE_COOLDOWN_MS = 10000;

type MongoCache = {
  promise: Promise<typeof mongoose> | null;
  lastFailure: { at: number; error: Error } | null;
};

// Shared across hot reloads and concurrent serverless requests so we never open more than one pool.
const globalForMongo = globalThis as typeof globalThis & { __mongoCache?: MongoCache };
const globalCache: MongoCache = (globalForMongo.__mongoCache ??= { promise: null, lastFailure: null });

class MongoClientManager {
  constructor(private readonly cache: MongoCache = globalCache) {}

  async connect(retries = MAX_RETRIES): Promise<void> {
    if (!this.cache.promise) {
      const failure = this.cache.lastFailure;
      if (failure && Date.now() - failure.at < FAILURE_COOLDOWN_MS) throw failure.error;

      this.cache.promise = this.connectWithRetry(retries).then(
        (connection) => {
          this.cache.lastFailure = null;
          return connection;
        },
        (error) => {
          this.cache.promise = null;
          this.cache.lastFailure = { at: Date.now(), error: error instanceof Error ? error : new Error(String(error)) };
          throw error;
        }
      );
    }
    await this.cache.promise;
  }

  async ping(): Promise<boolean> {
    try {
      await this.connect(0);
      const db = mongoose.connection.db;
      if (!db) return false;
      await db.admin().ping();
      return true;
    } catch {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.cache.promise) {
      await mongoose.disconnect();
      this.cache.promise = null;
    }
  }

  private async connectWithRetry(retries: number): Promise<typeof mongoose> {
    try {
      const connection = await mongoose.connect(env.get('MONGO_URI'), {
        maxPoolSize: MAX_POOL_SIZE,
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
      });
      console.log('Connected to MongoDB');
      return connection;
    } catch (error) {
      if (retries <= 0) throw error;
      console.warn(`MongoDB connection failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return this.connectWithRetry(retries - 1);
    }
  }
}

export const mongo = new MongoClientManager();
export { MongoClientManager };
