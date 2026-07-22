"use client";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { CreditCard, Crown, Repeat, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";


const COLORS = ["oklch(0.85 0.18 30)", "oklch(0.75 0.22 0)", "oklch(0.65 0.15 340)"];

export default function Overview() {
  const [kpis, setKpis] = useState<{ label: string; value: string; delta: number; icon: LucideIcon; tint: "rose" | "gold" | "coral" | "plum" }[]>([]);
  const [liveRevenue, setLiveRevenue] = useState<{ day: string; revenue: number; signups: number }[]>([]);
  const [livePlanSplit, setLivePlanSplit] = useState<{ name: string; value: number }[]>([]);
  const [topMarkets, setTopMarkets] = useState<{ city: string; value: number }[]>([]);
  const [upgrades, setUpgrades] = useState<{ name: string; plan: string; amt: string; t: string }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.salesOverview(), api.salesPlans()])
      .then(([data, plans]) => {
        const icons = [CreditCard, Crown, Repeat, Sparkles];
        const tints = ["rose", "gold", "coral", "plum"] as const;
        setKpis(data.kpis.map((k, index) => ({ ...k, icon: icons[index] || Sparkles, tint: tints[index] || "rose" })));
        setLiveRevenue(data.revenueData);
        setLivePlanSplit(data.planSplit);
        setUpgrades(data.recentUpgrades);
        setTopMarkets(plans.topMarkets);
      })
      .catch(() => setError("Failed to load sales overview from backend."));
  }, []);

  return (
    <>
      <PageHeader
        title="Sales Overview"
        subtitle="A live pulse of subscriptions, premium upgrades, and the love-driven revenue powering connectLove."
      />
      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => <Kpi key={k.label} label={k.label} value={k.value} delta={k.delta} icon={k.icon} tint={k.tint} />)}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          title="Revenue This Week"
          subtitle="Daily subscription revenue (USD)"
          className="xl:col-span-2"
        >
          <div className="h-72 w-full">
            {liveRevenue.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No revenue data yet.</div> : <ResponsiveContainer>
              <AreaChart data={liveRevenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.22 0)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.62 0.22 0)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 350)" />
                <XAxis dataKey="day" stroke="oklch(0.5 0.04 350)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.04 350)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid oklch(0.92 0.02 350)",
                    background: "white",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.62 0.22 0)"
                  strokeWidth={3}
                  fill="url(#rev)"
                />
              </AreaChart>
            </ResponsiveContainer>}
          </div>
        </Panel>

        <Panel title="Plan Mix" subtitle="Share of active subscriptions">
          <div className="h-72 w-full">
            {livePlanSplit.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No plan mix data yet.</div> : <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={livePlanSplit}
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {livePlanSplit.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Panel title="Top Markets" subtitle="Subscriptions by city">
          <ul className="space-y-3">
            {topMarkets.length === 0 ? <li className="py-8 text-center text-sm text-muted-foreground">No market data yet.</li> : topMarkets.map((r) => {
              const max = Math.max(...topMarkets.map((m) => m.value), 1);
              const pct = Math.round((r.value / max) * 100);
              return (
              <li key={r.city} className="flex items-center gap-3 text-sm">
                <span className="w-32 truncate font-medium">{r.city}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: "var(--gradient-love)" }}
                  />
                </div>
                <span className="w-16 text-right tabular-nums text-muted-foreground">
                  {r.value.toLocaleString()}
                </span>
              </li>
            )})}
          </ul>
        </Panel>
        <Panel title="Recent Premium Upgrades" subtitle="Last 24 hours">
          <ul className="divide-y divide-border">
            {upgrades.length === 0 ? <li className="py-8 text-center text-sm text-muted-foreground">No premium upgrades yet.</li> : upgrades.map((u) => (
              <li key={u.name} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-9 w-9 place-items-center rounded-full text-sm font-semibold text-white"
                    style={{ background: "var(--gradient-sunset)" }}
                  >
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.plan === "platinum" ? "diamond" : u.plan} · {u.t} ago</div>
                  </div>
                </div>
                <div className="font-display text-base font-semibold">{u.amt}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}



