import type { DiscoverFilters } from '@/features/user/FiltersPanel';

export const DEFAULT_DISCOVER_FILTERS: DiscoverFilters = {
  search: '', ageMin: 18, ageMax: 90, maxDistance: 10000,
  interestedIn: 'everyone', interests: [], goals: [], verifiedOnly: false,
};

export function filterPreferenceKey(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const id = payload.sub || payload.userId;
    return typeof id === 'string' && id ? 'cl:discover:filters:v1:' + encodeURIComponent(id) : null;
  } catch { return null; }
}

export function normalizeFilterPreferences(value: unknown): DiscoverFilters {
  const stored = value && typeof value === 'object' ? value as Partial<DiscoverFilters> : {};
  const age = (number: unknown, fallback: number) => typeof number === 'number' && Number.isFinite(number) ? Math.min(90, Math.max(18, Math.round(number))) : fallback;
  const ageMin = age(stored.ageMin, 18);
  const array = (values: unknown) => Array.isArray(values) ? [...new Set(values.filter((item): item is string => typeof item === 'string' && item.length > 0 && item.length <= 100))].slice(0, 50) : [];
  return {
    search: '', ageMin, ageMax: Math.max(ageMin, age(stored.ageMax, 90)),
    maxDistance: typeof stored.maxDistance === 'number' && Number.isFinite(stored.maxDistance) ? Math.min(10000, Math.max(1, stored.maxDistance)) : 10000,
    interestedIn: ['everyone', 'female', 'male', 'non-binary', 'prefer-not'].includes(stored.interestedIn || '') ? stored.interestedIn! : 'everyone',
    interests: [], goals: array(stored.goals), verifiedOnly: stored.verifiedOnly === true,
  };
}

export function readFilterPreferences(token: string): DiscoverFilters {
  try {
    const key = filterPreferenceKey(token);
    return normalizeFilterPreferences(key ? JSON.parse(localStorage.getItem(key) || 'null') : null);
  } catch { return normalizeFilterPreferences(null); }
}

export function saveFilterPreferences(token: string, filters: DiscoverFilters) {
  try {
    const key = filterPreferenceKey(token);
    if (key) localStorage.setItem(key, JSON.stringify(normalizeFilterPreferences(filters)));
  } catch { /* Applied settings still work when browser storage is unavailable. */ }
}

export function clearFilterPreferences(token: string) {
  try { const key = filterPreferenceKey(token); if (key) localStorage.removeItem(key); } catch {}
}
