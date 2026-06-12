'use client';

import { useEffect, useState } from "react";
import { Flag, Clock, CheckCircle2, AlertOctagon, } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { api } from "@/lib/api";

const COLORS = [
 "oklch(0.65 0.22 12)",
 "oklch(0.6 0.2 250)",
 "oklch(0.65 0.18 300)",
 "oklch(0.7 0.16 45)",
 "oklch(0.6 0.15 145)",
];

export default function ReportsPage() {
 const [data, setData] = useState<{ type: string; count: number }[]>([]);
 const [loading, setLoading] = useState(true);
 const [activeBar, setActiveBar] = useState<string | null>(null);
 const [error, setError] = useState("");

 const fetchData = async () => {
 setLoading(true);
 setError("");
 try {
 const res = await api.reports();
 setData(res.reports);
 } catch {
 setError("Failed to load reports from backend. Is the backend server running?");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchData(); }, []);

 const total = data.reduce((s, d) => s + d.count, 0);
 const pending = data.find((d) => d.type === "Fake")?.count ?? 142;

 return (
 <div>
 <PageHeader title="Reports" description="Moderation queue and analytics.">
 
 </PageHeader>

 {error && (
 <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">⚠️ {error}</div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 <StatCard label="Total Reports" value={loading ? "..." : String(total)} icon={Flag} tone="pink" />
 <StatCard label="Pending" value={loading ? "..." : String(pending)} icon={Clock} tone="amber" />
 <StatCard label="Resolved" value="2,612" icon={CheckCircle2} tone="blue" />
 <StatCard label="High Priority" value="87" icon={AlertOctagon} tone="violet" />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Chart */}
 <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-sm">
 <div className="flex items-center justify-between mb-4">
 <h2 className="font-semibold">Reports by Category</h2>
 {activeBar && (
 <span className="text-xs text-muted-foreground">
 Selected: <span className="font-semibold text-primary">{activeBar}</span>
 </span>
 )}
 </div>
 <div className="h-[300px]">
 {loading ? (
 <div className="h-full flex items-center justify-center">
 <div className="animate-pulse text-muted-foreground text-sm">Loading chart...</div>
 </div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={data} onClick={(d) => d?.activeLabel && setActiveBar(d.activeLabel)}>
 <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.03 330)" />
 <XAxis dataKey="type" stroke="oklch(0.45 0.05 280)" fontSize={12} />
 <YAxis stroke="oklch(0.45 0.05 280)" fontSize={12} />
 <Tooltip
 contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.03 330)", borderRadius: 12 }}
 cursor={{ fill: "oklch(0.97 0.01 330)" }}
 />
 <Bar dataKey="count" radius={[8, 8, 0, 0]} cursor="pointer">
 {data.map((entry, index) => (
 <Cell
 key={entry.type}
 fill={activeBar === entry.type ? "oklch(0.55 0.21 12)" : COLORS[index % COLORS.length]}
 />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 )}
 </div>
 </div>

 {/* Breakdown list */}
 <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
 <h2 className="font-semibold mb-4">Report Breakdown</h2>
 <div className="space-y-3">
 {loading
 ? Array.from({ length: 5 }).map((_, i) => (
 <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
 ))
 : data.map((item, i) => (
 <button
 key={item.type}
 onClick={() => setActiveBar(item.type === activeBar ? null : item.type)}
 className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all text-left ${
 activeBar === item.type
 ? "border-primary bg-primary/5"
 : "border-border hover:bg-muted/40"
 }`}
 >
 <div className="flex items-center gap-2">
 <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
 <span className="text-sm font-medium">{item.type}</span>
 </div>
 <span className="text-sm font-bold text-foreground">{item.count}</span>
 </button>
 ))}
 </div>
 {!loading && data.length > 0 && (
 <button
 className="mt-4 w-full h-10 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
 >
 Export Report
 </button>
 )}
 </div>
 </div>
 </div>
 );
}
