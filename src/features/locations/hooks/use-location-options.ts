'use client';
import { useEffect, useState } from 'react';

import { LocationSummary } from '@/features/locations/types/location.types';
import { http } from '@/shared/lib/http';

type LocationsResponse = { items: LocationSummary[] };

// Children of a location, fetched once per parent and cached for the lifetime of the form
export const useLocationOptions = (parentSlug: string, preloaded: Record<string, LocationSummary[]> = {}) => {
  const [cache, setCache] = useState<Record<string, LocationSummary[]>>(preloaded);
  useEffect(() => {
    if (!parentSlug || cache[parentSlug]) return;
    let cancelled = false;
    http
      .get<LocationsResponse>('/locations', { params: { parent: parentSlug } })
      .then((response) => response.items)
      .catch(() => [])
      .then((items) => {
        if (!cancelled) setCache((current) => ({ ...current, [parentSlug]: items }));
      });
    return () => {
      cancelled = true;
    };
  }, [parentSlug, cache]);

  const cached = parentSlug ? cache[parentSlug] : [];
  return { options: cached ?? [], loading: Boolean(parentSlug) && cached === undefined };
};
