import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { unlockAchievements } from '@/engine/achievements';
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
  completeTask: (adventureId: string, taskId: string) => Promise<void>;
  skipTask: (adventureId: string, taskId: string) => Promise<void>;
  skipAdventure: (adventureId: string) => Promise<void>;
  finishAdventure: (adventureId: string) => Promise<void>;
  addWalkedDistance: (adventureId: string, meters: number) => Promise<void>;
  addVisitedPlace: (place: VisitedPlace) => Promise<void>;
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
        stats: { ...defaultStats, ...(stats ?? {}) },
        isHydrated: true,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.isHydrated) return;
    const timeout = setTimeout(() => {
      void saveJSON(StorageKeys.adventures, state.adventures);
    }, 500);
    return () => clearTimeout(timeout);
  }, [state.adventures, state.isHydrated]);

  useEffect(() => {
    if (!state.isHydrated) return;
    const timeout = setTimeout(() => {
      void saveJSON(StorageKeys.stats, state.stats);
    }, 500);
    return () => clearTimeout(timeout);
  }, [state.stats, state.isHydrated]);

  const updateStats = (patch: (prev: Stats) => Stats) => {
    setState((prev) => {
      const stats = unlockAchievements(patch(prev.stats), prev.adventures);
      return { ...prev, stats };
    });
  };

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
        updateStats((prev) => ({
          ...prev,
          totalAdventures: prev.totalAdventures + 1,
        }));
      },
      completeTask: async (adventureId, taskId) => {
        const now = new Date().toISOString();
        const next = state.adventures.map((adventure) =>
          adventure.id !== adventureId
            ? adventure
            : {
                ...adventure,
                tasks: adventure.tasks.map((item) =>
                  item.id !== taskId
                    ? item
                    : { ...item, status: 'done' as const, doneAt: now },
                ),
              },
        );
        const task = next.find((adventure) => adventure.id === adventureId)?.tasks.find(
          (item) => item.id === taskId,
        );
        await saveJSON(StorageKeys.adventures, next);
        setState((prev) => ({ ...prev, adventures: next }));
        if (task) {
          updateStats((prev) => ({
            ...prev,
            totalTasksDone: prev.totalTasksDone + 1,
            xp: prev.xp + task.xp,
          }));
        }
      },
      skipTask: async (adventureId, taskId) => {
        const next = state.adventures.map((adventure) =>
          adventure.id !== adventureId
            ? adventure
            : {
                ...adventure,
                tasks: adventure.tasks.map((item) =>
                  item.id !== taskId ? item : { ...item, status: 'skipped' as const },
                ),
              },
        );
        await saveJSON(StorageKeys.adventures, next);
        setState((prev) => ({ ...prev, adventures: next }));
      },
      skipAdventure: async (adventureId) => {
        const next = state.adventures.map((adventure) =>
          adventure.id !== adventureId
            ? adventure
            : { ...adventure, status: 'skipped' as const },
        );
        await saveJSON(StorageKeys.adventures, next);
        setState((prev) => ({ ...prev, adventures: next }));
      },
      finishAdventure: async (adventureId) => {
        const now = new Date().toISOString();
        const next = state.adventures.map((adventure) =>
          adventure.id !== adventureId
            ? adventure
            : { ...adventure, status: 'completed' as const, completedAt: now },
        );
        const walked = next.find((adventure) => adventure.id === adventureId)
          ?.walkedDistanceMeters;
        await saveJSON(StorageKeys.adventures, next);
        setState((prev) => ({ ...prev, adventures: next }));
        updateStats((prev) => ({
          ...prev,
          completedAdventures: prev.completedAdventures + 1,
          totalDistanceMeters: prev.totalDistanceMeters + (walked ?? 0),
        }));
      },
      addWalkedDistance: async (adventureId, meters) => {
        setState((prev) => ({
          ...prev,
          adventures: prev.adventures.map((adventure) =>
            adventure.id !== adventureId
              ? adventure
              : {
                  ...adventure,
                  walkedDistanceMeters:
                    (adventure.walkedDistanceMeters ?? 0) + meters,
                },
          ),
        }));
      },
      addVisitedPlace: async (place) => {
        const next = [place, ...state.visitedPlaces];
        await saveJSON(StorageKeys.visitedPlaces, next);
        setState((prev) => ({ ...prev, visitedPlaces: next }));
        updateStats((prev) => ({
          ...prev,
          totalPlacesVisited: prev.totalPlacesVisited + 1,
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