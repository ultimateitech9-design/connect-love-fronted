"use client";

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi, type MatchFilter } from '@/features/matches/api';

const MATCH_CACHE_DB = 'connect-love-offline';
const MATCH_CACHE_STORE = 'matches';
const matchesCacheKey = (userId: string, filter: MatchFilter, scope: string | number) => `${userId}:${filter}:${scope}`;

function openMatchCache(): Promise<IDBDatabase | null> {
 return new Promise((resolve) => {
  if (typeof indexedDB === 'undefined') return resolve(null);
  const request = indexedDB.open(MATCH_CACHE_DB, 1);
  request.onupgradeneeded = () => {
   if (!request.result.objectStoreNames.contains(MATCH_CACHE_STORE)) request.result.createObjectStore(MATCH_CACHE_STORE);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => resolve(null);
 });
}

async function readCachedMatches(userId: string, filter: MatchFilter, scope: string | number): Promise<any[]> {
 if (userId === 'anonymous') return [];
 const db = await openMatchCache();
 if (!db) return [];
 return new Promise((resolve) => {
  const request = db.transaction(MATCH_CACHE_STORE, 'readonly').objectStore(MATCH_CACHE_STORE).get(matchesCacheKey(userId, filter, scope));
  request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
  request.onerror = () => resolve([]);
 });
}

async function saveCachedMatches(userId: string, filter: MatchFilter, scope: string | number, matches: any[]) {
 if (userId === 'anonymous') return;
 const db = await openMatchCache();
 if (!db) return;
 await new Promise<void>((resolve) => {
  const transaction = db.transaction(MATCH_CACHE_STORE, 'readwrite');
  transaction.objectStore(MATCH_CACHE_STORE).put(matches.slice(0, 250), matchesCacheKey(userId, filter, scope));
  transaction.oncomplete = () => resolve();
  transaction.onerror = () => resolve();
 });
}

export function useMatches(token: string, filter: MatchFilter, options: { enabled?: boolean; limit?: number; all?: boolean } = {}) {
 const queryClient = useQueryClient();
 const isEnabled = options.enabled ?? true;
 const limit = options.limit ?? 12;
 const fetchAll = options.all === true;
 const [cacheHydrated, setCacheHydrated] = useState(false);
 let userKey = 'anonymous';
 try {
  const encoded = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
  const payload = encoded ? JSON.parse(atob(encoded)) : null;
  userKey = String(payload?.userId || payload?.sub || 'anonymous');
 } catch {}

 const cacheScope = fetchAll ? 'all' : limit;
 const queryKey = ['matches', filter, 'access-v4', userKey, cacheScope] as const;

 useEffect(() => {
  let cancelled = false;
  setCacheHydrated(false);
  void readCachedMatches(userKey, filter, cacheScope).then((cached) => {
   if (!cancelled && cached.length > 0) queryClient.setQueryData(queryKey, cached);
  }).finally(() => { if (!cancelled) setCacheHydrated(true); });
  return () => { cancelled = true; };
 }, [filter, userKey, fetchAll, limit]);

 const fetchMatches = async () => {
 if (!token) return [];
 if (!fetchAll) {
  const result = await matchesApi.list(filter, limit);
  void saveCachedMatches(userKey, filter, cacheScope, result);
  return result;
 }
 const collected: any[] = [];
 const pageSize = 25;
 for (let offset = 0; ; offset += pageSize) {
  const batch = await matchesApi.list(filter, pageSize, offset);
  collected.push(...batch);
  const cached = queryClient.getQueryData<any[]>(queryKey) || [];
  const batchIds = new Set(collected.map((match) => match.id));
  const immediate = [...collected, ...cached.filter((match) => !batchIds.has(match.id))];
  queryClient.setQueryData(queryKey, immediate);
  void saveCachedMatches(userKey, filter, cacheScope, immediate);
  if (batch.length < pageSize) break;
 }
 void saveCachedMatches(userKey, filter, cacheScope, collected);
 return collected;
 };

 const { data: matches = [], isLoading, isError } = useQuery({
 // Keep filter second so existing ['matches', 'active'] invalidations refresh
 // this user-scoped query whenever a match is created, blocked, or removed.
 queryKey,
 queryFn: fetchMatches,
 enabled: !!token && isEnabled && cacheHydrated,
 staleTime: 30_000,
 gcTime: 24 * 60 * 60_000,
 refetchOnWindowFocus: false,
 refetchOnMount: 'always',
 refetchOnReconnect: false,
 });

 const actionMutation = useMutation({
 mutationFn: async ({ action, matchId, response }: { action: 'respond' | 'block' | 'unblock', matchId: string, response?: 'accept' | 'decline' }) => {
 if (action === 'respond') return matchesApi.respond(matchId, response!);
 return action === 'block' ? matchesApi.block(matchId) : matchesApi.unblock(matchId);
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['matches'] });
 queryClient.invalidateQueries({ queryKey: ['discovery'] });
 }
 });

 return {
 matches,
 loading: isLoading,
 error: isError,
 acceptMatch: (matchId: string) => actionMutation.mutate({ action: 'respond', matchId, response: 'accept' }),
 declineMatch: (matchId: string) => actionMutation.mutate({ action: 'respond', matchId, response: 'decline' }),
 unblockUser: (matchId: string) => actionMutation.mutate({ action: 'unblock', matchId }),
 blockUser: (matchId: string) => actionMutation.mutate({ action: 'block', matchId }),
 };
}
