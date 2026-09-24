import type { Adventure, Stats } from '@/types';

export type AchievementContext = {
  stats: Stats;
  adventures: Adventure[];
};

export type Achievement = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  check: (ctx: AchievementContext) => boolean;
};

const cafesVisited = (adventures: Adventure[]) =>
  adventures.reduce(
    (sum, adventure) =>
      sum +
      adventure.tasks.filter(
        (task) => task.type === 'visit_cafe' && task.status === 'done',
      ).length,
    0,
  );

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    emoji: '🎯',
    title: 'Первое задание',
    description: 'Выполни первое задание',
    check: (ctx) => ctx.stats.totalTasksDone >= 1,
  },
  {
    id: 'first_adventure',
    emoji: '🧭',
    title: 'Первое приключение',
    description: 'Заверши первое приключение',
    check: (ctx) => ctx.stats.completedAdventures >= 1,
  },
  {
    id: 'explorer',
    emoji: '🗺️',
    title: 'Исследователь',
    description: 'Отметь 10 мест',
    check: (ctx) => ctx.stats.totalPlacesVisited >= 10,
  },
  {
    id: 'adventurer',
    emoji: '🎲',
    title: 'Авантюрист',
    description: 'Выполни 20 заданий',
    check: (ctx) => ctx.stats.totalTasksDone >= 20,
  },
  {
    id: 'walker',
    emoji: '🚶',
    title: 'Ходок',
    description: 'Пройди 20 км суммарно',
    check: (ctx) => ctx.stats.totalDistanceMeters >= 20000,
  },
  {
    id: 'foodie',
    emoji: '☕',
    title: 'Кофеман',
    description: 'Посети 3 кафе',
    check: (ctx) => cafesVisited(ctx.adventures) >= 3,
  },
  {
    id: 'clean_run',
    emoji: '✨',
    title: 'Чистовик',
    description: 'Заверши приключение без пропусков',
    check: (ctx) =>
      ctx.adventures.some(
        (adventure) =>
          adventure.status === 'completed' &&
          adventure.tasks.every((task) => task.status === 'done'),
      ),
  },
  {
    id: 'five_adventures',
    emoji: '🏆',
    title: '5 приключений',
    description: 'Заверши 5 приключений',
    check: (ctx) => ctx.stats.completedAdventures >= 5,
  },
];