"use client";

import { useEffect, useState } from "react";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Filter, TrendingUp, Users, Zap } from "lucide-react";
import { api } from "@/lib/api";

type FunnelRow = { label: string; value: number; pct: number; tint: string };

export default function Conversions() {
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [premiumRate, setPremiumRate] = useState(0);
  const [premiumUsers, setPremiumUsers] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.users(), api.salesOverview()])
      .then(([usersRes]) => {
        const users = usersRes.users;
        const total = users.length;
        const premium = users.filter((user) => user.plan !== "free").length;
        const free = total - premium;
        const rate = total ? Number(((premium / total) * 100).toFixed(1)) : 0;
        setPremiumRate(rate);
        setPremiumUsers(premium);
        setFunnel([
          { label: "Registered Users", value: total, pct: total ? 100 : 0, tint: "var(--gradient-sunset)" },
          { label: "Active Free Users", value: free, pct: total ? Number(((free / total) * 100).toFixed(1)) : 0, tint: "var(--gradient-love)" },
          { label: "Paid Subscribers", value: premium, pct: rate, tint: "linear-gradient(135deg, oklch(0.35 0.1 340), oklch(0.22 0.08 340))" },
        ]);
      })
      .catch(() => setError("Failed to load conversion data from backend."));
  }, []);

  return (
    <>
      <PageHeader title="Conversion Analytics" subtitle="Live conversion funnel based on users and subscription plans." />
      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Free to Premium" value={`${premiumRate}%`} delta={0} icon={Users} tint="rose" />
        <Kpi label="Paid Subscribers" value={String(premiumUsers)} delta={0} icon={Zap} tint="coral" />
        <Kpi label="Avg. Time to Convert" value="-" delta={0} icon={TrendingUp} tint="gold" />
        <Kpi label="Users Dropped Off" value="-" delta={0} icon={Filter} tint="plum" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Subscription Funnel" subtitle="From registered user to paying member" className="lg:col-span-2">
          <div className="space-y-4">
            {funnel.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No conversion data yet.</div> : funnel.map((f, i) => (
              <div key={f.label}>
                <div className="mb-1.5 flex items-baseline justify-between text-sm">
                  <span className="font-medium">{i + 1}. {f.label}</span>
                  <span className="font-display font-semibold">
                    {f.value.toLocaleString()} <span className="ml-2 text-xs text-muted-foreground">{f.pct}%</span>
                  </span>
                </div>
                <div className="h-9 overflow-hidden rounded-lg bg-secondary">
                  <div className="h-full rounded-lg transition-all" style={{ width: `${f.pct}%`, background: f.tint }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Conversion Highlights">
          <ul className="space-y-4 text-sm">
            <li className="rounded-xl bg-secondary/50 p-4">
              <div className="text-xs uppercase tracking-wide text-brand-rose">Users Converted</div>
              <div className="mt-1 font-display text-lg font-semibold">{premiumUsers} Users</div>
              <div className="text-muted-foreground">Free to premium from live users</div>
            </li>
            <li className="rounded-xl bg-secondary/50 p-4">
              <div className="text-xs uppercase tracking-wide text-brand-rose">Conversion Rate</div>
              <div className="mt-1 font-display text-lg font-semibold">{premiumRate}%</div>
              <div className="text-muted-foreground">Premium users divided by total users</div>
            </li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
