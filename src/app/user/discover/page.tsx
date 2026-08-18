"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useDeferredValue } from "react";
import { BadgeCheck, Crown, Heart, MapPin, SlidersHorizontal, Star, X } from "lucide-react";
import type { DiscoverFilters } from "@/features/user/FiltersPanel";
import { useDiscovery } from "@/hooks/useDiscovery";
import { getToken } from "@/lib/auth";
import { formatDistance } from "@/lib/distance";
import { INTERESTED_IN_OPTIONS } from "@/features/discovery/gender-options";
import { AgeRangeSlider } from "@/features/discovery/AgeRangeSlider";
import { CampaignOfferCard } from "@/features/user/CampaignOfferCard";
import { ConnectLoveChatbot } from "@/features/chatbot/ConnectLoveChatbot";
import { apiFetch } from "@/config/runtime";

const DISTANCE_STEP_KM = 100;
const DISTANCE_OPTIONS_KM = [1, 5, 10, 25, 50, 100, 250, 500, 10000];
const defaultFilters: DiscoverFilters = {
  search: "",
  ageMin: 18,
  ageMax: 90,
  maxDistance: 10000,
  interestedIn: "everyone",
  interests: [],
  goals: [],
  verifiedOnly: false,
};
const FiltersPanel = dynamic(() => import("@/features/user/FiltersPanel").then((mod) => mod.FiltersPanel), {
  ssr: false,
  loading: () => <FiltersPanelShell />,
});
const ProfileCard = dynamic(() => import("@/features/user/ProfileCard").then((mod) => mod.ProfileCard), {
  ssr: false,
  loading: () => <ProfileCardShell />,
});
const RightRail = dynamic(() => import("@/features/user/RightRail").then((mod) => mod.RightRail), {
  ssr: false,
  loading: () => <RightRailShell />,
});

function EmptyProfilesCard() {
  return (
    <div className="flex aspect-[4/5] w-full max-w-[min(92vw,460px)] flex-col items-center justify-center rounded-3xl bg-card p-6 text-center shadow-xl border border-border sm:p-8">
      <div className="mb-4 grid h-[64px] w-[64px] place-items-center rounded-full bg-rose-50 dark:bg-rose-950/30">
        <X className="h-[32px] w-[32px] text-rose-300 dark:text-rose-500" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-semibold text-foreground">No matches found</h3>
      <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters to see more people.</p>
    </div>
  );
}

function ProfileCardShell() {
  return (
    <div className="aspect-[4/5] w-full max-w-[min(92vw,460px)] rounded-3xl border border-border bg-card shadow-xl" />
  );
}

function RightRailShell() {
  return (
    <aside className="hidden h-full flex-col gap-4 lg:flex" aria-hidden="true">
      <div className="h-[116px] rounded-2xl border border-border bg-card shadow-lg" />
      <div className="min-h-[280px] flex-1 rounded-2xl border border-border bg-card shadow-lg" />
    </aside>
  );
}

function FiltersPanelShell() {
  return <aside className="hidden h-[680px] rounded-2xl border border-border bg-card shadow-lg lg:block" aria-hidden="true" />;
}

function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function useSecondaryPanels() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    let idleId: number | undefined;
    const timer = window.setTimeout(() => setReady(true), 800);
    if (win.requestIdleCallback) {
      idleId = win.requestIdleCallback(() => setReady(true), { timeout: 800 });
    }
    return () => {
      window.clearTimeout(timer);
      if (idleId && win.cancelIdleCallback) win.cancelIdleCallback(idleId);
    };
  }, []);

  return ready;
}

function formatDistanceLabel(distance: number) {
  return distance >= 10000 ? "Anywhere" : `${distance} km`;
}

function isOptimizableImage(src: string) {
  return src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/");
}

function MobileFilters({
  filters,
  onChange,
  effectiveMaxDistance,
}: {
  filters: DiscoverFilters;
  onChange: (next: DiscoverFilters) => void;
  effectiveMaxDistance: number;
}) {
  const update = <K extends keyof DiscoverFilters>(key: K, value: DiscoverFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <details className="rounded-2xl border border-border bg-card shadow-sm">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-foreground">
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-rose-600" />
          Filters
        </span>
        <span className="text-xs text-muted-foreground">{filters.ageMin}-{filters.ageMax} yrs · {formatDistanceLabel(effectiveMaxDistance)}</span>
      </summary>
      <div className="space-y-4 border-t border-border p-4">
        <label className="block text-xs font-semibold text-muted-foreground">
          Search
          <input
            type="search"
            value={filters.search}
            onChange={(event) => update("search", event.target.value)}
            placeholder="Search by name..."
            className="mt-1 h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-rose-400"
          />
        </label>
        <div>
          <p className="mb-2 text-xs font-semibold text-muted-foreground">Age Range</p>
          <AgeRangeSlider
            minAge={filters.ageMin}
            maxAge={filters.ageMax}
            onChange={(ageMin, ageMax) => onChange({ ...filters, ageMin, ageMax })}
          />
        </div>
        <label className="block text-xs font-semibold text-muted-foreground">
          Distance: <span className="text-rose-600">{formatDistanceLabel(filters.maxDistance)}</span>
          <input
            type="range"
            value={Math.max(0, DISTANCE_OPTIONS_KM.indexOf(filters.maxDistance))}
            onChange={(event) => update("maxDistance", DISTANCE_OPTIONS_KM[Number(event.target.value)])}
            min={0}
            max={DISTANCE_OPTIONS_KM.length - 1}
            step={1}
            className="mt-2 h-2 w-full accent-rose-600"
          />
        </label>
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Interested In</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTERESTED_IN_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => update("interestedIn", option.value)}
                aria-pressed={filters.interestedIn === option.value}
                className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                  filters.interestedIn === option.value
                    ? "border-rose-600 bg-rose-50 text-rose-700"
                    : "border-border text-muted-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => update("verifiedOnly", !filters.verifiedOnly)}
            className="rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground"
            aria-pressed={filters.verifiedOnly}
          >
            {filters.verifiedOnly ? "Verified only: On" : "Verified only: Off"}
          </button>
          <button type="button" onClick={() => onChange(defaultFilters)} className="text-xs font-semibold text-rose-700">
            Reset
          </button>
        </div>
      </div>
    </details>
  );
}

function MobileProfileCard({ profiles, onAction }: { profiles: any[]; onAction: (id: string, action: string) => boolean | void | Promise<boolean | void> }) {
  const [idx, setIdx] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setIdx(0);
    setPhotoIndex(0);
  }, [profiles]);

  if (profiles.length === 0) return <EmptyProfilesCard />;

  const profile = profiles[idx % profiles.length];
  const photos = profile.photos?.length ? profile.photos : profile.photo ? [profile.photo] : [];
  const photo = photos[photoIndex] || photos[0] || null;
  const distance = profile.distanceKm ?? profile.distanceMi ?? null;

  const advance = async (action: string) => {
    const completed = await onAction(profile.id, action);
    if (completed === false) return;
    setIdx((value) => value + 1);
    setPhotoIndex(0);
  };

  return (
    <div className="mx-auto w-full max-w-[min(92vw,420px)]">
      <button
        type="button"
        onClick={() => setPhotoIndex((value) => photos.length > 1 ? (value + 1) % photos.length : 0)}
        className="relative block aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-900 text-left shadow-xl"
        aria-label="Next profile photo"
      >
        {photo ? (
          isOptimizableImage(photo) ? (
            <Image
              src={photo}
              alt={profile.name}
              fill
              priority
              sizes="(min-width: 1024px) 420px, 92vw"
              className="object-cover"
            />
          ) : (
            <img
              src={photo}
              alt={profile.name}
              width={420}
              height={525}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover"
              draggable={false}
            />
          )
        ) : (
          <div className="h-full w-full bg-slate-800" />
        )}
        {photos.length > 1 && (
          <div className="absolute inset-x-3 top-3 flex gap-1">
            {photos.map((_: string, index: number) => (
              <span key={index} className={`h-1 flex-1 rounded-full ${index === photoIndex ? "bg-rose-500" : "bg-white/35"}`} />
            ))}
          </div>
        )}
        {profile.kycMatched === true && (
          <p className="pointer-events-none absolute right-4 top-5 z-10 inline-flex items-center gap-1 rounded-full border border-emerald-300/50 bg-black/55 px-2.5 py-1 text-[10px] font-bold tracking-wide text-emerald-300 shadow-lg backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
            KYC Verified
          </p>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-4 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold leading-tight">{profile.name}{profile.age ? `, ${profile.age}` : ""}</h2>
            {profile.planBadge && <BadgeCheck className="h-6 w-6 shrink-0 fill-blue-500 text-white" aria-label="Paid plan badge" />}
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90">
            {formatDistance(distance) && profile.showDistance !== false && (
              <>
                <MapPin className="h-4 w-4" />
                {formatDistance(distance)} ·
              </>
            )}
            {profile.profession}
          </p>
          {profile.goals && <span className="mt-2 inline-flex rounded-md bg-white/20 px-2 py-1 text-xs font-semibold">{profile.goals}</span>}
        </div>
      </button>
      <div className="mt-4 flex items-center justify-center gap-4">
        <button type="button" onClick={() => advance("pass")} className="grid h-12 w-12 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm" aria-label="Pass">
          <X className="h-6 w-6" />
        </button>
        <button type="button" onClick={() => advance("superlike")} className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-blue-500 shadow-sm" aria-label="Super like">
          <Star className="h-5 w-5" />
        </button>
        <button type="button" onClick={() => advance("like")} className="grid h-12 w-12 place-items-center rounded-full bg-rose-600 text-white shadow-lg shadow-rose-500/20" aria-label="Like">
          <Heart className="h-6 w-6" fill="currentColor" />
        </button>
      </div>
    </div>
  );
}

function getProfileDistanceKm(profile: any): number | null {
  const distance = profile.distanceKm ?? profile.distanceMi ?? profile.distance;
  return typeof distance === "number" && Number.isFinite(distance) ? distance : null;
}

function matchesNonDistanceFilters(p: any, filters: DiscoverFilters, onlyShowVerifiedProfiles = false): boolean {
  const gender = String(p.gender || "").trim().toLowerCase();
  const genderAliases: Record<string, string[]> = {
    female: ["female", "woman", "women", "girl", "ladies", "f"],
    male: ["male", "man", "men", "boy", "m"],
    "non-binary": ["non-binary", "nonbinary", "non binary", "nb"],
    "prefer-not": ["prefer-not", "prefer not", "prefer not to say"],
  };
  if (filters.interestedIn !== "everyone" && !(genderAliases[filters.interestedIn] || [filters.interestedIn]).includes(gender)) return false;
  if (filters.search && filters.search.trim()) {
    const query = filters.search.toLowerCase().trim();
    const nameMatch = p.name && p.name.toLowerCase().includes(query);
    const usernameMatch = p.username && p.username.toLowerCase().includes(query);
    if (!nameMatch && !usernameMatch) return false;
  }
  if ((p.age ?? 0) < filters.ageMin || (p.age ?? 0) > filters.ageMax) return false;
  if ((filters.verifiedOnly || onlyShowVerifiedProfiles) && !p.isVerified && !p.verified) return false;
  if (filters.interests.length > 0 && !filters.interests.some((i) => (p.interests || []).includes(i))) return false;
  return true;
}

function getEffectiveMaxDistance(profiles: any[], filters: DiscoverFilters, onlyShowVerifiedProfiles = false): number {
  const baseMatches = profiles.filter((p) => matchesNonDistanceFilters(p, filters, onlyShowVerifiedProfiles));
  if (baseMatches.length === 0) return filters.maxDistance;

  const hasMatchInSelectedRange = baseMatches.some((p) => {
    const distance = getProfileDistanceKm(p);
    return distance === null || distance <= filters.maxDistance;
  });
  if (hasMatchInSelectedRange) return filters.maxDistance;

  const nextDistance = baseMatches
    .map(getProfileDistanceKm)
    .filter((distance): distance is number => distance !== null && distance > filters.maxDistance)
    .sort((a, b) => a - b)[0];

  if (!nextDistance) return filters.maxDistance;
  if (nextDistance <= DISTANCE_STEP_KM) return Math.ceil(nextDistance);
  return Math.ceil(nextDistance / DISTANCE_STEP_KM) * DISTANCE_STEP_KM;
}

function applyFilters(profiles: any[], filters: DiscoverFilters, onlyShowVerifiedProfiles = false, maxDistance = filters.maxDistance): any[] {
  return profiles.filter((p) => {
    if (!matchesNonDistanceFilters(p, filters, onlyShowVerifiedProfiles)) return false;
    const distance = getProfileDistanceKm(p);
    if (distance !== null && distance > maxDistance) return false;
    return true;
  }).sort((a, b) => {
    const aGoalPriority = filters.goals.length > 0 && filters.goals.includes(a.goals) ? 0 : 1;
    const bGoalPriority = filters.goals.length > 0 && filters.goals.includes(b.goals) ? 0 : 1;
    if (aGoalPriority !== bGoalPriority) return aGoalPriority - bGoalPriority;
    return (getProfileDistanceKm(a) ?? Number.MAX_SAFE_INTEGER) - (getProfileDistanceKm(b) ?? Number.MAX_SAFE_INTEGER);
  });
}

 export default function Discover() {
  const [filters, setFilters] = useState<DiscoverFilters>(defaultFilters);
  const [dismissedProfileIds, setDismissedProfileIds] = useState<Set<string>>(new Set());
 const [lastSwipedProfile, setLastSwipedProfile] = useState<any | null>(null);
 const [canUsePremiumDiscoveryActions, setCanUsePremiumDiscoveryActions] = useState(false);
 const [lockedDiscoveryFeature, setLockedDiscoveryFeature] = useState<"rewind" | "first-impression" | null>(null);
  const isDesktop = useDesktopLayout();
  const loadSecondaryPanels = useSecondaryPanels();
  const deferredSearch = useDeferredValue(filters.search);
 const token = getToken() || "";
  const locationSyncStarted = useRef(false);
  const requestFilters = useMemo(
    () => ({ search: deferredSearch, ageMin: filters.ageMin, ageMax: filters.ageMax, interestedIn: filters.interestedIn, goals: filters.goals, maxDistance: filters.maxDistance, limit: 12 }),
    [deferredSearch, filters.ageMin, filters.ageMax, filters.interestedIn, filters.goals, filters.maxDistance],
  );
 const { profiles, loading, swipeLeft, swipeRight, swipeSuper, undoSwipe, refreshProfiles, upgradePrompt, closeUpgradePrompt } = useDiscovery(token, requestFilters);

  useEffect(() => {
    if (!token) return;
    apiFetch("/users/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => response.ok ? response.json() : null)
      .then((user) => {
        if (!user) return;
        const gender = String(user.gender || "").trim().toLowerCase();
        const woman = ["female", "woman", "women", "girl", "ladies", "f"].includes(gender);
        const paid = ["gold", "platinum"].includes(String(user.plan || "free").toLowerCase());
        const active = paid && (!user.planExpiresAt || new Date(user.planExpiresAt).getTime() > Date.now());
        setCanUsePremiumDiscoveryActions(woman || active);
      })
      .catch(() => setCanUsePremiumDiscoveryActions(false));
  }, [token]);

  useEffect(() => {
    if (!token || locationSyncStarted.current || !("geolocation" in navigator)) return;
    locationSyncStarted.current = true;

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await apiFetch("/users/me", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              locationLatitude: Number(coords.latitude.toFixed(7)),
              locationLongitude: Number(coords.longitude.toFixed(7)),
            }),
          });
          if (!response.ok) return;

          for (let index = localStorage.length - 1; index >= 0; index -= 1) {
            const key = localStorage.key(index);
            if (key?.startsWith("connect-love:discovery:")) localStorage.removeItem(key);
          }
          await refreshProfiles();
        } catch {
          // Keep the last saved location when GPS or the API is temporarily unavailable.
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 },
    );
  }, [refreshProfiles, token]);

  const effectiveMaxDistance = filters.maxDistance;
  const filtered = useMemo(
    () => applyFilters(profiles, filters, false, effectiveMaxDistance),
    [profiles, filters, effectiveMaxDistance],
  );
  const visibleProfiles = useMemo(
    () => filtered.filter((profile: any) => !dismissedProfileIds.has(profile.id)),
    [dismissedProfileIds, filtered],
  );
 const availableInterests = useMemo(() => profiles.flatMap((p: any) => p.interests || []), [profiles]);
 const availableGoals = useMemo(() => profiles.map((p: any) => p.goals).filter(Boolean), [profiles]);
 
 const handleSwipe = async (id: string, action: string) => {
   setLastSwipedProfile(visibleProfiles.find((profile: any) => profile.id === id) ?? null);
   let completed = false;
   if (action === "superlike" || action === "super") {
     completed = await swipeSuper(id);
   } else if (action === "right" || action === "like") {
     completed = await swipeRight(id);
   } else {
     completed = await swipeLeft(id);
   }
   if (!completed) return false;
   setDismissedProfileIds((current) => new Set(current).add(id));
   return true;
 };

 const handleUndo = async () => {
   if (!lastSwipedProfile) return;
   const restored = await undoSwipe(lastSwipedProfile);
   if (!restored) return;
   setDismissedProfileIds((current) => {
     const next = new Set(current);
     next.delete(lastSwipedProfile.id);
     return next;
   });
   setLastSwipedProfile(null);
 };

 const matchLimitPrompt = Boolean(upgradePrompt && /plan allows.*matches|match with more people/i.test(upgradePrompt));

 return (
 <>
 <CampaignOfferCard />
 {!isDesktop ? (
 <div className="space-y-4">
 <MobileFilters filters={filters} onChange={setFilters} effectiveMaxDistance={effectiveMaxDistance} />
 <div className="flex min-w-0 items-start justify-center">
 {loading ? <ProfileCardShell /> : <ProfileCard profiles={visibleProfiles} onAction={handleSwipe} onUndo={handleUndo} canUndo={Boolean(lastSwipedProfile)} canUsePremiumActions={canUsePremiumDiscoveryActions} onPremiumActionLocked={setLockedDiscoveryFeature} />}
 </div>
 </div>
 ) : (
 <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)_minmax(260px,320px)]">
 {loadSecondaryPanels ? (
 <FiltersPanel filters={filters} onChange={setFilters} availableInterests={availableInterests} availableGoals={availableGoals} effectiveMaxDistance={effectiveMaxDistance} />
 ) : (
 <FiltersPanelShell />
 )}
 <div className="flex min-w-0 items-start justify-center pt-1 sm:pt-2">
 {loading ? <ProfileCardShell /> : <ProfileCard profiles={visibleProfiles} onAction={handleSwipe} onUndo={handleUndo} canUndo={Boolean(lastSwipedProfile)} canUsePremiumActions={canUsePremiumDiscoveryActions} onPremiumActionLocked={setLockedDiscoveryFeature} />}
 </div>
 <div className="hidden min-w-0 lg:block">
 {loadSecondaryPanels ? <RightRail /> : <RightRailShell />}
 </div>
 </div>
 )}
 {upgradePrompt && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="like-limit-title">
   <div className="relative w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-2xl sm:p-8">
    <button type="button" onClick={closeUpgradePrompt} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="Close plan popup"><X className="h-4 w-4" /></button>
    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-amber-100 to-yellow-200 text-amber-600 shadow-lg"><Crown className="h-8 w-8 fill-current" /></div>
    <h2 id="like-limit-title" className="mt-5 text-2xl font-bold text-slate-900">{matchLimitPrompt ? "Match Limit Completed" : "Daily Likes Completed"}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{matchLimitPrompt ? "The Free plan allows 2 active matches. Activate Gold for up to 10 matches or Diamond for up to 20 matches." : "You have used all 10 Likes available on the Free plan today. Activate Gold or Diamond to continue now, or wait until tomorrow for your Likes to reset."}</p>
    <button type="button" onClick={() => { window.location.href = "/user/premium"; }} className="mt-6 h-12 w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:brightness-105">Activate Plan</button>
   </div>
  </div>
 )}
 {lockedDiscoveryFeature && (
  <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="premium-action-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setLockedDiscoveryFeature(null); }}>
   <div className="relative w-full max-w-md rounded-3xl border border-rose-100 bg-white p-6 text-center shadow-2xl sm:p-8">
    <button type="button" onClick={() => setLockedDiscoveryFeature(null)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="Close plan popup"><X className="h-4 w-4" /></button>
    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blue-100 to-violet-200 text-blue-600 shadow-lg">{lockedDiscoveryFeature === "rewind" ? <span className="text-3xl">↶</span> : <Star className="h-8 w-8 fill-current" />}</div>
    <h2 id="premium-action-title" className="mt-5 text-2xl font-bold text-slate-900">Activate a Plan</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{lockedDiscoveryFeature === "rewind" ? "Profile Rewind is available after activating Gold or Diamond." : "First Impressions are available after activating Gold or Diamond."}</p>
    <button type="button" onClick={() => { window.location.href = "/user/premium"; }} className="mt-6 h-12 w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-bold text-white shadow-lg shadow-rose-500/25 hover:brightness-105">View Plans</button>
   </div>
  </div>
 )}
 <ConnectLoveChatbot />
 </>
 );
}
