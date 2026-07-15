import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const RELATIONSHIP_GOALS = ["Long-term", "Casual", "Friendships", "Not sure yet"] as const;

export function StepRelationshipGoal({
  profile,
  onNext,
}: {
  profile: any;
  onNext: (val: string) => void;
}) {
  const [value, setValue] = useState(profile?.relationshipGoal || "");

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <p className="mb-6 text-center text-slate-400">
          Choose what you are looking for so matches feel more relevant.
        </p>
        <div className="mx-auto rounded-2xl border border-white/10 bg-black/30 p-3">
          <div className="flex flex-wrap gap-3">
            {RELATIONSHIP_GOALS.map((goal) => {
              const selected = value === goal;
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setValue(goal)}
                  aria-pressed={selected}
                  className={cn(
                    "min-h-11 rounded-full border px-5 text-sm font-medium transition-all duration-200",
                    selected
                      ? "border-rose-500 bg-rose-500/15 text-white shadow-lg shadow-rose-500/10"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-rose-400 hover:bg-rose-500/10 hover:text-white",
                  )}
                >
                  {goal}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={() => value && onNext(value)}
          disabled={!value}
          className="h-12 w-full rounded-xl bg-rose-500 px-8 text-white hover:bg-rose-600 sm:w-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
