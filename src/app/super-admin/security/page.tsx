'use client';

import { useEffect, useState } from "react";
import { LogIn, ShieldAlert, Activity, Ban } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/admin/PageHeader";
import { api } from "@/lib/api";

type LoginRow = { d: string; success: number; failed: number };
type ViewMode = "line" | "area";

export default function SecurityPage() {
 const [logins, setLogins] = useState<LoginRow[]>([]);
 const [blockedAccounts, setBlockedAccounts] = useState(0);
 const [loading, setLoading] = useState(true);
 const [viewMode] = useState<ViewMode>("line");
 const [showFailed, setShowFailed] = useState(true);
 const [showSuccess, setShowSuccess] = useState(true);
 const [error, setError] = useState("");

 const fetchData = async () => {
 setLoading(true);
 setError("");
 try {
 const res = await api.security();
 setLogins(res.loginActivity.map((row) => ({ d: row.day, success: row.success, failed: row.failed })));
 setBlockedAccounts(res.blockedAccounts);
 } catch {
 setError("Backend data unavailable.");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchData(); }, []);

 const totalFailed = logins.reduce((s, r) => s + r.failed, 0);
 const totalSuccess = logins.reduce((s, r) => s + r.success, 0);
 const avgSessions = logins.length ? Math.round(totalSuccess / logins.length) : 0;

 return (
 <div>
 <PageHeader title="Security" description="Login activity and account safety.">
 </PageHeader>

 {error && (
 <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 text-sm">{error}</div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 <StatCard label="Login Attempts" value={loading ? "..." : totalSuccess.toLocaleString()} icon={LogIn} tone="pink" valueClassName="text-xl" />
 <StatCard label="Failed Logins" value={loading ? "..." : totalFailed.toLocaleString()} icon={ShieldAlert} tone="amber" valueClassName="text-xl" />
 <StatCard label="Active Sessions" value={loading ? "..." : avgSessions.toLocaleString()} icon={Activity} tone="blue" valueClassName="text-xl" />
 <StatCard label="Blocked Accounts" value={loading ? "..." : blockedAccounts.toLocaleString()} icon={Ban} tone="violet" valueClassName="text-xl" />
 </div>

 <div className="rounded-2xl bg-card border border-border p-6 shadow-sm">
 <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
 <h2 className="font-semibold">Login Activity - Weekly</h2>
 <div className="flex items-center gap-3 text-xs">
 <button
 onClick={() => setShowSuccess((v) => !v)}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${showSuccess ? "border-blue-300 bg-blue-50 text-blue-700" : "border-border text-muted-foreground"}`}
 >
 <span className="h-2 w-2 rounded-full bg-blue-500" /> Successful
 </button>
 <button
 onClick={() => setShowFailed((v) => !v)}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all ${showFailed ? "border-rose-300 bg-rose-50 text-rose-700" : "border-border text-muted-foreground"}`}
 >
 <span className="h-2 w-2 rounded-full bg-rose-400" /> Failed
 </button>
 </div>
 </div>
 <div className="h-[350px]">
 {loading ? (
 <div className="h-full flex items-center justify-center">
 <div className="animate-pulse text-muted-foreground text-sm">Loading chart...</div>
 </div>
 ) : logins.length === 0 ? (
 <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No login activity yet.</div>
 ) : (
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={logins}>
 <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.03 330)" />
 <XAxis dataKey="d" stroke="oklch(0.45 0.05 280)" fontSize={12} />
 <YAxis stroke="oklch(0.45 0.05 280)" fontSize={12} />
 <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.92 0.03 330)", borderRadius: 12 }} />
 <Legend />
 {showSuccess && (
 <Line type="monotone" dataKey="success" name="Successful" stroke="oklch(0.6 0.2 250)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
 )}
 {showFailed && (
 <Line type="monotone" dataKey="failed" name="Failed" stroke="oklch(0.7 0.22 350)" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
 )}
 </LineChart>
 </ResponsiveContainer>
 )}
 </div>
 </div>
 </div>
 );
}
