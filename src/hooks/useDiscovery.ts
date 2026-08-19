"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDiscoveryProfileDetails, getDiscoveryProfiles, swipeProfile, undoSwipeProfile } from "@/features/discovery/api";
import { toast } from "sonner";

type DiscoveryRequestFilters = {
  interestedIn?: "female" | "male" | "non-binary" | "prefer-not" | "everyone";
  search?: string;
  ageMin?: number;
  ageMax?: number;
  goals?: string[];
  maxDistance?: number;
  limit?: number;
  excludeIds?: string[];
};

export function useDiscovery(token: string, filters: DiscoveryRequestFilters = {}) {
  let currentUserKey = "anonymous";
  try {
    const payload = token ? JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) : null;
    currentUserKey = String(payload?.sub || payload?.userId || "anonymous");
  } catch {}
  const filterKey = `${filters.search || ""}:${filters.ageMin ?? ""}:${filters.ageMax ?? ""}:${filters.interestedIn || "everyone"}:${(filters.goals || []).join(",")}:${filters.maxDistance ?? ""}:${filters.limit || ""}`;
  // Discovery results contain relationship state and must never leak across
  // accounts using the same browser. Version 3 scopes every cache to the JWT user.
  const storageKey = `connect-love:discovery:v4:${currentUserKey}:${filterKey}`;
  const hiddenStorageKey = `connect-love:discovery:hidden:v1:${currentUserKey}`;
  const hiddenAtLoad = (() => {
    if (typeof window === "undefined") return new Set<string>();
    try {
      const parsed = JSON.parse(window.localStorage.getItem(hiddenStorageKey) || "[]");
      return new Set<string>(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch {
      return new Set<string>();
    }
  })();
  const hiddenIdsRef = useRef(hiddenAtLoad);
  const [profiles, setProfiles] = useState<any[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const cached = window.localStorage.getItem(storageKey);
      const parsed = cached ? JSON.parse(cached) : null;
      return Array.isArray(parsed)
        ? parsed.filter((profile) => !hiddenAtLoad.has(String(profile?.id || "")))
        : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => !!token && profiles.length === 0);
  const [error, setError] = useState(false);
  const [upgradePrompt, setUpgradePrompt] = useState<string | null>(null);
  const cacheRef = useRef(new Map<string, any[]>());
  const profilesRef = useRef(profiles);
  const swipeInFlightRef = useRef(new Set<string>());
  const refillInFlightRef = useRef(false);
  const exhaustedRef = useRef(false);

  const persistHiddenIds = useCallback(() => {
    try {
      const ids = [...hiddenIdsRef.current].slice(-5000);
      hiddenIdsRef.current = new Set(ids);
      window.localStorage.setItem(hiddenStorageKey, JSON.stringify(ids));
    } catch {}
  }, [hiddenStorageKey]);

  const uniqueProfiles = useCallback((items: any[]) => {
    const seen = new Set<string>();
    return items.filter((profile) => {
      const id = String(profile?.id || "");
      if (!id || id === currentUserKey || seen.has(id) || hiddenIdsRef.current.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [currentUserKey]);

  useEffect(() => {
    profilesRef.current = profiles;
  }, [profiles]);

  useEffect(() => {
    let nextHidden = new Set<string>();
    try {
      const parsed = JSON.parse(window.localStorage.getItem(hiddenStorageKey) || "[]");
      nextHidden = new Set(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch {}
    hiddenIdsRef.current = nextHidden;
    exhaustedRef.current = false;
    cacheRef.current.clear();
    setProfiles((current) => {
      const next = current.filter((profile) => !nextHidden.has(String(profile?.id || "")));
      profilesRef.current = next;
      return next;
    });
  }, [hiddenStorageKey]);

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

  const fetchProfiles = useCallback(async (signal?: AbortSignal, force = false, append = false) => {
    if (!token) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    const cached = force ? undefined : cacheRef.current.get(filterKey);
    if (cached) {
      setProfiles(uniqueProfiles(cached));
      setLoading(false);
      return;
    }

    try {
      const stored = force ? null : window.localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cachedProfiles = uniqueProfiles(parsed);
        cacheRef.current.set(filterKey, cachedProfiles);
        setProfiles(cachedProfiles);
        setLoading(false);
      }
    } catch {}

    setLoading((current) => (profiles.length > 0 ? false : current));
    setError(false);
    try {
      const excludeIds = append ? profilesRef.current.map((profile) => String(profile.id)).slice(0, 24) : undefined;
      const response = await getDiscoveryProfiles({ ...filters, search: filters.search?.trim(), excludeIds }, signal);
      const data = uniqueProfiles(Array.isArray(response) ? response : []);
      const nextProfiles = append ? uniqueProfiles([...profilesRef.current, ...data]) : data;
      exhaustedRef.current = append && data.length === 0;
      cacheRef.current.set(filterKey, nextProfiles);
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(nextProfiles));
      } catch {}
      setProfiles(nextProfiles);
      profilesRef.current = nextProfiles;
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setError(true);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [filterKey, filters.ageMax, filters.ageMin, filters.goals, filters.interestedIn, filters.limit, filters.maxDistance, filters.search, storageKey, token, uniqueProfiles]);

  useEffect(() => {
    const controller = new AbortController();
    fetchProfiles(controller.signal);
    return () => controller.abort();
  }, [fetchProfiles]);

  // Keep upcoming unique cards ready in the background. The empty state is
  // reached only after the API confirms no eligible database profiles remain.
  useEffect(() => {
    if (!token || loading || profiles.length === 0 || profiles.length > 8 || exhaustedRef.current || refillInFlightRef.current) return;
    refillInFlightRef.current = true;
    void fetchProfiles(undefined, true, true).finally(() => {
      refillInFlightRef.current = false;
    });
  }, [fetchProfiles, loading, profiles.length, token]);

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
    if (!token || swipeInFlightRef.current.has(receiverId)) return false;
    const removedProfile = profilesRef.current.find((profile) => profile.id === receiverId);
    const queueWillBeEmpty = profilesRef.current.length <= 1;
    swipeInFlightRef.current.add(receiverId);
    hiddenIdsRef.current.add(receiverId);
    persistHiddenIds();
    // Advance the card immediately. If the API rejects the action, restore it.
    removeProfileLocally(receiverId);
    if (queueWillBeEmpty) setLoading(true);
    try {
      const match = await swipeProfile(receiverId, action);
      if (match?.status === "MATCHED" && typeof window !== "undefined") {
        window.setTimeout(() => {
          window.location.href = `/user/messages?id=${match.id}`;
        }, 250);
      }
      // The API excludes the newly swiped profile, so page one now acts as the
      // next nearest batch without unstable offset pagination.
      if (profilesRef.current.length <= 8 && !refillInFlightRef.current) {
        exhaustedRef.current = false;
        refillInFlightRef.current = true;
        void fetchProfiles(undefined, true, true).finally(() => {
          refillInFlightRef.current = false;
        });
      }
      return true;
    } catch (error) {
      hiddenIdsRef.current.delete(receiverId);
      persistHiddenIds();
      if (removedProfile) {
        setProfiles((current) => {
          const next = uniqueProfiles([removedProfile, ...current]);
          profilesRef.current = next;
          cacheRef.current.set(filterKey, next);
          try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
          return next;
        });
      }
      setError(true);
      const message = error instanceof Error ? error.message : "Action could not be completed.";
      if (/like.*limit|limit.*like|upgrade your plan/i.test(message)) setUpgradePrompt(message);
      else toast.error(message);
      return false;
    } finally {
      swipeInFlightRef.current.delete(receiverId);
      if (queueWillBeEmpty && profilesRef.current.length > 0) setLoading(false);
    }
  }, [fetchProfiles, filterKey, persistHiddenIds, removeProfileLocally, storageKey, token, uniqueProfiles]);

  const undoSwipe = useCallback(async (profile: any) => {
    if (!token || !profile?.id) return false;
    try {
      await undoSwipeProfile(profile.id);
      hiddenIdsRef.current.delete(String(profile.id));
      persistHiddenIds();
      setProfiles((current) => {
        const next = [profile, ...current.filter((item) => item.id !== profile.id)];
        profilesRef.current = next;
        cacheRef.current.set(filterKey, next);
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
        return next;
      });
      return true;
    } catch {
      setError(true);
      return false;
    }
  }, [filterKey, persistHiddenIds, storageKey, token]);

  return {
    profiles,
    loading,
    error,
    upgradePrompt,
    closeUpgradePrompt: () => setUpgradePrompt(null),
    refreshProfiles: () => fetchProfiles(undefined, true),
    swipeRight: (id: string) => swipe(id, "like"),
    swipeLeft: (id: string) => swipe(id, "pass"),
    swipeSuper: (id: string) => swipe(id, "superlike"),
    undoSwipe,
  };
}
