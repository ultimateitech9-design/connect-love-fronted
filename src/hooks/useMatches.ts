"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi, type MatchFilter } from '@/features/matches/api';

const matchesCacheKey = (userId: string, filter: MatchFilter) => `connect-love-matches:${userId}:${filter}`;

function readCachedMatches(userId: string, filter: MatchFilter) {
 if (typeof window === 'undefined' || userId === 'anonymous') return [];
 try {
  const cached = JSON.parse(window.localStorage.getItem(matchesCacheKey(userId, filter)) || '[]');
  return Array.isArray(cached) ? cached : [];
 } catch { return []; }
}

function saveCachedMatches(userId: string, filter: MatchFilter, matches: any[]) {
 if (typeof window === 'undefined' || userId === 'anonymous') return;
 try { window.localStorage.setItem(matchesCacheKey(userId, filter), JSON.stringify(matches.slice(0, 250))); } catch {}
}

export function useMatches(token: string, filter: MatchFilter, options: { enabled?: boolean; limit?: number; all?: boolean } = {}) {
 const queryClient = useQueryClient();
 const isEnabled = options.enabled ?? true;
 const limit = options.limit ?? 12;
 const fetchAll = options.all === true;
 let userKey = 'anonymous';
 try {
  const encoded = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
  const payload = encoded ? JSON.parse(atob(encoded)) : null;
  userKey = String(payload?.userId || payload?.sub || 'anonymous');
 } catch {}

 const fetchMatches = async () => {
 if (!token) return [];
 if (!fetchAll) {
  const result = await matchesApi.list(filter, limit);
  saveCachedMatches(userKey, filter, result);
  return result;
 }
 const collected: any[] = [];
 const pageSize = 100;
 for (let offset = 0; ; offset += pageSize) {
  const batch = await matchesApi.list(filter, pageSize, offset);
  collected.push(...batch);
  if (batch.length < pageSize) break;
 }
 saveCachedMatches(userKey, filter, collected);
 return collected;
 };

 const { data: matches = [], isLoading, isError } = useQuery({
 // Keep filter second so existing ['matches', 'active'] invalidations refresh
 // this user-scoped query whenever a match is created, blocked, or removed.
 queryKey: ['matches', filter, 'access-v4', userKey, fetchAll ? 'all' : limit],
 queryFn: fetchMatches,
 enabled: !!token && isEnabled,
 initialData: () => readCachedMatches(userKey, filter),
 initialDataUpdatedAt: 0,
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
