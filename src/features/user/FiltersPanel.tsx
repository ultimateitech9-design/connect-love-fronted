import * as React from "react";
import { BadgeCheck, Calendar, Heart, MapPin, RotateCcw, Search, Users, X } from "lucide-react";
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

export { DEFAULT_DISCOVER_FILTERS as defaultFilters } from '@/features/discovery/filterPreferences';

const ANYWHERE_DISTANCE_KM = 10000;
const DISTANCE_OPTIONS_KM = [1, 5, 10, 25, 50, 100, 250, 500, 10000];
const RELATIONSHIP_GOALS = ["Long-term", "Casual", "Friendships", "Not sure yet"];
// "Prefer not to say" is a profile answer, not something people search for.
const SHOW_ME_OPTIONS = INTERESTED_IN_OPTIONS.filter((option) => option.value !== "prefer-not");

function formatDistanceLabel(distance: number) {
  return distance >= ANYWHERE_DISTANCE_KM ? "Anywhere" : `Up to ${distance} km`;
}

interface FiltersPanelProps {
  filters: DiscoverFilters;
  onChange: (next: DiscoverFilters) => void;
  onApply: () => void;
  onReset: () => void;
  availableGoals?: string[];
  effectiveMaxDistance?: number;
  /** The browser refused location: distance cannot be measured from here. */
  locationBlocked?: boolean;
}

/** One filter: an icon, a name, the current value on the right, and its control below. */
function Section({ icon: Icon, title, value, children }: { icon: React.ElementType; title: string; value?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border/70 py-3.5 first:border-t-0 first:pt-0">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
          <Icon className="h-4 w-4 text-rose-500" />
          {title}
        </h3>
        {value && <span className="truncate text-xs font-semibold text-rose-600">{value}</span>}
      </div>
      {children}
    </section>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        selected
          ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
          : "border-border bg-card text-muted-foreground hover:border-rose-200 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function FiltersPanel({ filters, onChange, onApply, onReset, locationBlocked = false }: FiltersPanelProps) {
  const update = <K extends keyof DiscoverFilters>(key: K, value: DiscoverFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };
  const toggleGoal = (goal: string) =>
    update("goals", filters.goals.includes(goal) ? filters.goals.filter((g) => g !== goal) : [...filters.goals, goal]);

  const showMeLabel = SHOW_ME_OPTIONS.find((option) => option.value === filters.interestedIn)?.label ?? "Everyone";
  const goalsLabel = filters.goals.length === 0 ? "Any" : filters.goals.length === 1 ? filters.goals[0] : `${filters.goals.length} selected`;

  return (
    <aside className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Filters</h2>
          <p className="text-xs text-muted-foreground">Who do you want to see?</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/20"
          title="Reset all filters"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>

      <div className="relative mt-4">
        <label htmlFor="discover-search" className="sr-only">Search by name</label>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="discover-search"
          type="text"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search by name"
          className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-8 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-rose-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {filters.search && (
          <button type="button" onClick={() => update("search", "")} className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted-foreground hover:text-foreground" aria-label="Clear search">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-0.5">
        <Section icon={Calendar} title="Age" value={`${filters.ageMin}–${filters.ageMax} yrs`}>
          <AgeRangeSlider
            minAge={filters.ageMin}
            maxAge={filters.ageMax}
            onChange={(ageMin, ageMax) => onChange({ ...filters, ageMin, ageMax })}
            hideCaption
          />
        </Section>

        <Section icon={MapPin} title="Distance" value={formatDistanceLabel(filters.maxDistance)}>
          <input
            type="range"
            aria-label="Maximum distance"
            value={Math.max(0, DISTANCE_OPTIONS_KM.indexOf(filters.maxDistance))}
            onChange={(e) => update("maxDistance", DISTANCE_OPTIONS_KM[Number(e.target.value)])}
            min={0}
            max={DISTANCE_OPTIONS_KM.length - 1}
            step={1}
            className="h-2 w-full accent-rose-600"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Nearby</span>
            <span>Anywhere</span>
          </div>
          {locationBlocked && (
            <p className="mt-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              Allow location access in your browser to filter by distance.
            </p>
          )}
        </Section>

        <Section icon={Users} title="Show me" value={showMeLabel}>
          <div className="flex flex-wrap gap-1.5">
            {SHOW_ME_OPTIONS.map((option) => (
              <Chip key={option.value} selected={filters.interestedIn === option.value} onClick={() => update("interestedIn", option.value)}>
                {option.label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section icon={Heart} title="Looking for" value={goalsLabel}>
          <div className="flex flex-wrap gap-1.5">
            {RELATIONSHIP_GOALS.map((goal) => (
              <Chip key={goal} selected={filters.goals.includes(goal)} onClick={() => toggleGoal(goal)}>
                {goal}
              </Chip>
            ))}
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">Shows only people looking for these. None selected shows everyone.</p>
        </Section>

        <section className="border-t border-border/70 py-3.5">
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span>
              <span className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                <BadgeCheck className="h-4 w-4 text-rose-500" /> Verified profiles only
              </span>
              <span className="mt-0.5 block pl-6 text-[10px] text-muted-foreground">Only people who passed photo/ID (KYC) verification</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-label="Verified profiles only"
              aria-checked={filters.verifiedOnly}
              onClick={() => update("verifiedOnly", !filters.verifiedOnly)}
              className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", filters.verifiedOnly ? "bg-rose-600" : "bg-slate-300 dark:bg-slate-600")}
            >
              <span className={cn("absolute top-1 h-4 w-4 rounded-full bg-white transition-transform", filters.verifiedOnly ? "left-6" : "left-1")} />
            </button>
          </label>
        </section>
      </div>

      <button
        type="button"
        onClick={onApply}
        className="mt-3 h-11 w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
      >
        Show results
      </button>
    </aside>
  );
}
