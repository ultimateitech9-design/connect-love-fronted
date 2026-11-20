"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ORIGIN } from "@/config/runtime";

import { tokenUserId } from '@/lib/auth';

export const currentUserQueryKey = (token: string) => ['current-user', tokenUserId(token)] as const;

export function useCurrentUser(token: string, enabled = true) {
  return useQuery({
    queryKey: currentUserQueryKey(token),
    queryFn: async ({ signal }) => {
      const response = await fetch(`${API_ORIGIN}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }, signal,
      });
      if (!response.ok) throw new Error("Could not load user profile");
      return response.json();
    },
    enabled: enabled && !!token,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: "always",
  });
}
