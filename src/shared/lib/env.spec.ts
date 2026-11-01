import { describe, it, expect } from 'vitest';

import { EnvConfig } from './env';

const validSource = {
  MONGO_URI: 'mongodb://localhost:27017/problem-ge',
  NEXTAUTH_SECRET: 'secret',
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret',
};

describe('EnvConfig', () => {
  it('returns typed values when all required vars are present', () => {
    const config = new EnvConfig(validSource);
    expect(config.get('MONGO_URI')).toBe('mongodb://localhost:27017/problem-ge');
    expect(config.get('CLOUDINARY_API_KEY')).toBeUndefined();
  });

  it('lists every missing required var in the error', () => {
    const config = new EnvConfig({ NEXTAUTH_SECRET: 'secret' });
    expect(() => config.load()).toThrow(/MONGO_URI.*GOOGLE_CLIENT_ID.*GOOGLE_CLIENT_SECRET/);
  });

  it('treats empty values as unset', () => {
    const config = new EnvConfig({ ...validSource, CLOUDINARY_API_KEY: '', UPSTASH_REDIS_REST_URL: '' });
    expect(config.get('CLOUDINARY_API_KEY')).toBeUndefined();
    expect(() => new EnvConfig({ ...validSource, MONGO_URI: '' }).load()).toThrow(/MONGO_URI/);
  });

  it('rejects malformed optional vars', () => {
    const config = new EnvConfig({ ...validSource, CRON_SECRET: 'short' });
    expect(() => config.load()).toThrow(/CRON_SECRET/);
  });

  it('caches the parsed result', () => {
    const source: Record<string, string | undefined> = { ...validSource };
    const config = new EnvConfig(source);
    config.load();
    source.MONGO_URI = 'mongodb://changed';
    expect(config.get('MONGO_URI')).toBe('mongodb://localhost:27017/problem-ge');
  });
});
