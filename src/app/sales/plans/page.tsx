"use client";

import { useEffect, useState } from "react";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Check, Crown, Gem, Sparkles, Star, Trophy, X } from "lucide-react";
import { DiamondArtwork, DiamondCrystalFrame, DiamondFacetBackground } from "@/features/home/FeaturesSection";
import { api } from "@/lib/api";

type Plan = { id: string; key?: string; name: string; price: number; currency?: string; subscribers: number; status: string; features: string[] };

const currencySymbols: Record<string, string> = {
  INR: "₹",
  USD: "$",
};

const canonicalPlans: Record<string, Pick<Plan, "name" | "price" | "currency" | "features">> = {
  free: {
    name: "Free",
    price: 0,
    currency: "INR",
    features: ["10 Likes Per Day", "10 Messages Per Match", "2 Free Matches", "Add 2 Images to Profile", "No Video Calling", "No Image Sharing", "No Voice Messages", "No Super Likes", "No Profile Boost", "No Verified Badge", "No Profile Rewind", "No First Impressions"],
  },
  "basic access": {
    name: "Free",
    price: 0,
    currency: "INR",
    features: ["10 Likes Per Day", "10 Messages Per Match", "2 Free Matches", "Add 2 Images to Profile", "No Video Calling", "No Image Sharing", "No Voice Messages", "No Super Likes", "No Profile Boost", "No Verified Badge", "No Profile Rewind", "No First Impressions"],
  },
  gold: {
    name: "Gold",
    price: 299,
    currency: "INR",
    features: ["20 Likes Per Day", "Unlimited Messages", "10 Matches", "Add 5 Images to Profile", "5 Video Calls (1 Hour Each)", "Share 10 Images", "Gold Verification Badge", "Profile Boost: 2 Times Per Month", "5 Super Likes", "2 Profile Rewinds", "5 First Impressions"],
  },
  "premium match": {
    name: "Gold",
    price: 299,
    currency: "INR",
    features: ["20 Likes Per Day", "Unlimited Messages", "10 Matches", "Add 5 Images to Profile", "5 Video Calls (1 Hour Each)", "Share 10 Images", "Gold Verification Badge", "Profile Boost: 2 Times Per Month", "5 Super Likes", "2 Profile Rewinds", "5 First Impressions"],
  },
  platinum: {
    name: "Diamond",
    price: 499,
    currency: "INR",
    features: ["40 Likes Per Day", "Unlimited Messages", "20 Matches", "Add 10 Images to Profile", "10 Video Calls", "Share 20 Images", "Verified Badge", "Profile Boost: 1 Time Per Week", "10 Super Likes", "5 Profile Rewinds", "10 First Impressions"],
  },
  ultimate: {
    name: "Diamond",
    price: 499,
    currency: "INR",
    features: ["40 Likes Per Day", "Unlimited Messages", "20 Matches", "Add 10 Images to Profile", "10 Video Calls", "Share 20 Images", "Verified Badge", "Profile Boost: 1 Time Per Week", "10 Super Likes", "5 Profile Rewinds", "10 First Impressions"],
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

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {plans.length === 0 ? <Panel title="Plans"><div className="py-10 text-center text-sm text-muted-foreground">No subscription plans found.</div></Panel> : plans.map((p) => {
          const tier = p.name.toLowerCase(); const free = tier === "free"; const gold = tier === "gold";
          return <article key={p.id} className={`relative overflow-visible rounded-[28px] p-[3px] ${free ? "bg-gradient-to-br from-stone-200 via-white to-stone-300" : gold ? "bg-gradient-to-br from-[#7a5219] via-[#f5d17e] to-[#76501a]" : "bg-gradient-to-br from-violet-300 via-[#6f48c4] to-violet-200"}`}>
            {gold && <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#a66c22] via-[#f5cf75] to-[#a66c22] px-6 py-2 text-[10px] font-black uppercase tracking-[.16em] text-[#241706] shadow-lg">★ Most Popular ★</div>}
            <div className={`relative flex min-h-[600px] flex-col overflow-hidden rounded-[25px] p-5 ${free ? "bg-white text-slate-900" : gold ? "bg-[radial-gradient(circle_at_85%_0%,#5d461c,#171512_36%,#090909)] text-[#f7e5b2]" : "bg-[radial-gradient(circle_at_82%_8%,#7a59d2,#281653_38%,#130a2e)] text-violet-50"}`}>
              <p className={`text-sm font-black uppercase tracking-[.14em] ${free ? "text-stone-500" : gold ? "text-[#f0c66c]" : "text-violet-100"}`}>{p.name}{!free && <span className="ml-1">{gold ? "◈" : "♦"}</span>}</p>
              <div className="mt-3 flex flex-wrap items-end gap-2">{!free && <span className="mb-0.5 text-lg font-black text-white/55 line-through decoration-2">{"\u20B9"}{gold ? 499 : 999}</span>}<p className={`text-3xl font-black ${free ? "text-slate-900" : gold ? "text-[#f4ca73]" : "text-violet-100"}`}>{formatPrice(p.price, p.currency)}<span className="ml-1 text-xs opacity-70">/1 Month</span></p>{!free && <span className={`mb-0.5 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${gold ? "border-[#b88b3c] text-[#f5d47f]" : "border-violet-300/50 text-violet-100"}`}>Special Offer</span>}</div>
              <div className={`mt-5 flex-1 rounded-2xl border p-4 ${free ? "border-stone-100 bg-white" : gold ? "border-amber-200/20 bg-black/25" : "border-violet-200/20 bg-[#170c38]/55"}`}><ul>{p.features.map((feature) => { const unavailable = feature.startsWith("No "); return <li key={feature} className={`flex min-h-9 items-center gap-2 border-b text-xs last:border-0 ${free ? "border-stone-200 text-slate-600" : gold ? "border-amber-100/10 text-stone-100" : "border-violet-200/10 text-violet-50"}`}><span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${unavailable ? "border-rose-300 text-rose-500" : gold ? "border-amber-400 text-amber-300" : "border-violet-300 text-violet-200"}`}>{unavailable ? <X className="h-2.5 w-2.5" /> : <Check className="h-2.5 w-2.5" />}</span>{feature}</li>; })}</ul></div>
              <button type="button" className={`mt-5 h-11 w-full rounded-full border text-xs font-black ${free ? "border-slate-800 bg-black text-white" : gold ? "border-amber-100 bg-gradient-to-r from-[#ac7025] via-[#f3ce7c] to-[#ac7025] text-[#221504]" : "border-violet-100 bg-gradient-to-r from-[#714ac5] via-[#d1b6ff] to-[#8c67dd] text-[#241243]"}`}>{free ? "Get Started Free" : gold ? "Buy Gold" : "Buy Diamond"}</button>
            </div>
          </article>;
        })}
      </div>    </>
  );
}
