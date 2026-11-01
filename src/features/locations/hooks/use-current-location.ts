'use client';
import { useState } from 'react';

import { ResolvedLocation } from '@/features/locations/types/location.types';
import { http } from '@/shared/lib/http';

const GEOLOCATION_TIMEOUT_MS = 10000;

type Located = { resolved: ResolvedLocation; point: [number, number] };

// Browser geolocation → our point resolver; denial falls back to picking from the list (PRODUCT §4.2)
export const useCurrentLocation = (onLocated: (located: Located) => void) => {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = () => {
    if (!('geolocation' in navigator)) {
      setError('LOCATION_FAILED');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const resolved = await http.get<ResolvedLocation>('/locations/resolve', {
            params: { lat: coords.latitude, lng: coords.longitude },
          });
          onLocated({ resolved, point: [coords.longitude, coords.latitude] });
        } catch (resolveError) {
          setError(resolveError instanceof Error ? resolveError.message : 'LOCATION_FAILED');
        } finally {
          setLocating(false);
        }
      },
      (positionError) => {
        setError(positionError.code === positionError.PERMISSION_DENIED ? 'LOCATION_DENIED' : 'LOCATION_FAILED');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS }
    );
  };

  return { locate, locating, error };
};
