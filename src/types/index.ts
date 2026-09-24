export type TaskType = 'walk' | 'find_place' | 'photo' | 'visit_cafe' | 'roll_dice' | 'question';

export type TaskStatus = 'pending' | 'done' | 'skipped';

export type GeoPoint = {
  lat: number;
  lng: number;
};

export type MoneyBudget = 'low' | 'mid' | 'high';
export type TimeBudget = '30m' | '1h' | '2h' | 'all_day';

export type Profile = {
  name: string;
  emoji: string;
  interests: string[];
  createdAt: string;
};

export type Task = {
  id: string;
  type: TaskType;
  title: string;
  description?: string;
  distanceMeters?: number;
  xp: number;
  location?: GeoPoint;
  placeType?: string;
  status: TaskStatus;
  order: number;
  doneAt?: string;
};

export type AdventureStatus = 'active' | 'completed' | 'skipped';

export type Adventure = {
  id: string;
  title: string;
  emoji: string;
  timeBudget: TimeBudget;
  moneyBudget: MoneyBudget;
  tasks: Task[];
  status: AdventureStatus;
  createdAt: string;
  completedAt?: string;
  totalDistanceMeters: number;
  scenarioId?: string;
};

export type VisitedPlace = {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  visitedAt: string;
  adventureId?: string;
};

export type Stats = {
  totalAdventures: number;
  completedAdventures: number;
  totalDistanceMeters: number;
  totalPlacesVisited: number;
  totalTasksDone: number;
  xp: number;
};

export const defaultStats: Stats = {
  totalAdventures: 0,
  completedAdventures: 0,
  totalDistanceMeters: 0,
  totalPlacesVisited: 0,
  totalTasksDone: 0,
  xp: 0,
};