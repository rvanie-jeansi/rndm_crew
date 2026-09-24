import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadJSON, saveJSON, StorageKeys } from '@/store/storage';
import { defaultStats, type Adventure, type Profile, type Stats, type VisitedPlace } from '@/types';

type AppState = {
  profile: Profile | null;
  adventures: Adventure[];
  visitedPlaces: VisitedPlace[];
  stats: Stats;
  isHydrated: boolean;
};

type AppContextValue = AppState & {
  completeOnboarding: (input: { name: string; emoji: string; interests: string[] }) => Promise<void>;
  addAdventure: (adventure: Adventure) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    profile: null,
    adventures: [],
    visitedPlaces: [],
    stats: defaultStats,
    isHydrated: false,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [profile, adventures, visitedPlaces, stats] = await Promise.all([
        loadJSON<Profile>(StorageKeys.profile),
        loadJSON<Adventure[]>(StorageKeys.adventures),
        loadJSON<VisitedPlace[]>(StorageKeys.visitedPlaces),
        loadJSON<Stats>(StorageKeys.stats),
      ]);

      if (cancelled) return;

      setState({
        profile,
        adventures: adventures ?? [],
        visitedPlaces: visitedPlaces ?? [],
        stats: stats ?? defaultStats,
        isHydrated: true,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AppContextValue>(() => {
    return {
      ...state,
      completeOnboarding: async ({ name, emoji, interests }) => {
        const profile: Profile = {
          name: name.trim(),
          emoji,
          interests,
          createdAt: new Date().toISOString(),
        };

        await Promise.all([
          saveJSON(StorageKeys.profile, profile),
          saveJSON(StorageKeys.stats, defaultStats),
        ]);

        setState((prev) => ({ ...prev, profile, stats: defaultStats }));
      },
      addAdventure: async (adventure) => {
        await saveJSON(StorageKeys.adventures, [adventure, ...state.adventures]);
        setState((prev) => ({
          ...prev,
          adventures: [adventure, ...prev.adventures],
        }));
      },
    };
  }, [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp должен вызываться внутри AppProvider');
  }
  return ctx;
}