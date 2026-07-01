'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Users, Heart, DollarSign, Flag, UserCheck, Activity, Shield } from "lucide-react";
import { api } from "@/lib/api";

const activityModuleColor: Record<string, string> = {
 "Verification": "text-emerald-600 bg-emerald-50",
 "User Management": "text-blue-600 bg-blue-50",
 "Notifications": "text-amber-600 bg-amber-50",
 "Roles": "text-fuchsia-600 bg-fuchsia-50",
 "Settings": "text-indigo-600 bg-indigo-50",
 "Payments": "text-violet-600 bg-violet-50",
 "Reports": "text-rose-600 bg-rose-50",
};

const iconMap: Record<string, any> = {
 "Total Users": Users,
 "Active Users": UserCheck,
 "Matches Done": Heart,
 "Total Revenue": DollarSign,
 "Pending Reports": Flag,
 "Premium Users": UserCheck,
};
const toneMap: Record<string, "pink" | "blue" | "violet" | "amber"> = {
 "Total Users": "pink",
 "Active Users": "blue",
 "Matches Done": "pink",
 "Total Revenue": "violet",
 "Pending Reports": "amber",
 "Premium Users": "blue",
};
const ACTIVITY_PER_PAGE = 5;

export default function HomePage() {
 const router = useRouter();
 const [stats, setStats] = useState<{ label: string; value: string; delta: string }[]>([]);
 const [growth, setGrowth] = useState<{ m: string; users: number; matches: number }[]>([]);
 const [activityLog, setActivityLog] = useState<{ action: string; time: string; module: string }[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
 const [activityPage, setActivityPage] = useState(1);

 const handleCardClick = (label: string) => {
   switch (label) {
     case "Total Users":
     case "Active Users":
     case "Premium Users":
       router.push("/super-admin/users");
       break;
     case "Total Revenue":
       router.push("/super-admin/payments");
       break;
     case "Pending Reports":
       router.push("/super-admin/reports");
       break;
     default:
       router.push("/super-admin");
       break;
   }
 };

 const fetchStats = async () => {
 setLoading(true);
 setError("");
 try {
 const data = await api.dashboard();
 setStats(data.stats);
 setGrowth(data.growth || []);
 const logs = await api.logs();
 setActivityLog(logs.logs.map((log) => ({
 action: log.activity,
 time: log.createdAt ? new Date(log.createdAt).toLocaleString() : log.action,
 module: log.module || log.user,
 })));
 setLastRefresh(new Date());
 } catch {
 setError("Failed to load data from backend. Is the backend server running?");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchStats(); }, []);

 const activityPageCount = Math.max(1, Math.ceil(activityLog.length / ACTIVITY_PER_PAGE));
 const activityStartIndex = (activityPage - 1) * ACTIVITY_PER_PAGE;
 const visibleActivity = activityLog.slice(activityStartIndex, activityStartIndex + ACTIVITY_PER_PAGE);

 useEffect(() => {
 if (activityPage > activityPageCount) setActivityPage(activityPageCount);
 }, [activityPage, activityPageCount]);

 return (
 <div>
 <PageHeader title="Dashboard Overview" description="Welcome back to ConnectLove Super Admin">

 </PageHeader>

 {error && (
 <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm flex items-center gap-2">
 ⚠️ {error}
 </div>
 )}

 {/* Live stats from backend */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-4 mb-6">
 {loading
 ? Array.from({ length: 6 }).map((_, i) => (
 <div key={i} className="rounded-3xl border border-border bg-card p-5 shadow-card animate-pulse h-28" />
 ))
 : stats.map((s) => (
 <StatCard
 key={s.label}
 label={s.label}
 value={s.value}
 delta={s.delta}
 icon={iconMap[s.label] ?? Users}
 tone={toneMap[s.label] ?? "pink"}
 onClick={() => handleCardClick(s.label)}
 />
 ))}
 </div>

 <div className="flex items-center justify-between mb-4">
 <span className="text-xs text-muted-foreground">
 Last updated: {lastRefresh ? lastRefresh.toLocaleTimeString() : "..."}
 </span>
 </div>

 {/* Access Summary */}
 <div className="rounded-2xl bg-gradient-to-br from-primary/8 via-secondary/5 to-primary/8 border border-primary/20 p-5 mb-6">
 <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
 <Shield className="h-5 w-5 text-primary" /> My Access Summary
 </h3>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
 {[
 { label: "Modules", value: "10", color: "text-primary" },
 { label: "Permissions", value: "32", color: "text-secondary" },
 { label: "Access Level", value: "100%", color: "text-emerald-600" },
 { label: "Active Sessions", value: "2", color: "text-primary" },
 ].map((item) => (
 <div key={item.label} className="rounded-xl bg-card border border-border p-4 text-center shadow-sm hover:shadow-md transition-shadow">
 <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
 <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">{item.label}</p>
 </div>
 ))}
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
 <div className="rounded-2xl bg-card border border-border p-6 shadow-card">
 <div className="flex items-center justify-between mb-4">
 <div>
 <h2 className="font-semibold text-foreground">Growth Overview</h2>
 <p className="text-xs text-muted-foreground">Users and matches over time</p>
 </div>
 <div className="flex items-center gap-4 text-xs">
 <span className="flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-primary" /> Users
 </span>
 <span className="flex items-center gap-1.5">
 <span className="h-2 w-2 rounded-full bg-secondary" /> Matches
 </span>
 </div>
 </div>
 <div className="h-[350px]">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={growth}>
 <defs>
 <linearGradient id="gPink" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="oklch(0.7 0.22 350)" stopOpacity={0.6} />
 <stop offset="100%" stopColor="oklch(0.7 0.22 350)" stopOpacity={0} />
 </linearGradient>
 <linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="oklch(0.6 0.2 250)" stopOpacity={0.6} />
 <stop offset="100%" stopColor="oklch(0.6 0.2 250)" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.03 330)" />
 <XAxis dataKey="m" stroke="oklch(0.45 0.05 280)" fontSize={12} />
 <YAxis stroke="oklch(0.45 0.05 280)" fontSize={12} />
 <Tooltip
 contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.03 330)", borderRadius: 12 }}
 />
 <Area type="monotone" dataKey="users" stroke="oklch(0.7 0.22 350)" strokeWidth={2.5} fill="url(#gPink)" />
 <Area type="monotone" dataKey="matches" stroke="oklch(0.6 0.2 250)" strokeWidth={2.5} fill="url(#gBlue)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Recent Activity */}
 <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden flex flex-col">
 <div className="px-6 py-4 border-b border-border flex items-center gap-2 shrink-0">
 <Activity className="h-4.5 w-4.5 text-primary" />
 <h2 className="font-semibold text-foreground">Recent Activity</h2>
 </div>
 <div className="divide-y divide-border flex-1">
 {visibleActivity.map((entry, i) => {
 const tagColor = activityModuleColor[entry.module] ?? "text-muted-foreground bg-muted";
 return (
 <div key={`${entry.time}-${entry.action}-${activityStartIndex + i}`} className="px-6 py-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
 <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
 <Shield className="h-4.5 w-4.5 text-primary" />
 </div>
 <div className="flex-1 min-w-[0px]">
 <p className="text-sm font-medium text-foreground truncate">{entry.action}</p>
 <p className="text-xs text-muted-foreground">{entry.time}</p>
 </div>
 <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${tagColor}`}>
 {entry.module}
 </span>
 </div>
 );
 })}
 </div>
 <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
 <span>
 {activityLog.length === 0 ? "No activity" : `${activityStartIndex + 1}-${Math.min(activityStartIndex + ACTIVITY_PER_PAGE, activityLog.length)} of ${activityLog.length}`}
 </span>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setActivityPage((value) => Math.max(1, value - 1))}
 disabled={activityPage === 1}
 className="rounded-md border border-border px-2.5 py-1 font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
 >
 Prev
 </button>
 <span className="font-semibold text-foreground">{activityPage}/{activityPageCount}</span>
 <button
 type="button"
 onClick={() => setActivityPage((value) => Math.min(activityPageCount, value + 1))}
 disabled={activityPage === activityPageCount}
 className="rounded-md border border-border px-2.5 py-1 font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
 >
 Next
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
