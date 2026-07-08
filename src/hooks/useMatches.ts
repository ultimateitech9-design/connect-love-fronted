"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export function useMatches(token: string, filter: 'active' | 'sent' | 'received' | 'blocked', options: { enabled?: boolean } = {}) {
 const queryClient = useQueryClient();
 const isEnabled = options.enabled ?? true;

 const fetchMatches = async () => {
 if (!token) return [];
 const res = await fetch(`${API_URL}/matches?filter=${filter}`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 if (!res.ok) throw new Error(`Failed to fetch ${filter} matches`);
 return res.json();
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
 mutationFn: async ({ endpoint, method, body }: { endpoint: string, method: string, body?: any }) => {
 const res = await fetch(`${API_URL}/matches/${endpoint}`, {
 method,
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`
 },
 body: body ? JSON.stringify(body) : undefined
 });
 if (!res.ok) throw new Error(`Action failed`);
 return res.json();
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
 acceptMatch: (matchId: string) => actionMutation.mutate({ endpoint: 'respond', method: 'POST', body: { matchId, action: 'accept' } }),
 declineMatch: (matchId: string) => actionMutation.mutate({ endpoint: 'respond', method: 'POST', body: { matchId, action: 'decline' } }),
 unblockUser: (matchId: string) => actionMutation.mutate({ endpoint: `unblock/${matchId}`, method: 'PATCH' }),
 blockUser: (matchId: string) => actionMutation.mutate({ endpoint: `block/${matchId}`, method: 'PATCH' }),
 };
}
