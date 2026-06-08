"use client";
"use client";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { CreditCard, Crown, Repeat, Sparkles } from "lucide-react";
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


const revenueData = [
  { day: "Mon", revenue: 12400, signups: 320 },
  { day: "Tue", revenue: 15200, signups: 410 },
  { day: "Wed", revenue: 13800, signups: 380 },
  { day: "Thu", revenue: 17600, signups: 460 },
  { day: "Fri", revenue: 21900, signups: 590 },
  { day: "Sat", revenue: 28400, signups: 720 },
  { day: "Sun", revenue: 25100, signups: 640 },
];

const planSplit = [
  { name: "Basic", value: 38 },
  { name: "Gold", value: 42 },
  { name: "Platinum", value: 20 },
];

const COLORS = ["oklch(0.85 0.18 30)", "oklch(0.75 0.22 0)", "oklch(0.65 0.15 340)"];

export default function Overview() {
  return (
    <>
      <PageHeader
        title="Sales Overview"
        subtitle="A live pulse of subscriptions, premium upgrades, and the love-driven revenue powering connectLove."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total Subscriptions" value="48,219" delta={12.4} icon={CreditCard} tint="rose" />
        <Kpi label="New Premium Users" value="3,842" delta={8.1} icon={Crown} tint="gold" />
        <Kpi label="Renewal Rate" value="78.6%" delta={2.3} icon={Repeat} tint="coral" />
        <Kpi label="Conversion Rate" value="14.2%" delta={-1.1} icon={Sparkles} tint="plum" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          title="Revenue This Week"
          subtitle="Daily subscription revenue (USD)"
          className="xl:col-span-2"
        >
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={revenueData}>
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
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Plan Mix" subtitle="Share of active subscriptions">
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={planSplit}
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {planSplit.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Panel title="Top Markets" subtitle="Subscriptions by city">
          <ul className="space-y-3">
            {[
              { city: "Mumbai, IN", value: 6420, pct: 92 },
              { city: "New York, US", value: 5810, pct: 84 },
              { city: "London, UK", value: 4320, pct: 64 },
              { city: "Dubai, AE", value: 3110, pct: 48 },
              { city: "Bangalore, IN", value: 2880, pct: 42 },
            ].map((r) => (
              <li key={r.city} className="flex items-center gap-3 text-sm">
                <span className="w-32 truncate font-medium">{r.city}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${r.pct}%`, background: "var(--gradient-love)" }}
                  />
                </div>
                <span className="w-16 text-right tabular-nums text-muted-foreground">
                  {r.value.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recent Premium Upgrades" subtitle="Last 24 hours">
          <ul className="divide-y divide-border">
            {[
              { name: "Aarav S.", plan: "Platinum", amt: "$49.99", t: "2m" },
              { name: "Sofia R.", plan: "Gold", amt: "$19.99", t: "8m" },
              { name: "Liam K.", plan: "Gold", amt: "$19.99", t: "15m" },
              { name: "Priya M.", plan: "Platinum", amt: "$49.99", t: "31m" },
              { name: "Noah J.", plan: "Basic", amt: "$9.99", t: "47m" },
            ].map((u) => (
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
                    <div className="text-xs text-muted-foreground">{u.plan} · {u.t} ago</div>
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



