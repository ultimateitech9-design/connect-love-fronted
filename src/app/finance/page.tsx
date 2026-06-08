"use client";


import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/finance/StatCard";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/finance/StatCard";
import { useEffect, useMemo, useState } from "react";
export default function Overview() {
 const [stats, setStats] = useState<any[]>([]);
 const [revenueSeries, setRevenueSeries] = useState<any[]>([]);
 const [transactions, setTransactions] = useState<any[]>([]);
 useEffect(() => {
 Promise.all([api.dashboard(), api.payments()])
 .then(([dashboard, payments]) => {
 const revenueStat = dashboard.stats.find((s) => s.label === "Total Revenue");
 setStats([
 { label: "Total Revenue", value: revenueStat?.value || "$0", delta: "+0%", positive: true },
 { label: "Transactions", value: String(payments.transactions?.length || 0), delta: "+0%", positive: true },
 { label: "Active Plans", value: String(payments.plans.filter((p) => p.status === "active").length), delta: "+0%", positive: true },
 ]);
 const monthly = (payments.transactions || []).reduce((acc: Record<string, number>, tx) => {
 const month = new Date(tx.date).toLocaleString("en-US", { month: "short" });
 acc[month] = (acc[month] || 0) + tx.amount;
 return acc;
 }, {});
 setRevenueSeries(Object.entries(monthly).map(([m, v]) => ({ m, v })));
 setTransactions(payments.transactions || []);
 })
 .catch(() => {});
 }, []);
 const max = useMemo(() => Math.max(1, ...revenueSeries.map((d) => d.v)), [revenueSeries]);
 return (
 <DashboardLayout title="Finance Overview" subtitle="Track revenue, growth, and recent activity across ConnectLove.">
 <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
 {stats.map((s) => <StatCard key={s.label} {...s} />)}
 </div>

 <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
 <div className="xl:col-span-2 rounded-2xl bg-card border border-border p-6">
 <div className="flex items-center justify-between mb-6">
 <div>
 <h3 className="font-semibold">Revenue Trend</h3>
 <p className="text-sm text-muted-foreground">Monthly revenue, last 12 months</p>
 </div>
 <div className="text-sm text-muted-foreground">2026</div>
 </div>
 <div className="flex items-end gap-3 h-[15.556vw]">
 {revenueSeries.map((d) => (
 <div key={d.m} className="flex-1 flex flex-col items-center gap-2">
 <div
 className="w-full rounded-t-lg"
 style={{
 height: `${(d.v / max) * 100}%`,
 background: "var(--gradient-rose)",
 }}
 />
 <span className="text-xs text-muted-foreground">{d.m}</span>
 </div>
 ))}
 </div>
 </div>

 <div className="rounded-2xl bg-card border border-border p-6">
 <h3 className="font-semibold mb-4">Recent Transactions</h3>
 <ul className="space-y-3">
 {transactions.slice(0, 6).map((t) => (
 <li key={t.id} className="flex items-center justify-between text-sm">
 <div>
 <div className="font-medium">{t.user}</div>
 <div className="text-xs text-muted-foreground">{t.id}</div>
 </div>
 <div className="text-right">
 <div className="font-medium">${t.amount.toFixed(2)}</div>
 <StatusBadge status={t.status.replace(/\b\w/g, (c: string) => c.toUpperCase())} />
 </div>
 </li>
 ))}
 </ul>
 </div>
 </div>
 </DashboardLayout>
 );
}
