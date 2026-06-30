"use client";

import { useEffect, useState } from "react";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Crown, Gem, Sparkles, Trophy } from "lucide-react";
import { api } from "@/lib/api";

type Plan = { id: string; key?: string; name: string; price: number; currency?: string; subscribers: number; status: string; features: string[] };

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
};

const canonicalPlans: Record<string, Pick<Plan, "name" | "price" | "currency" | "features">> = {
  free: {
    name: "Basic Plan",
    price: 0,
    currency: "INR",
    features: ["20 Likes per day", "Basic Matching", "Chat after Match", "View Basic Profile"],
  },
  "basic access": {
    name: "Basic Plan",
    price: 0,
    currency: "INR",
    features: ["20 Likes per day", "Basic Matching", "Chat after Match", "View Basic Profile"],
  },
  gold: {
    name: "Premium Plan",
    price: 199,
    currency: "INR",
    features: ["Unlimited Likes", "See Who Liked You", "5 Super Likes per day", "Profile Boost (1 per week)", "No Ads", "Priority Matching"],
  },
  "premium match": {
    name: "Premium Plan",
    price: 199,
    currency: "INR",
    features: ["Unlimited Likes", "See Who Liked You", "5 Super Likes per day", "Profile Boost (1 per week)", "No Ads", "Priority Matching"],
  },
  platinum: {
    name: "Elite Plan",
    price: 399,
    currency: "INR",
    features: ["Unlimited Likes", "See Who Liked You", "Unlimited Super Likes", "Unlimited Profile Boost", "Priority Matching", "Advanced Filters", "Top Search Ranking", "Premium Badge", "No Ads"],
  },
  ultimate: {
    name: "Elite Plan",
    price: 399,
    currency: "INR",
    features: ["Unlimited Likes", "See Who Liked You", "Unlimited Super Likes", "Unlimited Profile Boost", "Priority Matching", "Advanced Filters", "Top Search Ranking", "Premium Badge", "No Ads"],
  },
};

function formatPrice(price: number, currency = "INR") {
  const symbol = currencySymbols[currency.toUpperCase()] || currency;
  return `${symbol}${price.toLocaleString("en-IN", { maximumFractionDigits: price % 1 === 0 ? 0 : 2 })}`;
}

function normalizePlan(plan: Plan): Plan {
  const canonical = canonicalPlans[(plan.key || "").toLowerCase()] || canonicalPlans[plan.name.toLowerCase()];
  return canonical ? { ...plan, ...canonical } : plan;
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.salesPlans()
      .then((res) => setPlans(res.plans.map(normalizePlan)))
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
            <div className="mt-4 font-display text-4xl font-bold">{formatPrice(p.price, p.currency)}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
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
