import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const toneStyles: Record<string, string> = {
 pink: "bg-pink-50 text-pink-700",
 blue: "bg-blue-50 text-blue-700",
 violet: "bg-violet-50 text-violet-700",
 amber: "bg-amber-50 text-amber-700",
};

type StatCardProps = {
 label: string;
 value: string;
 delta?: string;
 icon: LucideIcon;
 tone: keyof typeof toneStyles;
 valueClassName?: string;
 onClick?: () => void;
};

export function StatCard({ label, value, delta, icon: Icon, tone, valueClassName, onClick }: StatCardProps) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className={cn("text-2xl font-bold text-foreground mt-1", valueClassName)}>{value}</p>
        </div>
        <div className={cn("rounded-xl p-2.5", toneStyles[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {delta ? <p className="mt-2 text-xs text-muted-foreground">{delta} from last period</p> : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-brand focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-brand">
      {content}
    </div>
  );
}
