export type MapPoint = { lat: number; lng: number };

export type AdventureTarget = MapPoint & { id: string; label?: string };

export type VisitedMapPoint = MapPoint & { id: string; name?: string };

export type AdventureMapProps = {
  targets: AdventureTarget[];
  route: MapPoint[];
  visited: VisitedMapPoint[];
  user: MapPoint | null;
  accent: string;
};