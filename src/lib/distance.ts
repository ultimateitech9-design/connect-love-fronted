export function formatDistance(distanceKm: number | null | undefined): string | null {
  if (typeof distanceKm !== 'number' || !Number.isFinite(distanceKm) || distanceKm < 0) return null;
  if (distanceKm < 0.01) return 'Less than 10 m away';
  if (distanceKm < 1) return `${Math.max(10, Math.round(distanceKm * 100) * 10)} m away`;
  if (distanceKm < 10) return `${distanceKm.toFixed(1).replace(/\.0$/, '')} km away`;
  return `${Math.round(distanceKm)} km away`;
}
