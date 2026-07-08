"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

type DiscoveryRequestFilters = {
  search?: string;
  ageMin?: number;
  ageMax?: number;
};

export function useDiscovery(token: string, filters: DiscoveryRequestFilters = {}) {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!token);
  const [error, setError] = useState(false);
  const cacheRef = useRef(new Map<string, any[]>());

  const filterKey = `${filters.search || ""}:${filters.ageMin ?? ""}:${filters.ageMax ?? ""}`;

  const fetchProfiles = useCallback(async (signal?: AbortSignal) => {
    if (!token) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const cached = cacheRef.current.get(filterKey);
    if (cached) {
      setProfiles(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams();
      if (filters.search?.trim()) params.set("search", filters.search.trim());
      if (typeof filters.ageMin === "number") params.set("ageMin", String(filters.ageMin));
      if (typeof filters.ageMax === "number") params.set("ageMax", String(filters.ageMax));
      const query = params.toString();
      const url = query ? `${API_URL}/discovery?${query}` : `${API_URL}/discovery`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      });
      if (!res.ok) throw new Error("Failed to fetch discovery profiles");
      const data = await res.json();
      cacheRef.current.set(filterKey, data);
      setProfiles(data);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError(true);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [filterKey, filters.ageMax, filters.ageMin, filters.search, token]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfiles(controller.signal);
    return () => controller.abort();
  }, [fetchProfiles]);

  const swipe = useCallback(async (receiverId: string, action: "like" | "pass" | "superlike") => {
    if (!token) return;
    const previousProfiles = profiles;
    setProfiles((current) => current.filter((profile) => profile.id !== receiverId));
    try {
      const res = await fetch(`${API_URL}/matches/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ receiverId, action })
      });
      if (!res.ok) throw new Error('Failed to swipe');
      const match = await res.json();
      if (match?.status === "MATCHED" && typeof window !== "undefined") {
        window.setTimeout(() => {
          window.location.href = `/user/messages?id=${match.id}`;
        }, 250);
      }
    } catch {
      setProfiles(previousProfiles);
    }
  }, [profiles, token]);

  return {
    profiles,
    loading,
    error,
    swipeRight: (id: string) => swipe(id, "like"),
    swipeLeft: (id: string) => swipe(id, "pass"),
    swipeSuper: (id: string) => swipe(id, "superlike"),
  };
}
