"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useDiscovery(token: string) {
 const queryClient = useQueryClient();

 const fetchSuggestions = async () => {
 if (!token) return [];
 const res = await fetch(`${API_URL}/discovery`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 if (!res.ok) throw new Error('Failed to fetch discovery profiles');
 return res.json();
 };

 const { data: profiles = [], isLoading, isError } = useQuery({
 queryKey: ['discovery'],
 queryFn: fetchSuggestions,
 enabled: !!token,
 });

 const swipeMutation = useMutation({
 mutationFn: async ({ receiverId, action }: { receiverId: string, action: 'like' | 'pass' | 'superlike' }) => {
 const res = await fetch(`${API_URL}/matches/swipe`, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`
 },
 body: JSON.stringify({ receiverId, action })
 });
 if (!res.ok) throw new Error('Failed to swipe');
 return res.json();
 },
 onMutate: async ({ receiverId }) => {
 // Optimistic update: remove profile from discovery
 await queryClient.cancelQueries({ queryKey: ['discovery'] });
 const previousProfiles = queryClient.getQueryData(['discovery']);
 queryClient.setQueryData(['discovery'], (old: any) => old?.filter((p: any) => p.id !== receiverId));
 return { previousProfiles };
 },
 onError: (err, variables, context: any) => {
 queryClient.setQueryData(['discovery'], context.previousProfiles);
 },
 onSettled: () => {
 queryClient.invalidateQueries({ queryKey: ['discovery'] });
 queryClient.invalidateQueries({ queryKey: ['matches'] });
 }
 });

 return {
 profiles,
 loading: isLoading,
 error: isError,
 swipeRight: (id: string) => swipeMutation.mutate({ receiverId: id, action: 'like' }),
 swipeLeft: (id: string) => swipeMutation.mutate({ receiverId: id, action: 'pass' }),
 swipeSuper: (id: string) => swipeMutation.mutate({ receiverId: id, action: 'superlike' }),
 };
}
