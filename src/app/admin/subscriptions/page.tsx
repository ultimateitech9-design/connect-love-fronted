"use client";
import { API_ORIGIN } from "@/config/runtime";

import { useEffect, useState } from "react";
import { StatCard } from "@/features/admin/StatCard";
import { Crown, Users, TrendingUp } from "lucide-react";
import { getManagementToken } from "@/lib/auth";

const API = API_ORIGIN;

export default function SubscriptionsPage() {
 const [totals, setTotals] = useState({ free: 0, plus: 0, premium: 0 });
 const [users, setUsers] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const token = getManagementToken();
 if (!token) {
 setLoading(false);
 return;
 }
 fetch(`${API}/admin/subscriptions`, { headers: { Authorization: `Bearer ${token}` } })
 .then((res) => res.ok ? res.json() : null)
 .then((data) => {
 if (data) {
 setTotals(data.totals || totals);
 setUsers(data.users || []);
 }
 })
 .finally(() => setLoading(false));
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 return (
 <div className="space-y-6">
 <header>
 <h1 className="text-2xl font-semibold">Subscriptions</h1>
 <p className="text-sm text-muted-foreground">Monitor plan distribution and conversion.</p>
 </header>
 <div className="grid gap-4 md:grid-cols-3">
 <StatCard label="Free users" value={String(totals.free)} icon={Users} />
 <StatCard label="Plus subscribers" value={String(totals.plus)} icon={TrendingUp} />
 <StatCard label="Premium subscribers" value={String(totals.premium)} icon={Crown} />
 </div>
 <div className="overflow-hidden rounded-2xl border border-border bg-card">
 <table className="w-full text-sm">
 <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
 <tr>
 <th className="px-5 py-3">User</th><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Since</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 <tr><td colSpan={3} className="px-5 py-6 text-center text-muted-foreground">Loading subscriptions from database...</td></tr>
 ) : users.length === 0 ? (
 <tr><td colSpan={3} className="px-5 py-6 text-center text-muted-foreground">No paid subscriptions found.</td></tr>
 ) : users.map((u) => (
 <tr key={u.id} className="border-t border-border">
 <td className="px-5 py-3">{u.name}<div className="text-xs text-muted-foreground">{u.email}</div></td>
 <td className="px-5 py-3">{u.plan}</td>
 <td className="px-5 py-3">{new Date(u.joined).toISOString().split("T")[0]}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}
