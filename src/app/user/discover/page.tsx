"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useMemo, useState, useDeferredValue } from "react";
import { BadgeCheck, Heart, MapPin, SlidersHorizontal, Star, X } from "lucide-react";
import type { DiscoverFilters } from "@/features/user/FiltersPanel";
import { useDiscovery } from "@/hooks/useDiscovery";
import { getToken } from "@/lib/auth";
import { formatDistance } from "@/lib/distance";
import { INTERESTED_IN_OPTIONS } from "@/features/discovery/gender-options";
import { AgeRangeSlider } from "@/features/discovery/AgeRangeSlider";
import { CampaignOfferCard } from "@/features/user/CampaignOfferCard";
import { ConnectLoveChatbot } from "@/features/chatbot/ConnectLoveChatbot";

const DISTANCE_STEP_KM = 100;
const defaultFilters: DiscoverFilters = {
  search: "",
  ageMin: 18,
  ageMax: 90,
  maxDistance: 100,
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
            value={filters.maxDistance}
            onChange={(event) => update("maxDistance", Number(event.target.value))}
            min={1}
            max={10000}
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

function MobileProfileCard({ profiles, onAction }: { profiles: any[]; onAction: (id: string, action: string) => void }) {
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

  const advance = (action: string) => {
    onAction(profile.id, action);
    setIdx((value) => value + 1);
    setPhotoIndex(0);
  };

  return (
    <div className="mx-auto w-full max-w-[min(92vw,420px)]">
      <button
        type="button"
        onClick={() => setPhotoIndex((value) => Math.min(value + 1, Math.max(photos.length - 1, 0)))}
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
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-4 text-white">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold leading-tight">{profile.name}{profile.age ? `, ${profile.age}` : ""}</h2>
            {(profile.verified || profile.isVerified) && <BadgeCheck className="h-5 w-5 text-emerald-400" />}
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
  if (filters.interestedIn !== "everyone" && String(p.gender || "").toLowerCase() !== filters.interestedIn) return false;
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
  const isDesktop = useDesktopLayout();
  const loadSecondaryPanels = useSecondaryPanels();
  const deferredSearch = useDeferredValue(filters.search);
  const token = getToken() || "";
  const requestFilters = useMemo(
    () => ({ search: deferredSearch, ageMin: filters.ageMin, ageMax: filters.ageMax, interestedIn: filters.interestedIn, goals: filters.goals, limit: 8 }),
    [deferredSearch, filters.ageMin, filters.ageMax, filters.interestedIn, filters.goals],
  );
  const { profiles, loading, swipeLeft, swipeRight, swipeSuper } = useDiscovery(token, requestFilters);

  const effectiveMaxDistance = useMemo(
    () => getEffectiveMaxDistance(profiles, filters, false),
    [profiles, filters],
  );
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
 
 const handleSwipe = (id: string, action: string) => {
   setDismissedProfileIds((current) => {
     const next = new Set(current);
     next.add(id);
     return next;
   });
   if (action === "superlike" || action === "super") {
     swipeSuper(id);
   } else if (action === "right" || action === "like") {
     swipeRight(id);
   } else {
     swipeLeft(id);
   }
 };

 return (
 <>
 <CampaignOfferCard />
 {!isDesktop ? (
 <div className="space-y-4">
 <MobileFilters filters={filters} onChange={setFilters} effectiveMaxDistance={effectiveMaxDistance} />
 <div className="flex min-w-0 items-start justify-center">
 {loading ? <ProfileCardShell /> : <ProfileCard profiles={visibleProfiles} onAction={handleSwipe} />}
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
 {loading ? <ProfileCardShell /> : <ProfileCard profiles={visibleProfiles} onAction={handleSwipe} />}
 </div>
 <div className="hidden min-w-0 lg:block">
 {loadSecondaryPanels ? <RightRail /> : <RightRailShell />}
 </div>
 </div>
 )}
 <ConnectLoveChatbot />
 </>
 );
}
