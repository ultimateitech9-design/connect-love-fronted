"use client";
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getDiscoveryProfileDetails, getDiscoveryProfiles, swipeProfile, undoSwipeProfile, type DiscoveryFilters } from '@/features/discovery/api';
import { toast } from 'sonner';

const queueCache = new Map<string, { at: number; profiles: any[]; cursor?: string; more: boolean }>();
const CACHE_TTL = 2 * 60_000;

export function clearDiscoveryQueueCache() {
  queueCache.clear();
  try {
    for (let index = sessionStorage.length - 1; index >= 0; index--) {
      const cacheKey = sessionStorage.key(index);
      if (cacheKey?.startsWith('cl:discover:queue:v1:')) sessionStorage.removeItem(cacheKey);
    }
  } catch {}
}

export function useDiscovery(token: string, filters: DiscoveryFilters = {}) {
  const queryClient = useQueryClient();
  const key = JSON.stringify([token, filters.search, filters.ageMin, filters.ageMax, filters.interestedIn, filters.goals, filters.maxDistance, filters.interests, filters.verifiedOnly]);
  let accountId = '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    accountId = String(payload.sub || payload.userId || '');
  } catch {}
  const storageKey = accountId ? 'cl:discover:queue:v1:' + accountId + ':' + JSON.stringify([filters.search, filters.ageMin, filters.ageMax, filters.interestedIn, filters.goals, filters.maxDistance, filters.interests, filters.verifiedOnly]) : '';
  const readCache = () => {
    if (!token) return undefined;
    try {
      const saved = queueCache.get(key) || (storageKey ? JSON.parse(sessionStorage.getItem(storageKey) || 'null') : null);
      if (saved && Date.now() - saved.at < CACHE_TTL && Array.isArray(saved.profiles) && saved.profiles.length) return saved;
    } catch {}
    return undefined;
  };
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [photoRevision, setPhotoRevision] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [upgradePrompt, setUpgradePrompt] = useState<string | null>(null);
  const fresh = () => ({ cursor: undefined as string | undefined, more: true, pending: false, queue: [] as any[], hidden: new Set<string>(), swiping: new Set<string>(), failures: 0, legacy: false, cached: false, controller: undefined as AbortController | undefined });
  const state = useRef(fresh());
  const retryTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const persist = (run: ReturnType<typeof fresh>) => {
    if (state.current !== run || !token) return;
    const saved = { at: Date.now(), profiles: run.queue.slice(0, 4).map(profile => ({ ...profile, photos: profile.photos?.slice(0, 1) })), cursor: undefined, more: true };
    if (queueCache.size >= 20) queueCache.delete(queueCache.keys().next().value!);
    queueCache.set(key, saved);
    try {
      if (storageKey) {
        // Base64 photos can be large; keep storage bounded and optional.
        const serialized = JSON.stringify(saved);
        if (serialized.length < 1_500_000) sessionStorage.setItem(storageKey, serialized);
        else sessionStorage.removeItem(storageKey);
      }
    } catch {}
  };
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const refill = async () => {
    const run = state.current;
    if (!token || run.pending || !run.more) return;
    run.pending = true;
    if (!run.queue.length) setLoading(true);
    try {
      while (state.current === run && run.more && run.queue.length < 24) {
        const controller = new AbortController();
        run.controller = controller;
        const timeout = window.setTimeout(() => controller.abort(), 25000);
        let response: any;
        try {
          response = await getDiscoveryProfiles({
            ...filtersRef.current,
            queue: run.legacy ? undefined : true,
            cursor: run.legacy ? undefined : run.cursor,
            excludeIds: [...run.hidden, ...(run.cached ? [] : run.queue.map(p => p.id))].slice(-24),
            limit: run.queue.length && !run.cached ? Math.min(12, 24 - run.queue.length) : 4,
          }, controller.signal);
        } finally { window.clearTimeout(timeout); }
        if (state.current !== run || controller.signal.aborted) return;
        // Support rolling deployments where the API still returns an array.
        const items = Array.isArray(response) ? response : response?.items;
        if (!Array.isArray(items)) throw new Error('Invalid discovery response');
        run.legacy = Array.isArray(response);
        // A fresh server response replaces cached cards to recheck eligibility.
        if (run.cached) { run.queue = []; run.cached = false; }
        const seen = new Set(run.queue.map(p => p.id));
        const additions = items.filter((p: any) => {
          if (!p.id || seen.has(p.id) || run.hidden.has(p.id)) return false;
          seen.add(p.id); return true;
        });
        run.queue = [...run.queue, ...additions];
        run.more = run.legacy ? additions.length > 0 : Boolean(response.hasMore && response.nextCursor && response.nextCursor !== run.cursor);
        run.cursor = response.nextCursor || undefined;
        run.failures = 0; setError(false);
        setProfiles([...run.queue]); setHasMore(run.more);
        persist(run);
        if (run.queue.length) setLoading(false);
      }
    } catch (failure) {
      if (state.current === run) {
        run.failures++;
        console.warn('Discover request failed:', failure instanceof Error ? failure.message : 'Request failed');
        // Retry transient failures before replacing an empty card with an error.
        setError(run.failures >= 3);
        clearTimeout(retryTimer.current);
        retryTimer.current = setTimeout(() => { void refillRef.current(); }, Math.min(10000, 500 * 2 ** Math.min(run.failures, 4)));
      }
    } finally {
      run.pending = false;
      if (state.current === run) setLoading(false);
    }
  };
  const refillRef = useRef(refill);
  refillRef.current = refill;
  useEffect(() => {
    const refreshPhotos = () => {
      state.current.controller?.abort();
      setPhotoRevision(previous => previous + 1);
    };
    window.addEventListener('profilePhotosChanged', refreshPhotos);
    return () => window.removeEventListener('profilePhotosChanged', refreshPhotos);
  }, []);
  useEffect(() => {
    const profile = profiles[0];
    if (!profile || (profile.photos?.length || 0) >= (profile.photoCount || 1)) return;
    const run = state.current;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void getDiscoveryProfileDetails(profile.id, controller.signal).then(details => {
        if (state.current !== run || !Array.isArray(details?.photos)) return;
        run.queue = run.queue.map(p => p.id === profile.id ? {
          ...p,
          photo: details.photos[0] || null,
          avatarUrl: details.photos[0] || null,
          photos: details.photos,
          photoCount: details.photos.length,
        } : p);
        setProfiles([...run.queue]);
      }).catch(() => {});
    }, 500);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [profiles[0]?.id]);
  useEffect(() => {
    state.current.controller?.abort();
    clearTimeout(retryTimer.current);
    const run = fresh();
    const saved = readCache();
    if (saved) { run.queue = saved.profiles; run.cached = true; }
    state.current = run;
    setProfiles([...run.queue]); setHasMore(true); setError(false); setLoading(Boolean(token) && !run.queue.length);
    if (token) void refillRef.current();
    return () => { state.current.controller?.abort(); clearTimeout(retryTimer.current); state.current = fresh(); };
  }, [key, token, photoRevision]);
  useEffect(() => {
    if (!token || !hasMore || profiles.length >= 12 || state.current.failures) return;
    const timer = window.setTimeout(() => void refillRef.current(), 0);
    return () => window.clearTimeout(timer);
  }, [profiles.length, hasMore, error, token]);
  const swipe = async (id: string, action: 'like' | 'pass' | 'superlike') => {
    const run = state.current;
    if (!token || run.swiping.has(id)) return false;
    const profile = run.queue.find(p => p.id === id);
    if (!profile) return false;
    run.swiping.add(id); run.hidden.add(id);
    run.queue = run.queue.filter(p => p.id !== id); setProfiles([...run.queue]);
    persist(run);
    if (!run.queue.length && run.more) setLoading(true);
    if (run.queue.length < 12) void refillRef.current();
    try {
      const result = await swipeProfile(id, action);
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
      if (state.current === run && run.legacy && run.queue.length < 12) { run.more = true; setHasMore(true); void refillRef.current(); }
      if (state.current === run && result?.status === 'MATCHED') window.location.href = '/user/messages?id=' + result.id;
      return true;
    } catch (e) {
      if (state.current === run) {
        run.hidden.delete(id); run.queue.unshift(profile); setProfiles([...run.queue]); setLoading(false);
        persist(run);
        const message = e instanceof Error ? e.message : 'Could not save this action.';
        if (/like.*limit|limit.*like|upgrade your plan/i.test(message)) setUpgradePrompt(message); else toast.error(message);
      }
      return false;
    } finally { run.swiping.delete(id); }
  };
  const undoSwipe = async (profile: any) => {
    const run = state.current;
    try {
      await undoSwipeProfile(profile.id);
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
      if (state.current !== run) return false;
      run.hidden.delete(profile.id); run.queue = [profile, ...run.queue.filter(p => p.id !== profile.id)]; setProfiles([...run.queue]);
      persist(run);
      return true;
    } catch { toast.error('Could not undo. Please try again.'); return false; }
  };
  return { profiles, loading, error, hasMore, upgradePrompt, closeUpgradePrompt: () => setUpgradePrompt(null),
    refreshProfiles: () => { state.current.more = true; setHasMore(true); void refillRef.current(); },
    swipeRight: (id: string) => swipe(id, 'like'), swipeLeft: (id: string) => swipe(id, 'pass'), swipeSuper: (id: string) => swipe(id, 'superlike'), undoSwipe };
}
