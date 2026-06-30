"use client";


import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/finance/StatCard";
import { api } from "@/lib/api";
import { Plus, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
export default function Subscriptions() {
 const [plans, setPlans] = useState<any[]>([]);
 const loadPlans = () => {
 api.payments()
 .then((data) => setPlans(data.plans || []))
 .catch(() => setPlans([]));
 };
 useEffect(() => {
 loadPlans();
 }, []);

 const createPlan = async () => {
 const displayName = window.prompt("Plan name");
 if (!displayName?.trim()) return;
 const price = Number(window.prompt("Monthly price", "0"));
 if (!Number.isFinite(price)) return;
 await api.createPlan({ displayName: displayName.trim(), price, features: [] });
 loadPlans();
 };

 const editPlan = async (plan: any) => {
 const displayName = window.prompt("Plan name", plan.name);
 if (!displayName?.trim()) return;
 const price = Number(window.prompt("Monthly price", String(plan.rawPrice ?? String(plan.price).replace(/[^0-9.]/g, ""))));
 if (!Number.isFinite(price)) return;
 await api.updatePlan(plan.id, { displayName: displayName.trim(), price, features: plan.features || [], status: plan.status });
 loadPlans();
 };
 const totalSubs = plans.reduce((s, p) => s + p.subscribers, 0);
 const expiring = plans.filter((p) => p.status === "inactive").reduce((s, p) => s + p.subscribers, 0);

 return (
 <DashboardLayout title="Subscription Management" subtitle="All plans, pricing, features, and active subscribers.">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 <div className="rounded-2xl bg-card border border-border p-5">
 <div className="text-sm text-muted-foreground">Active Subscribers</div>
 <div className="mt-2 text-2xl font-semibold">{totalSubs.toLocaleString()}</div>
 </div>
 <div className="rounded-2xl bg-card border border-border p-5">
 <div className="text-sm text-muted-foreground">Expiring Subscriptions</div>
 <div className="mt-2 text-2xl font-semibold">{expiring.toLocaleString()}</div>
 </div>
 <div className="rounded-2xl bg-card border border-border p-5">
 <div className="text-sm text-muted-foreground">Total Plans</div>
 <div className="mt-2 text-2xl font-semibold">{plans.length}</div>
 </div>
 </div>

 <div className="flex items-center justify-between mb-4">
 <h3 className="font-semibold">All Subscription Plans</h3>
 <button onClick={createPlan} className="inline-flex items-center gap-2 h-[40px] px-4 rounded-lg text-primary-foreground text-sm font-medium" style={{ background: "var(--gradient-rose)" }}>
 <Plus className="size-4" /> Create Plan
 </button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
 {plans.map((p) => (
 <div key={p.id} className="rounded-2xl bg-card border border-border p-6 flex flex-col">
 <div className="flex items-start justify-between">
 <div>
 <div className="text-xs text-muted-foreground">{p.id}</div>
 <h4 className="text-xl font-semibold mt-1">{p.name}</h4>
 </div>
 <StatusBadge status={p.status} />
 </div>
 <div className="mt-4">
 <span className="text-3xl font-semibold">{p.price}</span>
 <span className="text-muted-foreground text-sm"> / {p.period}</span>
 </div>
 <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground flex-1">
 {(p.features || []).map((f: string) => <li key={f}>• {f}</li>)}
 </ul>
 <div className="mt-5 flex items-center justify-between text-sm">
 <span className="text-muted-foreground">{p.subscribers.toLocaleString()} subscribers</span>
 <button onClick={() => editPlan(p)} className="inline-flex items-center gap-1.5 text-primary hover:underline">
 <Pencil className="size-3.5" /> Edit
 </button>
 </div>
 </div>
 ))}
 </div>
 </DashboardLayout>
 );
}
