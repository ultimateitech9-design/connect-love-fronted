"use client";
import { useEffect, useRef, useState } from 'react';
import { getDiscoveryProfileDetails, getDiscoveryProfiles, swipeProfile, undoSwipeProfile, type DiscoveryFilters } from '@/features/discovery/api';
import { toast } from 'sonner';

export function useDiscovery(token: string, filters: DiscoveryFilters = {}) {
  const key = JSON.stringify([token, filters.search, filters.ageMin, filters.ageMax, filters.interestedIn, filters.goals, filters.maxDistance, filters.interests, filters.verifiedOnly]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [upgradePrompt, setUpgradePrompt] = useState<string | null>(null);
  const fresh = () => ({ cursor: undefined as string | undefined, more: true, pending: false, queue: [] as any[], hidden: new Set<string>(), swiping: new Set<string>() });
  const state = useRef(fresh());
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const refill = async () => {
    const run = state.current;
    if (!token || run.pending || !run.more) return;
    run.pending = true;
    if (!run.queue.length) setLoading(true);
    setError(false);
    try {
      while (state.current === run && run.more && run.queue.length < 24) {
        const response = await getDiscoveryProfiles({ ...filtersRef.current, queue: true, cursor: run.cursor, limit: 12 }, AbortSignal.timeout(25000));
        if (state.current !== run) return;
        if (!Array.isArray(response?.items)) throw new Error('Invalid discovery response');
        const seen = new Set(run.queue.map(p => p.id));
        run.queue = [...run.queue, ...response.items.filter((p: any) => {
          if (!p.id || seen.has(p.id) || run.hidden.has(p.id)) return false;
          seen.add(p.id); return true;
        })];
        run.more = Boolean(response.hasMore && response.nextCursor && response.nextCursor !== run.cursor);
        run.cursor = response.nextCursor || undefined;
        setProfiles([...run.queue]); setHasMore(run.more);
        if (run.queue.length) setLoading(false);
      }
    } catch {
      if (state.current === run) setError(true);
    } finally {
      run.pending = false;
      if (state.current === run) setLoading(false);
    }
  };
  const refillRef = useRef(refill);
  refillRef.current = refill;
  useEffect(() => {
    const profile = profiles[0];
    if (!profile || (profile.photos?.length || 0) >= (profile.photoCount || 1)) return;
    const run = state.current;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void getDiscoveryProfileDetails(profile.id, controller.signal).then(details => {
        if (state.current !== run || !details?.photos?.length) return;
        run.queue = run.queue.map(p => p.id === profile.id ? { ...p, photos: details.photos } : p);
        setProfiles([...run.queue]);
      }).catch(() => {});
    }, 500);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [profiles[0]?.id]);
  useEffect(() => {
    state.current = fresh();
    setProfiles([]); setHasMore(true); setError(false); setLoading(Boolean(token));
    if (token) void refillRef.current();
    return () => { state.current = fresh(); };
  }, [key, token]);
  useEffect(() => {
    if (!token || !hasMore || profiles.length >= 12) return;
    const timer = window.setTimeout(() => void refillRef.current(), error ? 3000 : 0);
    return () => window.clearTimeout(timer);
  }, [profiles.length, hasMore, error, token]);
  const swipe = async (id: string, action: 'like' | 'pass' | 'superlike') => {
    const run = state.current;
    if (!token || run.swiping.has(id)) return false;
    const profile = run.queue.find(p => p.id === id);
    if (!profile) return false;
    run.swiping.add(id); run.hidden.add(id);
    run.queue = run.queue.filter(p => p.id !== id); setProfiles([...run.queue]);
    if (!run.queue.length && run.more) setLoading(true);
    if (run.queue.length < 12) void refillRef.current();
    try {
      const result = await swipeProfile(id, action);
      if (state.current === run && result?.status === 'MATCHED') window.location.href = '/user/messages?id=' + result.id;
      return true;
    } catch (e) {
      if (state.current === run) {
        run.hidden.delete(id); run.queue.unshift(profile); setProfiles([...run.queue]); setLoading(false);
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
      if (state.current !== run) return false;
      run.hidden.delete(profile.id); run.queue = [profile, ...run.queue.filter(p => p.id !== profile.id)]; setProfiles([...run.queue]);
      return true;
    } catch { toast.error('Could not undo. Please try again.'); return false; }
  };
  return { profiles, loading, error, hasMore, upgradePrompt, closeUpgradePrompt: () => setUpgradePrompt(null),
    refreshProfiles: () => { state.current.more = true; setHasMore(true); void refillRef.current(); },
    swipeRight: (id: string) => swipe(id, 'like'), swipeLeft: (id: string) => swipe(id, 'pass'), swipeSuper: (id: string) => swipe(id, 'superlike'), undoSwipe };
}
