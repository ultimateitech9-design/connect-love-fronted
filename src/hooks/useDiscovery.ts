"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

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
 onSuccess: (match: any) => {
 if (match?.status === 'MATCHED') {
 toast.success("It's a match!", {
 description: "You can message or video call from the chat screen.",
 action: {
 label: "Open chat",
 onClick: () => {
 if (typeof window !== "undefined") window.location.href = `/user/messages?id=${match.id}`;
 },
 },
 });
 }
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
