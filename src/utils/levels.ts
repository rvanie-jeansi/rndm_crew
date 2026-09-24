export type LevelInfo = {
  level: number;
  currentXp: number;
  neededXp: number;
};

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, xp);

  while (remaining >= 100 * level) {
    remaining -= 100 * level;
    level += 1;
  }

  return { level, currentXp: remaining, neededXp: 100 * level };
}