'use client';
import { useEffect, useState } from 'react';
import type { DiscoverFilters } from '@/features/user/FiltersPanel';
import { DEFAULT_DISCOVER_FILTERS, readFilterPreferences, saveFilterPreferences, clearFilterPreferences } from '@/features/discovery/filterPreferences';

export function useDiscoverPreferences(token: string) {
  const [filters, setFilters] = useState<DiscoverFilters>(DEFAULT_DISCOVER_FILTERS);
  const [draft, setDraft] = useState<DiscoverFilters>(DEFAULT_DISCOVER_FILTERS);
  const [loadedToken, setLoadedToken] = useState<string | null>(null);
  useEffect(() => {
    const saved = readFilterPreferences(token);
    setFilters(saved); setDraft(saved); setLoadedToken(token);
  }, [token]);
  const change = (next: DiscoverFilters) => {
    setDraft(next);
    // Name search stays live; preference edits wait for Apply.
    setFilters(current => current.search === next.search ? current : { ...current, search: next.search });
  };
  const apply = () => { setFilters({ ...draft }); saveFilterPreferences(token, draft); };
  const reset = () => {
    const defaults = { ...DEFAULT_DISCOVER_FILTERS, interests: [], goals: [] };
    setDraft(defaults); setFilters(defaults); clearFilterPreferences(token);
  };
  return { filters, draft, change, apply, reset, ready: loadedToken === token };
}
