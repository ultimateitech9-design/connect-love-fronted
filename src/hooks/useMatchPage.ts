"use client";

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/config/runtime';

export type MatchTab = 'active' | 'received' | 'pending' | 'blocked';
export type MatchSummary = { active: number; received: number; sent: number; sentSuper: number; blocked: number };
export type MatchRecord = {
  id: string; senderId: string; receiverId: string;
  status: 'PENDING' | 'MATCHED' | 'DECLINED' | 'BLOCKED';
  isSuperLike?: boolean; locked?: boolean; createdAt?: string;
  sender?: any; receiver?: any;
};
export type MatchPage = { items: MatchRecord[]; page: number; pageSize: number; hasMore: boolean };
export const MATCH_PAGE_SIZE = 20;

export async function matchRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await apiFetch(path, {
    ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || `Matches request failed (${response.status})`);
  }
  return response.json();
}

export const matchPageOptions = (userId: string, token: string, tab: MatchTab, page: number, pending: 'sent' | 'super') => ({
  queryKey: ['matches', 'dashboard-page', userId, tab, tab === 'pending' ? pending : 'all', page] as const,
  queryFn: ({ signal }: { signal: AbortSignal }) => matchRequest<MatchPage>(
    `/matches/page?filter=${tab === 'pending' ? 'sent' : tab}&page=${page}&pageSize=${MATCH_PAGE_SIZE}${tab === 'pending' ? `&kind=${pending === 'super' ? 'super' : 'normal'}` : ''}`,
    token, { signal },
  ),
  enabled: Boolean(userId && token),
  staleTime: 60_000,
  gcTime: 30 * 60_000,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: 1,
});

export function useMatchPage(userId: string, token: string, tab: MatchTab, page: number, pending: 'sent' | 'super') {
  return useQuery(matchPageOptions(userId, token, tab, page, pending));
}

export function useMatchSummary(userId: string, token: string) {
  return useQuery({
    queryKey: ['matches', 'summary', userId],
    queryFn: ({ signal }) => matchRequest<MatchSummary>('/matches/summary', token, { signal }),
    enabled: Boolean(userId && token),
    staleTime: 60_000, gcTime: 30 * 60_000,
    refetchOnMount: true, refetchOnWindowFocus: true, refetchOnReconnect: true,
  });
}
