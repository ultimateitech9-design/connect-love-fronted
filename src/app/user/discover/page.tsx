"use client";

import { useState, useMemo } from "react";
import { FiltersPanel, defaultFilters, type DiscoverFilters } from "@/features/user/FiltersPanel";
import { ProfileCard } from "@/features/user/ProfileCard";
import { RightRail } from "@/features/user/RightRail";
import { useDiscovery } from "@/hooks/useDiscovery";
import { getToken } from "@/lib/auth";
import { useSettings } from "@/features/user/SettingsContext";
import type { Profile } from "@/features/user/ProfileCard";

const DISTANCE_STEP_KM = 100;

function getProfileDistanceKm(profile: any): number | null {
  const distance = profile.distanceKm ?? profile.distanceMi ?? profile.distance;
  return typeof distance === "number" && Number.isFinite(distance) ? distance : null;
}

function matchesNonDistanceFilters(p: any, filters: DiscoverFilters, onlyShowVerifiedProfiles = false): boolean {
  if (filters.search && filters.search.trim()) {
    const query = filters.search.toLowerCase().trim();
    const nameMatch = p.name && p.name.toLowerCase().includes(query);
    const usernameMatch = p.username && p.username.toLowerCase().includes(query);
    if (!nameMatch && !usernameMatch) return false;
  }
  if ((p.age ?? 0) < filters.ageMin || (p.age ?? 0) > filters.ageMax) return false;
  if ((filters.verifiedOnly || onlyShowVerifiedProfiles) && !p.isVerified && !p.verified) return false;
  if (filters.interests.length > 0 && !filters.interests.some((i) => (p.interests || []).includes(i))) return false;
  if (filters.goals.length > 0 && !filters.goals.includes(p.goals)) return false;
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
  });
}

 export default function Discover() {
  const [filters, setFilters] = useState<DiscoverFilters>(defaultFilters);
  const token = getToken() || "";
  const { profiles, loading, error, swipeLeft, swipeRight, swipeSuper } = useDiscovery(token, filters);
  const { settings } = useSettings();
  
  const effectiveMaxDistance = useMemo(
    () => getEffectiveMaxDistance(profiles, filters, settings.onlyShowVerifiedProfiles),
    [profiles, filters, settings.onlyShowVerifiedProfiles],
  );
  const filtered = useMemo(
    () => applyFilters(profiles, filters, settings.onlyShowVerifiedProfiles, effectiveMaxDistance),
    [profiles, filters, settings.onlyShowVerifiedProfiles, effectiveMaxDistance],
  );
 const availableInterests = useMemo(() => profiles.flatMap((p: any) => p.interests || []), [profiles]);
 const availableGoals = useMemo(() => profiles.map((p: any) => p.goals).filter(Boolean), [profiles]);
 
 const handleSwipe = (id: string, action: string) => {
   if (action === "superlike" || action === "super") {
     swipeSuper(id);
   } else if (action === "right" || action === "like") {
     swipeRight(id);
   } else {
     swipeLeft(id);
   }
 };

 return (
 <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(220px,260px)_minmax(0,1fr)_minmax(260px,320px)]">
 <FiltersPanel filters={filters} onChange={setFilters} availableInterests={availableInterests} availableGoals={availableGoals} effectiveMaxDistance={effectiveMaxDistance} />
 <div className="flex min-w-0 items-start justify-center pt-1 sm:pt-2">
 <ProfileCard profiles={filtered} onAction={handleSwipe} />
 </div>
 <RightRail />
 </div>
 );
}
