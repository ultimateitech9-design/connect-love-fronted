"use client";

import { useEffect, useState } from "react";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Crown, Gem, Sparkles, Trophy } from "lucide-react";
import { api } from "@/lib/api";

type Plan = { id: string; name: string; price: number; subscribers: number; status: string; features: string[] };

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.salesPlans()
      .then((res) => setPlans(res.plans))
      .catch(() => setError("Failed to load plans from backend."));
  }, []);

  const mostPurchased = plans.reduce<Plan | null>((best, plan) => !best || plan.subscribers > best.subscribers ? plan : best, null);

  return (
    <>
      <PageHeader title="Plan Performance" subtitle="Live subscription plans and subscriber counts." />
      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total Plans" value={String(plans.length)} delta={0} icon={Sparkles} tint="coral" />
        <Kpi label="Active Plans" value={String(plans.filter((p) => p.status === "active").length)} delta={0} icon={Crown} tint="gold" />
        <Kpi label="Subscribers" value={String(plans.reduce((sum, p) => sum + p.subscribers, 0))} delta={0} icon={Gem} tint="plum" />
        <Kpi label="Most Purchased" value={mostPurchased?.name || "-"} icon={Trophy} tint="rose" />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {plans.length === 0 ? (
          <Panel title="Plans"><div className="py-10 text-center text-sm text-muted-foreground">No subscription plans found.</div></Panel>
        ) : plans.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: "var(--gradient-love)" }}>
              {p.name}
            </div>
            <div className="mt-4 font-display text-4xl font-bold">${p.price}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
            <div className="mt-2 text-sm text-muted-foreground">{p.subscribers} subscribers</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {(p.features || []).map((perk) => <li key={perk}>- {perk}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
