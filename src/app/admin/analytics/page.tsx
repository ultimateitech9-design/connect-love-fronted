"use client";

import { useEffect, useState } from "react";
import {
 ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
 BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { getToken } from "@/lib/auth";

const COLORS = ["var(--brand)", "#60a5fa", "#34d399"];
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

export default function AnalyticsPage() {
 const [analytics, setAnalytics] = useState({ genderRatio: [], geo: [], revenueMonthly: [] });
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const token = getToken();
 if (!token) {
 setLoading(false);
 return;
 }
 fetch(`${API}/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } })
 .then((res) => res.ok ? res.json() : null)
 .then((data) => {
 if (data) setAnalytics(data);
 })
 .finally(() => setLoading(false));
 }, []);

 if (loading) {
 return <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading analytics from database...</div>;
 }

 return (
 <div className="space-y-6">
 <header>
 <h1 className="text-2xl font-semibold">Analytics</h1>
 <p className="text-sm text-muted-foreground">Gender ratio, geographic distribution, and revenue insight.</p>
 </header>

 <div className="grid gap-6 lg:grid-cols-2">
 <div className="rounded-2xl border border-border bg-card p-5">
 <h3 className="text-base font-semibold">Gender ratio</h3>
 <div className="mt-4 h-[20vw]">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={analytics.genderRatio} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
 {analytics.genderRatio.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
 </Pie>
 <Tooltip />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>

 <div className="rounded-2xl border border-border bg-card p-5">
 <h3 className="text-base font-semibold">Geographic insights</h3>
 <div className="mt-4 h-[20vw]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={analytics.geo}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
 <XAxis dataKey="city" stroke="var(--muted-foreground)" fontSize={12} />
 <YAxis stroke="var(--muted-foreground)" fontSize={12} />
 <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
 <Bar dataKey="users" fill="var(--brand)" radius={[8, 8, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 <div className="rounded-2xl border border-border bg-card p-5">
 <h3 className="text-base font-semibold">Revenue (last 5 months)</h3>
 <div className="mt-4 h-[20vw]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={analytics.revenueMonthly}>
 <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
 <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
 <YAxis stroke="var(--muted-foreground)" fontSize={12} />
 <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
 <Bar dataKey="rev" fill="var(--brand)" radius={[8, 8, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 );
}
