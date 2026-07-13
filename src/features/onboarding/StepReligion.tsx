import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const RELIGIONS = [
  "Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Jewish",
  "Baháʼí", "Zoroastrian", "Shinto", "Taoist", "Confucian", "Pagan",
  "Rastafarian", "Sanamahism", "Sarnaism", "Donyi-Polo", "Animist",
  "Spiritual", "Atheist", "Agnostic", "Atheist / Agnostic",
  "No religion", "Prefer not to say", "Other",
];

function cleanValue(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 100);
}

export function StepReligion({ profile, onNext }: { profile: any; onNext: (val: string) => void }) {
  const [value, setValue] = useState(profile?.religion || "");
  const query = value.trim().toLocaleLowerCase();
  const suggestions = useMemo(() => {
    if (!query) return RELIGIONS;
    return RELIGIONS.filter((religion) => religion.toLocaleLowerCase().includes(query));
  }, [query]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const religion = cleanValue(value);
    if (religion) onNext(religion);
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col justify-between">
      <div className="min-w-0">
        <p className="mb-5 text-center text-slate-400">
          Search, select, or write your religion as you want it shown on your profile.
        </p>
        <div className="relative mx-auto mb-4 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <Input
            autoFocus
            value={value}
            maxLength={100}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Write or search religion..."
            aria-label="Write or search your religion"
            aria-controls="religion-suggestions"
            className="h-14 rounded-xl border-white/10 bg-black/50 pl-12 pr-4 text-base text-white placeholder:text-slate-500 focus-visible:ring-rose-500"
          />
        </div>

        <div id="religion-suggestions" aria-label="Religion suggestions" className="mx-auto grid max-h-[280px] max-w-md grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
          {suggestions.map((religion) => {
            const selected = query === religion.toLocaleLowerCase();
            return (
              <button
                key={religion}
                type="button"
                onClick={() => setValue(religion)}
                className={cn(
                  "min-h-[50px] break-words rounded-xl border px-3 text-sm font-medium transition-all duration-200",
                  selected
                    ? "border-rose-500 bg-rose-500/10 text-white shadow-lg shadow-rose-500/10"
                    : "border-white/10 bg-black/30 text-slate-300 hover:border-white/20 hover:text-white",
                )}
              >
                {religion}
              </button>
            );
          })}
        </div>
        {query && suggestions.length === 0 && (
          <p className="mx-auto max-w-md rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-4 text-center text-sm text-slate-400">
            No matching suggestion. Your custom entry “{cleanValue(value)}” will be saved.
          </p>
        )}
      </div>
      <div className="mt-8 flex justify-end">
        <Button type="submit" disabled={!cleanValue(value)} className="h-12 w-full rounded-xl bg-rose-500 px-8 text-white hover:bg-rose-600 sm:w-auto">
          Continue
        </Button>
      </div>
    </form>
  );
}
