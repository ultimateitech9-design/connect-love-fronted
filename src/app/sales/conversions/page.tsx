"use client";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Filter, TrendingUp, Users, Zap } from "lucide-react";


const funnel = [
  { label: "App Installs", value: 240000, pct: 100, tint: "var(--gradient-sunset)" },
  { label: "Active Free Users", value: 168000, pct: 70, tint: "var(--gradient-love)" },
  { label: "Trial Started", value: 42000, pct: 17.5, tint: "linear-gradient(135deg, oklch(0.55 0.2 340), oklch(0.45 0.15 340))" },
  { label: "Paid Subscribers", value: 18420, pct: 7.7, tint: "linear-gradient(135deg, oklch(0.35 0.1 340), oklch(0.22 0.08 340))" },
];

export default function Conversions() {
  return (
    <>
      <PageHeader
        title="Conversion Analytics"
        subtitle="Watch how curious swipers turn into paying matchmakers — step by step through the funnel."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Free → Premium" value="11.0%" delta={1.8} icon={Users} tint="rose" />
        <Kpi label="Trial → Paid" value="43.9%" delta={4.2} icon={Zap} tint="coral" />
        <Kpi label="Avg. Time to Convert" value="6.4 days" delta={-0.8} icon={TrendingUp} tint="gold" />
        <Kpi label="Users Dropped Off" value="32%" delta={-2.1} icon={Filter} tint="plum" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Subscription Funnel" subtitle="From install to paying member" className="lg:col-span-2">
          <div className="space-y-4">
            {funnel.map((f, i) => (
              <div key={f.label}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-medium">{i + 1}. {f.label}</span>
                  <span className="font-display font-semibold">
                    {f.value.toLocaleString()} <span className="ml-2 text-xs text-muted-foreground">{f.pct}%</span>
                  </span>
                </div>
                <div className="h-9 overflow-hidden rounded-lg bg-secondary">
                  <div
                    className="h-full rounded-lg transition-all"
                    style={{ width: `${f.pct}%`, background: f.tint }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Conversion Highlights">
          <ul className="space-y-4 text-sm">
            <li className="rounded-xl bg-secondary/50 p-4">
              <div className="text-xs uppercase tracking-wide text-brand-rose">Best converting source</div>
              <div className="mt-1 font-display text-lg font-semibold">Instagram Reels</div>
              <div className="text-muted-foreground">22.4% trial conversion</div>
            </li>
            <li className="rounded-xl bg-secondary/50 p-4">
              <div className="text-xs uppercase tracking-wide text-brand-rose">Users Converted</div>
              <div className="mt-1 font-display text-lg font-semibold">1,248 Users</div>
              <div className="text-muted-foreground">Free → Premium this month</div>
            </li>
            <li className="rounded-xl bg-secondary/50 p-4">
              <div className="text-xs uppercase tracking-wide text-brand-rose">Top Upgrade Feature</div>
              <div className="mt-1 font-display text-lg font-semibold">See Who Liked You</div>
              <div className="text-muted-foreground">68% of Premium Upgrades</div>
            </li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
