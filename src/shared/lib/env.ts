import { z } from 'zod';

const EnvSchema = z.object({
  MONGO_URI: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  // Optional until their tickets land (see todos/)
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(16).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

type EnvSource = Record<string, string | undefined>;

class EnvConfig {
  private cache: Env | null = null;

  constructor(private readonly source: EnvSource = process.env) {}

  load(): Env {
    if (this.cache) return this.cache;
    // `KEY=` lines (as copied from .env.example) mean "not set", not "set to an empty string"
    const defined = Object.fromEntries(Object.entries(this.source).filter(([, value]) => value !== ''));
    const result = EnvSchema.safeParse(defined);
    if (!result.success) {
      const keys = [...new Set(result.error.issues.map((issue) => issue.path.join('.')))];
      throw new Error(`Invalid environment variables: ${keys.join(', ')}`);
    }
    this.cache = result.data;
    return this.cache;
  }

  get<K extends keyof Env>(key: K): Env[K] {
    return this.load()[key];
  }
}

export const env = new EnvConfig();
export { EnvConfig };
