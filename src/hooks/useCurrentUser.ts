"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ORIGIN } from "@/config/runtime";

export function useCurrentUser(token: string, enabled = true) {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await fetch(`${API_ORIGIN}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Could not load user profile");
      return response.json();
    },
    enabled: enabled && !!token,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  });
}
