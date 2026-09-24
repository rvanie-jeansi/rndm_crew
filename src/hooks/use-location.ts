import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { GeoPoint } from '@/types';

export type LocationPermission = 'idle' | 'granted' | 'denied';
export type LocationState = 'idle' | 'locating' | 'ready' | 'denied';

export type UseLocationResult = {
  state: LocationState;
  error: string | null;
  current: GeoPoint | null;
  start: () => Promise<void>;
  stop: () => void;
};

export function useLocation(): UseLocationResult {
  const [permission, setPermission] = useState<LocationPermission>('idle');
  const [current, setCurrent] = useState<GeoPoint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const stop = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setError(null);

    let status = permission;
    if (status === 'idle') {
      const response = await Location.requestForegroundPermissionsAsync();
      status = response.granted ? 'granted' : 'denied';
      setPermission(status);
    }

    if (status !== 'granted') {
      setError('Доступ к геопозиции не разрешён');
      return;
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5,
        timeInterval: 2000,
      },
      (location) => {
        setCurrent({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      },
      (reason) => setError(reason),
    );

    subscriptionRef.current?.remove();
    subscriptionRef.current = subscription;
  }, [permission]);

  useEffect(() => stop, [stop]);

  const state: LocationState =
    permission === 'denied' ? 'denied' : current ? 'ready' : 'locating';

  return { state, error, current, start, stop };
}