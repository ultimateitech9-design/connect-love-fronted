import * as React from "react";
import { useMemo, useState } from "react";
import { Calendar, MapPin, Heart, Target, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export interface DiscoverFilters {
  ageMin: number;
  ageMax: number;
  maxDistance: number;
  interests: string[];
  goals: string[];
  verifiedOnly: boolean;
}

export const defaultFilters: DiscoverFilters = {
  ageMin: 18,
  ageMax: 60,
  maxDistance: 20,
  interests: [],
  goals: [],
  verifiedOnly: false,
};

const filtersMeta = [
  { id: "age", label: "Age Range", icon: Calendar },
  { id: "distance", label: "Distance", icon: MapPin },
  { id: "interests", label: "Interests", icon: Heart },
  { id: "goals", label: "Relationship Goals", icon: Target },
  { id: "verified", label: "Verified Only", icon: BadgeCheck },
];

interface FiltersPanelProps {
  filters: DiscoverFilters;
  onChange: (next: DiscoverFilters) => void;
  availableInterests?: string[];
  availableGoals?: string[];
}

export function FiltersPanel({ filters, onChange, availableInterests = [], availableGoals = [] }: FiltersPanelProps) {
  const [active, setActive] = useState("age");

  const allInterests = useMemo(
    () => Array.from(new Set(availableInterests)).sort(),
    [availableInterests],
  );
  const allGoals = useMemo(
    () => Array.from(new Set(availableGoals)).sort(),
    [availableGoals],
  );

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

      <nav className="mt-4 space-y-1">
        {filtersMeta.map((f) => {
          const Icon = f.icon;
          const isActive = active === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-rose-50 text-rose-500"
                  : "text-muted-foreground hover:bg-pink-50 hover:text-rose-400 dark:hover:bg-rose-950/20",
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
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{filters.ageMin} yrs</span>
              <span className="font-semibold text-rose-500">{filters.ageMax} yrs</span>
            </div>
            <Slider
              value={[filters.ageMax]}
              onValueChange={(v: number[]) => update("ageMax", v[0])}
              min={18}
              max={60}
              step={1}
            />
            <p className="text-[10px] text-muted-foreground">Showing ages {filters.ageMin}–{filters.ageMax}</p>
          </div>
        )}

        {active === "distance" && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Max Distance</p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>1 mi</span>
              <span className="font-semibold text-rose-500">{filters.maxDistance} mi</span>
              <span>20 mi</span>
            </div>
            <Slider
              value={[filters.maxDistance]}
              onValueChange={(v: number[]) => update("maxDistance", v[0])}
              min={1}
              max={20}
              step={1}
            />
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
                      ? "border-rose-500 bg-rose-500/20 text-rose-500 dark:text-rose-400"
                      : "border-border bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Checkbox
                    checked={filters.interests.includes(interest)}
                    onCheckedChange={() => update("interests", toggleArray(filters.interests, interest))}
                    className="sr-only"
                  />
                  {interest}
                </label>
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
                      ? "border-pink-500 bg-pink-500/20 text-pink-500 dark:text-pink-400"
                      : "border-border bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  <Checkbox
                    checked={filters.goals.includes(goal)}
                    onCheckedChange={() => update("goals", toggleArray(filters.goals, goal))}
                    className="sr-only"
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
            <Switch
              checked={filters.verifiedOnly}
              onCheckedChange={(v: boolean) => update("verifiedOnly", v)}
            />
          </div>
        )}
      </div>

      <Button
        onClick={() => onChange(defaultFilters)}
        variant="outline"
        className="mt-4 h-[44px] w-full bg-card border border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 font-medium"
      >
        Reset Filters
      </Button>
    </aside>
  );
}
