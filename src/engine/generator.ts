import { SCENARIOS, type Scenario } from '@/data/scenarios';
import type { Adventure, GeoPoint, MoneyBudget, TimeBudget } from '@/types';
import { genId, random } from '@/utils/random';

export const DEFAULT_ORIGIN: GeoPoint = { lat: 55.7558, lng: 37.6173 };

export type GenerateAdventureInput = {
  time: TimeBudget;
  money: MoneyBudget;
  interests: string[];
  excludeScenarioId?: string;
  origin?: GeoPoint;
};

export function generateAdventure(input: GenerateAdventureInput): Adventure {
  const origin = input.origin ?? DEFAULT_ORIGIN;

  const compatible = SCENARIOS.filter((scenario) =>
    scenario.budgets.includes(input.money),
  );
  const candidates = compatible.filter(
    (scenario) => scenario.id !== input.excludeScenarioId,
  );
  const pool = candidates.length > 0 ? candidates : compatible;

  const weights = pool.map((scenario) => weightedScore(scenario, input.interests));
  const scenario = pickWeighted(pool, weights);

  const tasks = scenario
    .build({
      time: input.time,
      money: input.money,
      interests: input.interests,
      origin,
    })
    .sort((a, b) => a.order - b.order);

  return {
    id: genId('adv_'),
    title: scenario.title,
    emoji: scenario.emoji,
    timeBudget: input.time,
    moneyBudget: input.money,
    scenarioId: scenario.id,
    tasks,
    status: 'active',
    createdAt: new Date().toISOString(),
    totalDistanceMeters: tasks.reduce(
      (sum, item) => sum + (item.distanceMeters ?? 0),
      0,
    ),
  };
}

function weightedScore(scenario: Scenario, interests: string[]): number {
  const base = 1 + random();
  const matched = scenario.tags.some((tag) => interests.includes(tag));
  return base * (matched ? 2.5 : 1);
}

function pickWeighted<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = random() * total;
  for (let i = 0; i < weights.length; i += 1) {
    cursor -= weights[i];
    if (cursor <= 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
}