"use client";

import { useState, useMemo } from "react";
import { FiltersPanel, defaultFilters, type DiscoverFilters } from "@/features/user/FiltersPanel";
import { ProfileCard } from "@/features/user/ProfileCard";
import { RightRail } from "@/features/user/RightRail";
import { useDiscovery } from "@/hooks/useDiscovery";
import { getToken } from "@/lib/auth";
import { useSettings } from "@/features/user/SettingsContext";
import type { Profile } from "@/features/user/ProfileCard";

function applyFilters(profiles: any[], filters: DiscoverFilters, onlyShowVerifiedProfiles = false): any[] {
  return profiles.filter((p) => {
    if (filters.search && filters.search.trim()) {
      const query = filters.search.toLowerCase().trim();
      const nameMatch = p.name && p.name.toLowerCase().includes(query);
      const usernameMatch = p.username && p.username.toLowerCase().includes(query);
      return !!(nameMatch || usernameMatch);
    }
    if ((p.age ?? 0) < filters.ageMin || (p.age ?? 0) > filters.ageMax) return false;
    if ((p.distanceMi ?? 0) > filters.maxDistance) return false;
    if ((filters.verifiedOnly || onlyShowVerifiedProfiles) && !p.isVerified && !p.verified) return false;
    if (filters.interests.length > 0 && !filters.interests.some((i) => (p.interests || []).includes(i))) return false;
    if (filters.goals.length > 0 && !filters.goals.includes(p.goals)) return false;
    return true;
  });
}

 export default function Discover() {
  const [filters, setFilters] = useState<DiscoverFilters>(defaultFilters);
  const token = getToken() || "";
  const { profiles, loading, error, swipeLeft, swipeRight, swipeSuper } = useDiscovery(token, filters.search);
  const { settings } = useSettings();
  
  const filtered = useMemo(() => applyFilters(profiles, filters, settings.onlyShowVerifiedProfiles), [profiles, filters, settings.onlyShowVerifiedProfiles]);
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
 <div className="grid gap-6 lg:grid-cols-[260px_1fr_320px]">
 <FiltersPanel filters={filters} onChange={setFilters} availableInterests={availableInterests} availableGoals={availableGoals} />
 <div className="flex items-start justify-center pt-2">
 <ProfileCard profiles={filtered} onAction={handleSwipe} />
 </div>
 <RightRail />
 </div>
 );
}
