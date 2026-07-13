"use client";
import { API_ORIGIN } from "@/config/runtime";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StatCard } from "@/features/admin/StatCard";
import { Users, DollarSign, Crown, Flag } from "lucide-react";
import { getManagementToken } from "@/lib/auth";

// Dynamically import chart to improve performance and prevent hydration errors
const RevenueChart = dynamic(() => import("@/features/admin/AdminRevenueChart"), { 
 ssr: false,
 loading: () => <div className="w-full h-full flex items-center justify-center text-slate-400">Loading chart...</div>
});

const API = API_ORIGIN;
const demoRevenueMonthly = [
 { m: "Mar", rev: 6200 },
 { m: "Apr", rev: 8400 },
 { m: "May", rev: 7800 },
 { m: "Jun", rev: 11200 },
 { m: "Jul", rev: 13600 },
];

export default function AdminOverview() {
 const reportStatusClass = (status?: string) => {
 const normalized = String(status || "").toLowerCase();
 if (normalized === "closed" || normalized === "resolved") return "bg-rose-50 text-rose-600 ring-1 ring-rose-100";
 if (normalized === "newsletter") return "bg-slate-50 text-slate-500 ring-1 ring-slate-100";
 if (normalized === "open") return "bg-amber-50 text-amber-700 ring-1 ring-amber-100";
 return "bg-sky-50 text-sky-700 ring-1 ring-sky-100";
 };

 const [stats, setStats] = useState({
 users: 0,
 premium: 0,
 revenueMtd: 0,
 reportsOpen: 0,
 });
 
 const [recentUsers, setRecentUsers] = useState<any[]>([]);
 const [recentReports, setRecentReports] = useState<any[]>([]);
 const [revenueMonthly, setRevenueMonthly] = useState<any[]>([]);
 const chartData = revenueMonthly.length > 0 ? revenueMonthly : demoRevenueMonthly;

 useEffect(() => {
 const fetchAdminData = async () => {
 const token = getManagementToken();
 if (!token) return;

 const headers = { Authorization: `Bearer ${token}` };

 try {
 // Fetch stats
 const statsRes = await fetch(`${API}/admin/stats`, { headers });
 if (statsRes.ok) {
 const statsData = await statsRes.json();
 setStats(prev => ({
 ...prev,
 users: statsData.totalUsers || prev.users,
 premium: statsData.premiumUsers || prev.premium,
 revenueMtd: statsData.revenueMtd || prev.revenueMtd,
 reportsOpen: statsData.openTickets || prev.reportsOpen,
 }));
 }

 // Fetch recent users
 const usersRes = await fetch(`${API}/admin/users?limit=5`, { headers });
 if (usersRes.ok) {
 const usersData = await usersRes.json();
 if (usersData.users && usersData.users.length > 0) {
 const mappedUsers = usersData.users.map((u: any) => ({
 id: u.id.toString(),
 name: u.name,
 email: u.email,
 plan: u.plan === 'free' ? 'Free' : 'Premium',
 joined: new Date(u.createdAt).toISOString().split('T')[0],
 status: u.status,
 }));
 
 setRecentUsers(mappedUsers.slice(0, 5));
 }
 }
 
 // Contacts/Reports
 const contactsRes = await fetch(`${API}/admin/contacts`, { headers });
 if (contactsRes.ok) {
 const contactsData = await contactsRes.json();
 if (contactsData && contactsData.length > 0) {
 const mappedReports = contactsData.map((c: any) => ({
 id: c.id.toString(),
 reportedUser: c.email,
 reason: c.subject || c.message.substring(0, 20) + '...',
 status: c.status,
 }));
 setRecentReports(mappedReports.slice(0, 5));
 }
 }

 const analyticsRes = await fetch(`${API}/admin/analytics`, { headers });
 if (analyticsRes.ok) {
 const analyticsData = await analyticsRes.json();
 setRevenueMonthly(analyticsData.revenueMonthly || []);
 }
 } catch (err) {
 console.error("Failed to fetch admin data", err);
 }
 };

 fetchAdminData();
 }, []);

 return (
 <div className="space-y-5 pb-8 sm:space-y-8 sm:pb-12">
 <header>
 <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">Overview</h1>
 <p className="text-sm font-medium text-slate-500 mt-1">Platform health at a glance.</p>
 </header>

 <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
 <StatCard label="Total users" value={stats.users.toLocaleString()} delta="+4.2% this month" tone="positive" icon={Users} />
 <StatCard label="Premium subscribers" value={stats.premium.toLocaleString()} delta="+118 this week" tone="positive" icon={Crown} />
 <StatCard label="Revenue (MTD)" value={`$${stats.revenueMtd.toLocaleString()}`} delta="+11.6% vs last month" tone="positive" icon={DollarSign} />
 <StatCard label="Open reports" value={String(stats.reportsOpen)} delta="3 awaiting action" tone="negative" icon={Flag} />
 </div>

 <div className="grid gap-6 lg:grid-cols-3">
 <div className="rounded-2xl bg-white/60 p-4 shadow-xl shadow-rose-500/5 ring-1 ring-white/50 sm:rounded-3xl sm:p-6 lg:col-span-2">
 <div className="flex items-start justify-between gap-3">
 <div>
 <h3 className="text-lg font-bold text-slate-900">Revenue trend</h3>
 <p className="text-xs font-medium text-slate-500">Last 5 months</p>
 </div>
 {revenueMonthly.length === 0 && (
 <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 ring-1 ring-rose-100">Demo</span>
 )}
 </div>
 <div className="mt-4 h-[220px] min-h-[200px] sm:h-[260px]">
 <RevenueChart data={chartData} />
 </div>
 </div>

 <div className="rounded-2xl bg-white/60 p-4 shadow-xl shadow-rose-500/5 ring-1 ring-white/50 sm:rounded-3xl sm:p-6">
 <h3 className="text-lg font-bold text-slate-900">Recent reports</h3>
 <ul className="mt-6 space-y-4 text-sm">
 {recentReports.map((r) => (
 <li key={r.id} className="flex items-start justify-between gap-3 group">
 <div className="min-w-0 flex-1">
 <p className="truncate font-semibold text-slate-900">{r.reportedUser}</p>
 <p className="mt-0.5 break-words text-xs font-medium leading-4 text-slate-500">{r.reason}</p>
 </div>
 <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm transition-colors ${reportStatusClass(r.status)}`}>{r.status}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>

 <div className="rounded-2xl bg-white/60 p-4 shadow-xl shadow-rose-500/5 ring-1 ring-white/50 sm:rounded-3xl sm:p-6">
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-lg font-bold text-slate-900">Recently joined</h3>
 <span className="text-xs font-bold text-slate-500 bg-white shadow-sm px-3 py-1.5 rounded-full">{recentUsers.length} users</span>
 </div>
 <div className="overflow-x-auto rounded-2xl bg-white/50">
 <table className="w-full min-w-[680px] text-sm text-slate-600">
 <thead className="text-left text-xs font-bold uppercase tracking-wider text-slate-400">
 <tr>
 <th className="px-6 py-4">User</th><th className="px-6 py-4">Plan</th>
 <th className="px-6 py-4">Joined</th><th className="px-6 py-4 text-right">Status</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100/50">
 {recentUsers.map((u) => (
 <tr key={u.id} className="hover:bg-white/80 transition-colors">
 <td className="px-6 py-4">
 <span className="font-bold text-slate-900">{u.name}</span>
 <div className="text-xs font-medium text-slate-500 mt-0.5">{u.email}</div>
 </td>
 <td className="px-6 py-4">
 <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${u.plan === 'Premium' ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-500/20' : 'bg-slate-100 text-slate-600'}`}>
 {u.plan}
 </span>
 </td>
 <td className="px-6 py-4 font-medium text-slate-500">{u.joined}</td>
 <td className="px-6 py-4 text-right">
 <span className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
 {u.status}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
