import * as React from "react";
import { useMemo, useState } from "react";
import { Calendar, MapPin, Heart, Target, BadgeCheck, Search, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { INTERESTED_IN_OPTIONS, type InterestedIn } from "@/features/discovery/gender-options";
import { AgeRangeSlider } from "@/features/discovery/AgeRangeSlider";

export interface DiscoverFilters {
  search: string;
  ageMin: number;
  ageMax: number;
  maxDistance: number;
  interestedIn: InterestedIn;
  interests: string[];
  goals: string[];
  verifiedOnly: boolean;
}

export const defaultFilters: DiscoverFilters = {
  search: "",
  ageMin: 18,
  ageMax: 90,
  maxDistance: 100,
  interestedIn: "everyone",
  interests: [],
  goals: [],
  verifiedOnly: false,
};

const ANYWHERE_DISTANCE_KM = 10000;
const RELATIONSHIP_GOALS = ["Long-term", "Casual", "Friendships", "Not sure yet"];

function formatDistanceLabel(distance: number) {
  return distance >= ANYWHERE_DISTANCE_KM ? "Anywhere" : `${distance} km`;
}

const filtersMeta = [
  { id: "age", label: "Age Range", icon: Calendar },
  { id: "distance", label: "Distance", icon: MapPin },
  { id: "interestedIn", label: "Interested In", icon: Users },
  { id: "interests", label: "Interests", icon: Heart },
  { id: "goals", label: "Relationship Goals", icon: Target },
  { id: "verified", label: "Verified Only", icon: BadgeCheck },
];

interface FiltersPanelProps {
  filters: DiscoverFilters;
  onChange: (next: DiscoverFilters) => void;
  availableInterests?: string[];
  availableGoals?: string[];
  effectiveMaxDistance?: number;
}

export function FiltersPanel({ filters, onChange, availableInterests = [], availableGoals = [], effectiveMaxDistance = filters.maxDistance }: FiltersPanelProps) {
  const [active, setActive] = useState("age");

  const allInterests = useMemo(
    () => Array.from(new Set(availableInterests)).sort(),
    [availableInterests],
  );
  const allGoals = RELATIONSHIP_GOALS;

  const update = <K extends keyof DiscoverFilters>(key: K, value: DiscoverFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleArray = (arr: string[], value: string) =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  return (
    <aside className="flex h-full flex-col rounded-2xl bg-card p-6 shadow-lg border border-border">
      <div className="border-b pb-4" style={{ borderColor: "rgba(236,72,153,0.15)" }}>
        <h2 className="text-xl font-bold text-foreground">Filters</h2>
        <p className="mt-1 text-xs text-muted-foreground">Refine your matches</p>
      </div>

      {/* Search Bar */}
      <div className="mt-4 relative">
        <label htmlFor="discover-search" className="sr-only">
          Search matches by name
        </label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          id="discover-search"
          type="text"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search by name..."
          className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-input bg-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus:border-rose-400 transition-colors text-foreground"
        />
        {filters.search && (
          <button
            type="button"
            onClick={() => update("search", "")}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground cursor-pointer"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="mt-4 space-y-1">
        {filtersMeta.map((f) => {
          const Icon = f.icon;
          const isActive = active === f.id;
          return (
            <button
              type="button"
              key={f.id}
              onClick={() => setActive(f.id)}
              aria-pressed={isActive}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-rose-50 text-rose-700"
                  : "text-muted-foreground hover:bg-pink-50 hover:text-rose-700 dark:hover:bg-rose-950/20",
              )}
            >
              <Icon className="h-4 w-4" />
              {f.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 flex-1 rounded-xl p-4 bg-muted/30 border border-border">
        {active === "age" && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Age Range</p>
            <AgeRangeSlider
              minAge={filters.ageMin}
              maxAge={filters.ageMax}
              onChange={(ageMin, ageMax) => onChange({ ...filters, ageMin, ageMax })}
            />
          </div>
        )}

        {active === "distance" && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Max Distance</p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>1 km</span>
              <span className="font-semibold text-rose-500">{formatDistanceLabel(filters.maxDistance)}</span>
              <span>Anywhere</span>
            </div>
            <input
              type="range"
              aria-label="Maximum distance"
              value={filters.maxDistance}
              onChange={(e) => update("maxDistance", Number(e.target.value))}
              min={1}
              max={ANYWHERE_DISTANCE_KM}
              step={1}
              className="h-2 w-full accent-rose-600"
            />
            <p className="text-[10px] text-muted-foreground">
              {effectiveMaxDistance > filters.maxDistance
                ? `No one found nearby, auto-expanded to ${formatDistanceLabel(effectiveMaxDistance)}.`
                : `Showing profiles within ${formatDistanceLabel(filters.maxDistance)}.`}
            </p>
          </div>
        )}

        {active === "interests" && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Select Interests</p>
            <div className="flex flex-wrap gap-2">
              {allInterests.map((interest) => (
                <label
                  key={interest}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    filters.interests.includes(interest)
                      ? "border-rose-600 bg-rose-100 text-rose-700 dark:text-rose-300"
                      : "border-border bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={filters.interests.includes(interest)}
                    onChange={() => update("interests", toggleArray(filters.interests, interest))}
                    className="sr-only"
                    aria-label={`Interest ${interest}`}
                  />
                  {interest}
                </label>
              ))}
            </div>
          </div>
        )}

        {active === "interestedIn" && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Interested In</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTED_IN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update("interestedIn", option.value)}
                  aria-pressed={filters.interestedIn === option.value}
                  className={cn(
                    "rounded-full border px-3 py-2 text-xs font-medium transition",
                    filters.interestedIn === option.value
                      ? "border-rose-600 bg-rose-100 text-rose-700 dark:text-rose-300"
                      : "border-border bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {active === "goals" && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Relationship Goals</p>
            <div className="flex flex-wrap gap-2">
              {allGoals.map((goal) => (
                <label
                  key={goal}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    filters.goals.includes(goal)
                      ? "border-pink-600 bg-pink-100 text-pink-700 dark:text-pink-300"
                      : "border-border bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={filters.goals.includes(goal)}
                    onChange={() => update("goals", toggleArray(filters.goals, goal))}
                    className="sr-only"
                    aria-label={`Relationship goal ${goal}`}
                  />
                  {goal}
                </label>
              ))}
            </div>
          </div>
        )}

        {active === "verified" && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Show verified profiles only</span>
            <button
              type="button"
              role="switch"
              aria-label="Show verified profiles only"
              aria-checked={filters.verifiedOnly}
              onClick={() => update("verifiedOnly", !filters.verifiedOnly)}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors",
                filters.verifiedOnly ? "bg-rose-600" : "bg-slate-300",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 h-4 w-4 rounded-full bg-white transition-transform",
                  filters.verifiedOnly ? "left-6" : "left-1",
                )}
              />
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(defaultFilters)}
        className="mt-4 h-[44px] w-full bg-card border border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 dark:hover:bg-rose-950/20 font-medium"
      >
        Reset Filters
      </button>
    </aside>
  );
}
