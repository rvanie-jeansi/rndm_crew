export function formatDistance(meters: number): string {
  if (meters < 100) return 'рядом';
  if (meters < 1000) return `${Math.round(meters / 10) * 10} м`;
  const km = meters / 1000;
  if (km >= 10) return `${Math.round(km)} км`;
  return `${km.toFixed(1).replace('.', ',')} км`;
}