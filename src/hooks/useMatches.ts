"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi, type MatchFilter } from '@/features/matches/api';

export function useMatches(token: string, filter: MatchFilter, options: { enabled?: boolean; limit?: number } = {}) {
 const queryClient = useQueryClient();
 const isEnabled = options.enabled ?? true;
 const limit = options.limit ?? 12;
 let userKey = 'anonymous';
 try {
  const encoded = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
  const payload = encoded ? JSON.parse(atob(encoded)) : null;
  userKey = String(payload?.userId || payload?.sub || 'anonymous');
 } catch {}

 const fetchMatches = async () => {
 if (!token) return [];
 return matchesApi.list(filter, limit);
 };

 const { data: matches = [], isLoading, isError } = useQuery({
 queryKey: ['matches', userKey, filter, limit],
 queryFn: fetchMatches,
 enabled: !!token && isEnabled,
 staleTime: Infinity,
 gcTime: 24 * 60 * 60_000,
 refetchOnWindowFocus: false,
 refetchOnMount: false,
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
