import { z } from 'zod';

export const SeedSchema = z.object({
  targets: z.array(z.enum(['categories', 'locations', 'demo-reports'])).min(1),
});

export type SeedType = z.infer<typeof SeedSchema>;
