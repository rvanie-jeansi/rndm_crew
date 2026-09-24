import type { GeoPoint } from '@/types';

const EARTH_RADIUS_METERS = 6371000;

const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function randomPointAround(
  origin: GeoPoint,
  minMeters: number,
  maxMeters: number,
): GeoPoint {
  const distance = minMeters + Math.random() * (maxMeters - minMeters);
  const bearing = Math.random() * 2 * Math.PI;
  const dLat = (distance / EARTH_RADIUS_METERS) * Math.cos(bearing);
  const dLng =
    (distance / EARTH_RADIUS_METERS) * Math.sin(bearing) /
    Math.max(0.01, Math.cos(toRad(origin.lat)));
  return { lat: origin.lat + dLat, lng: origin.lng + dLng };
}