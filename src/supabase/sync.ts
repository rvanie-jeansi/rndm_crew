import type { Adventure, Profile, Stats, VisitedPlace } from '@/types';
import { isBackendConfigured, supabase } from '@/supabase/client';

export type SyncPayload = {
  profile: Profile;
  stats: Stats;
  visitedPlaces: VisitedPlace[];
  adventures: Adventure[];
};

async function ensureAnonSession(): Promise<string | null> {
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user.id;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) return null;
  return data.user?.id ?? null;
}

export async function pushState(payload: SyncPayload): Promise<boolean> {
  if (!supabase || !isBackendConfigured) return false;

  try {
    const userId = await ensureAnonSession();
    if (!userId) return false;

    const { profile, stats, visitedPlaces, adventures } = payload;

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      name: profile.name,
      emoji: profile.emoji,
      interests: profile.interests,
      created_at: profile.createdAt,
    });
    if (profileError) throw profileError;

    const { error: statsError } = await supabase.from('stats').upsert({
      user_id: userId,
      total_adventures: stats.totalAdventures,
      completed_adventures: stats.completedAdventures,
      total_distance_meters: stats.totalDistanceMeters,
      total_places_visited: stats.totalPlacesVisited,
      total_tasks_done: stats.totalTasksDone,
      xp: stats.xp,
      achievements: stats.achievements,
      updated_at: new Date().toISOString(),
    });
    if (statsError) throw statsError;

    for (const adventure of adventures) {
      const { error } = await supabase.from('adventures').upsert({
        id: adventure.id,
        user_id: userId,
        title: adventure.title,
        emoji: adventure.emoji,
        time_budget: adventure.timeBudget,
        money_budget: adventure.moneyBudget,
        scenario_id: adventure.scenarioId ?? null,
        status: adventure.status,
        created_at: adventure.createdAt,
        completed_at: adventure.completedAt ?? null,
        total_distance_meters: adventure.totalDistanceMeters,
        walked_distance_meters: adventure.walkedDistanceMeters ?? 0,
        tasks: JSON.stringify(adventure.tasks),
      });
      if (error) throw error;
    }

    for (const place of visitedPlaces) {
      const { error } = await supabase.from('visited_places').upsert({
        id: place.id,
        user_id: userId,
        lat: place.lat,
        lng: place.lng,
        name: place.name ?? null,
        visited_at: place.visitedAt,
        adventure_id: place.adventureId ?? null,
      });
      if (error) throw error;
    }

    return true;
  } catch {
    return false;
  }
}