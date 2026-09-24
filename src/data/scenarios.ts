import { CAFE_NAMES } from '@/data/cafeNames';
import type {
  GeoPoint,
  MoneyBudget,
  Task,
  TaskType,
  TimeBudget,
} from '@/types';
import { formatDistance } from '@/utils/format';
import { haversineMeters, randomPointAround } from '@/utils/geo';
import { genId, randomElement, randomInt, shuffle } from '@/utils/random';

export type ScenarioContext = {
  time: TimeBudget;
  money: MoneyBudget;
  interests: string[];
  origin: GeoPoint;
};

export type Scenario = {
  id: string;
  title: string;
  emoji: string;
  tags: string[];
  budgets: MoneyBudget[];
  build: (ctx: ScenarioContext) => Task[];
};

const TIME_DISTANCE: Record<TimeBudget, { min: number; max: number }> = {
  '30m': { min: 1000, max: 2000 },
  '1h': { min: 2000, max: 4000 },
  '2h': { min: 4000, max: 7000 },
  all_day: { min: 8000, max: 12000 },
};

const ITEM_COUNT: Record<TimeBudget, number> = {
  '30m': 2,
  '1h': 3,
  '2h': 3,
  all_day: 4,
};

const BASE_XP: Record<TaskType, number> = {
  walk: 10,
  find_place: 10,
  photo: 20,
  visit_cafe: 25,
  roll_dice: 10,
  question: 10,
};

const totalPlan = (time: TimeBudget) =>
  randomInt(TIME_DISTANCE[time].min, TIME_DISTANCE[time].max);

const xpFor = (type: TaskType, distanceMeters?: number): number =>
  BASE_XP[type] + (distanceMeters ? Math.round(distanceMeters / 100) * 5 : 0);

type TaskSpec = {
  type: TaskType;
  title: string;
  order: number;
  description?: string;
  point?: GeoPoint;
  distance?: number;
  placeType?: string;
};

function task(ctx: ScenarioContext, spec: TaskSpec): Task {
  const distanceMeters =
    spec.distance ??
    (spec.point ? Math.round(haversineMeters(ctx.origin, spec.point)) : undefined);

  return {
    id: genId('task_'),
    type: spec.type,
    title: spec.title,
    description: spec.description,
    distanceMeters,
    location: spec.point,
    placeType: spec.placeType,
    status: 'pending',
    order: spec.order,
    xp: xpFor(spec.type, distanceMeters),
  };
}

const PHOTO_OBJECTS = [
  'необычное здание',
  'красивые деревья',
  'живое существо',
  'место с красивым видом',
  'вывеску с животным',
  'что-то смешное',
];

const LANDMARKS = [
  'дом необычного цвета',
  'вывеску с животным',
  'место с красивым видом',
  'старое здание',
  'необычный транспорт',
  'то, что напомнило о человеке',
];

export const SCENARIOS: Scenario[] = [
  {
    id: 'explorer',
    title: 'Исследователь',
    emoji: '🗺️',
    tags: ['walk', 'architecture', 'cafe', 'dice'],
    budgets: ['low', 'mid', 'high'],
    build(ctx) {
      const tasks: Task[] = [];
      const total = totalPlan(ctx.time);
      const walkPart = Math.round(total * (ctx.money === 'high' ? 0.3 : 0.4));
      const diceRolls = ctx.money === 'high' ? 2 : 1;

      tasks.push(
        task(ctx, {
          type: 'walk',
          order: 1,
          title: `Прогуляйся ${formatDistance(walkPart)}, осматривайся вокруг`,
          distance: walkPart,
        }),
      );

      const building = randomPointAround(ctx.origin, 400, 900);
      tasks.push(
        task(ctx, {
          type: 'photo',
          order: 2,
          title: 'Найди необычное здание и сфотографируй его',
          description: 'Необычное — значит необычное для тебя: цвет, форма, окна.',
          point: building,
        }),
      );

      if (ctx.money !== 'low') {
        const cafe = randomPointAround(ctx.origin, 600, 1200);
        tasks.push(
          task(ctx, {
            type: 'visit_cafe',
            order: 3,
            title: `Загляни в «${randomElement(CAFE_NAMES)}»`,
            description: 'Место выбрано случайно. Возьми, что захочешь.',
            point: cafe,
            placeType: 'cafe',
          }),
        );
      }

      let order = tasks.length + 1;
      for (let i = 1; i <= diceRolls; i += 1) {
        tasks.push(
          task(ctx, {
            type: 'roll_dice',
            order: order++,
            title: i === 1 ? 'Брось кубик и двигайся в выпавшую сторону' : 'Ещё один бросок — куда теперь?',
            description: 'Кубик укажет путь: вперёд, назад, влево или вправо.',
          }),
        );
      }

      return tasks;
    },
  },
  {
    id: 'adventurer',
    title: 'Авантюрист',
    emoji: '🎲',
    tags: ['dice', 'adventure', 'walk'],
    budgets: ['low', 'mid', 'high'],
    build(ctx) {
      const total = totalPlan(ctx.time);
      const rolls = ITEM_COUNT[ctx.time];
      const walkPart = Math.round(total / rolls);

      const tasks: Task[] = [];
      let order = 1;

      for (let i = 1; i <= rolls; i += 1) {
        tasks.push(
          task(ctx, {
            type: 'roll_dice',
            order: order++,
            title: i === 1 ? 'Кубик: выбери случайное направление' : `Бросок ${i}: куда теперь?`,
            description: 'Случай будет решать, куда ты пойдёшь.',
          }),
        );
        tasks.push(
          task(ctx, {
            type: 'walk',
            order: order++,
            title: `Пройди ${formatDistance(walkPart)} в выпавшую сторону`,
            distance: walkPart,
          }),
        );
      }

      const spot = randomPointAround(ctx.origin, 400, 900);
      tasks.push(
        task(ctx, {
          type: 'find_place',
          order: order++,
          title: 'Отметь место, в которое тебя привёл случай',
          point: spot,
        }),
      );

      return tasks;
    },
  },
  {
    id: 'photographer',
    title: 'Фотограф',
    emoji: '📸',
    tags: ['photo', 'nature', 'architecture', 'animals'],
    budgets: ['low', 'mid', 'high'],
    build(ctx) {
      const count = ITEM_COUNT[ctx.time];
      const total = totalPlan(ctx.time);
      const walkPart = Math.round(total * 0.35);

      const picks = shuffle(PHOTO_OBJECTS).slice(0, count);

      const tasks: Task[] = [
        task(ctx, {
          type: 'walk',
          order: 1,
          title: `Пройди ${formatDistance(walkPart)} в поисках кадров`,
          distance: walkPart,
        }),
      ];

      picks.forEach((object, index) => {
        const point = randomPointAround(ctx.origin, 300, 1200);
        tasks.push(
          task(ctx, {
            type: 'photo',
            order: index + 2,
            title: `Сфотографируй: ${object}`,
            point,
          }),
        );
      });

      return tasks;
    },
  },
  {
    id: 'gourmet',
    title: 'Гурман',
    emoji: '☕',
    tags: ['cafe', 'food'],
    budgets: ['mid', 'high'],
    build(ctx) {
      const cafe = randomPointAround(ctx.origin, 500, 1500);
      const cafeName = randomElement(CAFE_NAMES);

      const tasks: Task[] = [
        task(ctx, {
          type: 'walk',
          order: 1,
          title: 'Дойди до случайного кафе',
          point: cafe,
        }),
        task(ctx, {
          type: 'visit_cafe',
          order: 2,
          title: `Закажи в «${cafeName}» то, что не пробовал`,
          description: 'Расскажи, что у тебя приключение, — пусть посоветуют.',
          point: cafe,
          placeType: 'cafe',
        }),
        task(ctx, {
          type: 'question',
          order: 3,
          title: 'Опиши свой заказ одним словом',
          description: 'Короткая запись, чтобы потом вспомнить.',
        }),
      ];

      if (ctx.money === 'high') {
        tasks.push(
          task(ctx, {
            type: 'photo',
            order: 4,
            title: 'Сфотографируй свой заказ',
            point: cafe,
          }),
        );
      }

      return tasks;
    },
  },
  {
    id: 'walker',
    title: 'Ходок',
    emoji: '🚶',
    tags: ['walk', 'nature'],
    budgets: ['low', 'mid', 'high'],
    build(ctx) {
      const total = totalPlan(ctx.time);

      const tasks: Task[] = [
        task(ctx, {
          type: 'walk',
          order: 1,
          title: `Пройди ${formatDistance(total)}`,
          description: 'Темп любой, важна дистанция.',
          distance: total,
        }),
      ];

      const waypoint = randomPointAround(ctx.origin, 300, 1200);
      tasks.push(
        task(ctx, {
          type: 'find_place',
          order: 2,
          title: 'Дойди до контрольной точки и осмотрись',
          description: 'Запомни это место — оно отмечено на карте.',
          point: waypoint,
        }),
      );

      if (ctx.money !== 'low') {
        tasks.push(
          task(ctx, {
            type: 'question',
            order: 3,
            title: 'Запиши забавную деталь по пути',
            description: 'Надпись на заборе, повстречавшаяся собака — что угодно.',
          }),
        );
      }

      return tasks;
    },
  },
  {
    id: 'scavenger',
    title: 'Скавенджер',
    emoji: '🔎',
    tags: ['adventure', 'walk', 'photo'],
    budgets: ['low', 'mid', 'high'],
    build(ctx) {
      const count = ITEM_COUNT[ctx.time];
      const total = totalPlan(ctx.time);
      const walkPart = Math.round(total * 0.3);
      const picks = shuffle(LANDMARKS).slice(0, count);

      const tasks: Task[] = [
        task(ctx, {
          type: 'walk',
          order: 1,
          title: `Пройди ${formatDistance(walkPart)} в поисках ориентиров`,
          distance: walkPart,
        }),
      ];

      picks.forEach((landmark, index) => {
        const point = randomPointAround(ctx.origin, 300, 1200);
        tasks.push(
          task(ctx, {
            type: 'find_place',
            order: index + 2,
            title: `Найди: ${landmark}`,
            description: 'Когда найдёшь — отметь точку.',
            point,
          }),
        );
      });

      return tasks;
    },
  },
];