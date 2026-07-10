"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

type DiscoveryRequestFilters = {
  search?: string;
  ageMin?: number;
  ageMax?: number;
};

export function useDiscovery(token: string, filters: DiscoveryRequestFilters = {}) {
  const filterKey = `${filters.search || ""}:${filters.ageMin ?? ""}:${filters.ageMax ?? ""}`;
  const storageKey = `connect-love:discovery:${filterKey}`;
  const [profiles, setProfiles] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const cached = window.localStorage.getItem(storageKey);
      const parsed = cached ? JSON.parse(cached) : null;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => !!token && profiles.length === 0);
  const [error, setError] = useState(false);
  const cacheRef = useRef(new Map<string, any[]>());

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

    try {
      const stored = window.localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        cacheRef.current.set(filterKey, parsed);
        setProfiles(parsed);
        setLoading(false);
      }
    } catch {}

    setLoading((current) => (profiles.length > 0 ? false : current));
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
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {}
      setProfiles(data);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError(true);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [filterKey, filters.ageMax, filters.ageMin, filters.search, profiles.length, storageKey, token]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfiles(controller.signal);
    return () => controller.abort();
  }, [fetchProfiles]);

  const removeProfileLocally = useCallback((receiverId: string) => {
    setProfiles((current) => {
      const next = current.filter((profile) => profile.id !== receiverId);
      cacheRef.current.set(filterKey, next);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [filterKey, storageKey]);

  const swipe = useCallback(async (receiverId: string, action: "like" | "pass" | "superlike") => {
    if (!token) return;
    removeProfileLocally(receiverId);
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
      setError(true);
    }
  }, [removeProfileLocally, token]);

  return {
    profiles,
    loading,
    error,
    swipeRight: (id: string) => swipe(id, "like"),
    swipeLeft: (id: string) => swipe(id, "pass"),
    swipeSuper: (id: string) => swipe(id, "superlike"),
  };
}
