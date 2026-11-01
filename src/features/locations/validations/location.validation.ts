import { z } from 'zod';

// GeoJSON order: [lng, lat]
export const LngLatSchema = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

export const GeoPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: LngLatSchema,
});

export type GeoPointType = z.infer<typeof GeoPointSchema>;

export const ResolvePointQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export type ResolvePointQueryType = z.infer<typeof ResolvePointQuerySchema>;

export const ListLocationsQuerySchema = z.object({
  parent: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/).optional(),
});

export type ListLocationsQueryType = z.infer<typeof ListLocationsQuerySchema>;
