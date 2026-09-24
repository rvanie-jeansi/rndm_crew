import { ACHIEVEMENTS } from '@/data/achievements';
import type { Adventure, Stats } from '@/types';

export function unlockAchievements(stats: Stats, adventures: Adventure[]): Stats {
  const context = { stats, adventures };
  const newly = ACHIEVEMENTS.filter(
    (achievement) =>
      !stats.achievements.includes(achievement.id) &&
      achievement.check(context),
  );

  if (newly.length === 0) return stats;
  return {
    ...stats,
    achievements: [
      ...stats.achievements,
      ...newly.map((achievement) => achievement.id),
    ],
  };
}