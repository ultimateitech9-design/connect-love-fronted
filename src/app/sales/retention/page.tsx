"use client";

import { useEffect, useState } from "react";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Repeat, Users, TrendingUp, Filter } from "lucide-react";
import { api } from "@/lib/api";

export default function RetentionPage() {
 const [data, setData] = useState<Awaited<ReturnType<typeof api.salesRetention>> | null>(null);
 const [error, setError] = useState("");
 useEffect(() => { api.salesRetention().then(setData).catch(() => setError("Failed to load retention data from backend.")); }, []);
 const totalUsers = data?.totalUsers || 0;
 const premiumUsers = data?.premiumUsers || 0;
 const activePremium = data?.activePremium || 0;
 const rate = totalUsers ? Number(((premiumUsers / totalUsers) * 100).toFixed(1)) : 0;
 const tones: Record<string, string> = { free: "bg-slate-100 text-slate-700", gold: "bg-amber-100 text-amber-700", platinum: "bg-violet-100 text-violet-700" };
 return <><PageHeader title="Retention" subtitle="Live membership data from the database." />{error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Kpi label="Total Users" value={String(totalUsers)} icon={Users} tint="rose" /><Kpi label="Premium Users" value={String(premiumUsers)} icon={Repeat} tint="gold" /><Kpi label="Premium Share" value={`${rate}%`} icon={TrendingUp} tint="coral" /><Kpi label="Active Premium" value={String(activePremium)} icon={Filter} tint="plum" /></div><div className="mt-6"><Panel title="Retention Data" subtitle="Live membership health grouped by subscription plan"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="px-3 py-3 font-semibold">Plan</th><th className="px-3 py-3 text-center font-semibold">Total Users</th><th className="px-3 py-3 text-center font-semibold">Active</th><th className="px-3 py-3 text-center font-semibold">Verified</th><th className="px-3 py-3 text-right font-semibold">User Share</th></tr></thead><tbody>{(data?.plans || []).map((plan) => <tr key={plan.key} className="border-b border-border last:border-0 hover:bg-muted/40"><td className="px-3 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${tones[plan.key] || tones.free}`}>{plan.label}</span></td><td className="px-3 py-4 text-center font-semibold text-foreground">{plan.total}</td><td className="px-3 py-4 text-center text-emerald-600">{plan.active}</td><td className="px-3 py-4 text-center text-blue-600">{plan.verified}</td><td className="px-3 py-4 text-right font-semibold text-foreground">{totalUsers ? ((plan.total / totalUsers) * 100).toFixed(1) : "0.0"}%</td></tr>)}</tbody></table></div></Panel></div></>;
}