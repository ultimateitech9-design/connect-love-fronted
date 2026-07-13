"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { matchesApi, type MatchFilter } from '@/features/matches/api';

export function useMatches(token: string, filter: MatchFilter, options: { enabled?: boolean } = {}) {
 const queryClient = useQueryClient();
 const isEnabled = options.enabled ?? true;

 const fetchMatches = async () => {
 if (!token) return [];
 return matchesApi.list(filter);
 };

 const { data: matches = [], isLoading, isError } = useQuery({
 queryKey: ['matches', filter],
 queryFn: fetchMatches,
 enabled: !!token && isEnabled,
 staleTime: 60_000,
 gcTime: 5 * 60_000,
 refetchOnWindowFocus: false,
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
