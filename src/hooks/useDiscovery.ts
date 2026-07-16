"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDiscoveryProfileDetails, getDiscoveryProfiles, swipeProfile } from "@/features/discovery/api";

type DiscoveryRequestFilters = {
  interestedIn?: "female" | "male" | "non-binary" | "everyone";
  search?: string;
  ageMin?: number;
  ageMax?: number;
  goals?: string[];
  limit?: number;
};

export function useDiscovery(token: string, filters: DiscoveryRequestFilters = {}) {
  const filterKey = `${filters.search || ""}:${filters.ageMin ?? ""}:${filters.ageMax ?? ""}:${filters.interestedIn || "everyone"}:${(filters.goals || []).join(",")}:${filters.limit || ""}`;
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
  const profilesRef = useRef(profiles);

  useEffect(() => {
    profilesRef.current = profiles;
  }, [profiles]);

  // Fetch the current card's remaining photos after the critical first paint.
  // The discovery response only carries primary thumbnails, which keeps its
  // JSON payload small while preserving the complete carousel moments later.
  useEffect(() => {
    const current = profiles[0];
    if (!current || (current.photos?.length || 0) >= (current.photoCount || 1)) return;
    const controller = new AbortController();
    const win = window as Window & { requestIdleCallback?: (callback: IdleRequestCallback) => number; cancelIdleCallback?: (handle: number) => void };
    let idleId: number | undefined;
    const load = () => {
      getDiscoveryProfileDetails(current.id, controller.signal)
        .then((details) => {
          if (!details?.photos?.length) return;
          setProfiles((items) => items.map((item) => item.id === current.id ? { ...item, photos: details.photos } : item));
        })
        .catch(() => {});
    };
    const timer = window.setTimeout(load, 900);
    if (win.requestIdleCallback) idleId = win.requestIdleCallback(load);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
      if (idleId && win.cancelIdleCallback) win.cancelIdleCallback(idleId);
    };
  }, [profiles]);

  const fetchProfiles = useCallback(async (signal?: AbortSignal, force = false) => {
    if (!token) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const cached = force ? undefined : cacheRef.current.get(filterKey);
    if (cached) {
      setProfiles(cached);
      setLoading(false);
      return;
    }

    try {
      const stored = force ? null : window.localStorage.getItem(storageKey);
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
      const data = await getDiscoveryProfiles({ ...filters, search: filters.search?.trim() }, signal);
      cacheRef.current.set(filterKey, data);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
      } catch {}
      setProfiles(data);
      profilesRef.current = data;
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError(true);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [filterKey, filters.ageMax, filters.ageMin, filters.goals, filters.interestedIn, filters.limit, filters.search, profiles.length, storageKey, token]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfiles(controller.signal);
    return () => controller.abort();
  }, [fetchProfiles]);

  const removeProfileLocally = useCallback((receiverId: string) => {
    setProfiles((current) => {
      const next = current.filter((profile) => profile.id !== receiverId);
      profilesRef.current = next;
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
      const match = await swipeProfile(receiverId, action);
      if (match?.status === "MATCHED" && typeof window !== "undefined") {
        window.setTimeout(() => {
          window.location.href = `/user/messages?id=${match.id}`;
        }, 250);
      }
      // The API excludes the newly swiped profile, so page one now acts as the
      // next nearest batch without unstable offset pagination.
      if (profilesRef.current.length <= 5) {
        await fetchProfiles(undefined, true);
      }
    } catch {
      setError(true);
    }
  }, [fetchProfiles, removeProfileLocally, token]);

  return {
    profiles,
    loading,
    error,
    swipeRight: (id: string) => swipe(id, "like"),
    swipeLeft: (id: string) => swipe(id, "pass"),
    swipeSuper: (id: string) => swipe(id, "superlike"),
  };
}
