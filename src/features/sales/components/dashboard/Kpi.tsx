import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface KpiProps {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  tint?: "rose" | "coral" | "plum" | "gold";
}

const tints: Record<string, string> = {
  rose: "var(--gradient-love)",
  coral: "var(--gradient-sunset)",
  plum: "linear-gradient(135deg, oklch(0.35 0.1 340), oklch(0.22 0.08 340))",
  gold: "linear-gradient(135deg, oklch(0.78 0.15 70), oklch(0.65 0.18 50))",
};

export function Kpi({ label, value, delta, icon: Icon, tint = "rose" }: KpiProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-display text-3xl font-bold text-foreground">{value}</div>
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium">
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 ${
              positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
            }`}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}