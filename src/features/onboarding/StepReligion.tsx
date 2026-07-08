import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RELIGIONS = [
  "Hindu",
  "Muslim",
  "Christian",
  "Sikh",
  "Buddhist",
  "Jain",
  "Jewish",
  "Spiritual",
  "Atheist / Agnostic",
  "Other"
];

export function StepReligion({ profile, onNext }: { profile: any; onNext: (val: string) => void }) {
  const [selected, setSelected] = useState(profile?.religion || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selected) onNext(selected);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
      <div>
        <p className="text-slate-400 mb-6 text-center">
          Select your religion to show on your profile.
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {RELIGIONS.map((rel) => {
            const isSelected = selected === rel;
            return (
              <button
                key={rel}
                type="button"
                onClick={() => setSelected(rel)}
                className={cn(
                  "h-[50px] rounded-xl border text-sm font-medium transition-all duration-200",
                  isSelected
                    ? "border-rose-500 bg-rose-500/10 text-white shadow-lg shadow-rose-500/10"
                    : "border-white/10 bg-black/30 text-slate-300 hover:border-white/20 hover:text-white"
                )}
              >
                {rel}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button
          type="submit"
          disabled={!selected}
          className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl h-[48px] px-8 w-full sm:w-auto"
        >
          Continue
        </Button>
      </div>
    </form>
  );
}
