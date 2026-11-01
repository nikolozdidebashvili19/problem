export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { env } = await import('@/shared/lib/env');
  try {
    env.load();
  } catch (error) {
    // Fail fast in production; in development keep the server up so non-DB pages still render.
    if (process.env.NODE_ENV === 'production') throw error;
    console.error(error instanceof Error ? error.message : error);
  }
}
