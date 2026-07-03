"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BadgeCheck, AlertCircle, RefreshCw, Plus, X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getManagementToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
const USERS_PER_PAGE = 10;

type AdminUser = {
 id: string;
 name: string;
 email: string;
 joined: string;
 status: "active" | "suspended" | "banned";
 verified: boolean;
 plan: "Free" | "Plus" | "Premium";
 role: DashboardRole | "user";
};

type CreatableRole = "marketing" | "finance" | "sales" | "support";
type DashboardRole = CreatableRole | "admin" | "super_admin";

const roleLabels: Record<DashboardRole, string> = {
 admin: "Admin",
 super_admin: "Super Admin",
 marketing: "Marketing",
 finance: "Finance",
 sales: "Sales",
 support: "Support",
};

const roleLoginPaths: Record<DashboardRole, string> = {
 admin: "/management/admin",
 super_admin: "/management/super-admin",
 marketing: "/management/marketing",
 finance: "/management/finance",
 sales: "/management/sales",
 support: "/management/support",
};

export default function UsersPage() {
 const [q, setQ] = useState("");
 const [list, setList] = useState<AdminUser[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [showCreateForm, setShowCreateForm] = useState(false);
 const [creating, setCreating] = useState(false);
 const [page, setPage] = useState(1);
 const [newId, setNewId] = useState({ name: "", email: "", password: "", confirmPassword: "", role: "marketing" as CreatableRole });

 const fetchUsers = async (showLoader = false) => {
 if (showLoader) setLoading(true);
 setError("");
 const token = getManagementToken();
 if (!token) {
 setError("Admin session token nahi mila. Please dobara admin login karein.");
 setLoading(false);
 return;
 }

 try {
 const res = await fetch(`${API}/admin/users?limit=50`, {
 headers: { Authorization: `Bearer ${token}` }
 });

 if (!res.ok) {
 const body = await res.json().catch(() => ({}));
 throw new Error(body.message || `Users load nahi hue (${res.status}).`);
 }

 const data = await res.json();
 const mappedUsers = (data.users || []).map((u: any) => ({
 id: u.id.toString(),
 name: u.name || "Unnamed user",
 email: u.email,
 plan: u.plan === 'free' ? 'Free' : u.plan === 'gold' ? 'Plus' : 'Premium',
 joined: new Date(u.createdAt).toISOString().split('T')[0],
 status: u.status || "active",
 verified: Boolean(u.isVerified),
 role: u.role || "user"
 }));
 setList(mappedUsers);
 } catch (err) {
 console.error("Failed to fetch users", err);
 setError(err instanceof Error ? err.message : "Users load nahi hue.");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchUsers(true);
 const interval = window.setInterval(() => fetchUsers(false), 15_000);
 return () => window.clearInterval(interval);
 }, []);

 const filtered = list.filter(
 (u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()) || u.role.toLowerCase().includes(q.toLowerCase()),
 );
 const pageCount = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));
 const startIndex = (page - 1) * USERS_PER_PAGE;
 const paginatedUsers = filtered.slice(startIndex, startIndex + USERS_PER_PAGE);

 const managementIds = list.filter((user) => user.role !== "user");

 useEffect(() => {
 setPage(1);
 }, [q]);

 useEffect(() => {
 setPage((current) => Math.min(current, pageCount));
 }, [pageCount]);

 const createManagementId = async (event: React.FormEvent) => {
 event.preventDefault();
 if (newId.password !== newId.confirmPassword) {
 toast.error("Password aur confirm password match nahi karte.");
 return;
 }
 const token = getManagementToken();
 if (!token) {
 toast.error("Admin session expire ho gayi. Please dobara login karein.");
 return;
 }
 setCreating(true);
 try {
 const res = await fetch(`${API}/admin/management-users`, {
 method: "POST",
 headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
 body: JSON.stringify({ name: newId.name, email: newId.email, password: newId.password, role: newId.role }),
 });
 const body = await res.json().catch(() => ({}));
 if (!res.ok) throw new Error(Array.isArray(body.message) ? body.message[0] : body.message || "ID create nahi hui.");
 await fetchUsers(false);
 setNewId({ name: "", email: "", password: "", confirmPassword: "", role: "marketing" });
 setShowCreateForm(false);
 toast.success(`${roleLabels[newId.role]} ID created. Ab email/password se login ho sakta hai.`);
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "ID create nahi hui.");
 } finally {
 setCreating(false);
 }
 };

 const update = async (id: string, status: AdminUser["status"]) => {
 // Optimistic UI update
 setList((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));

 const token = getManagementToken();
 if (token) {
 try {
 const res = await fetch(`${API}/admin/users/${id}/status`, {
 method: 'PATCH',
 headers: {
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}`
 },
 body: JSON.stringify({ status })
 });
 if (!res.ok) throw new Error(`Status update failed (${res.status})`);
 } catch (err) {
 console.error("Failed to update status on backend", err);
 toast.error("Failed to sync status with server");
 return;
 }
 }
 toast.success(`User ${status}`);
 };

 return (
 <div className="space-y-6 pb-12">
 <header className="flex flex-wrap items-end justify-between gap-4">
 <div>
 <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User management</h1>
 <p className="text-sm font-medium text-slate-500 mt-1">View, suspend, ban, or delete platform users.</p>
 </div>
 <div className="flex items-center gap-3">
 <Button onClick={() => setShowCreateForm((open) => !open)} className="h-[44px] min-h-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-5 text-white shadow-lg shadow-rose-500/20 hover:opacity-90">
 {showCreateForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}{showCreateForm ? "Close" : "Create ID"}
 </Button>
 <div className="relative">
 <Search className="absolute left-3.5 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-slate-400" />
 <Input
 value={q}
 onChange={(e) => setQ(e.target.value)}
 placeholder="Search users…"
 className="w-[20vw] pl-10 h-[44px] rounded-full border-slate-200 bg-white/60 backdrop-blur-sm shadow-sm focus-visible:ring-rose-500/30 transition-all"
 />
 </div>
 </div>
 </header>

 {showCreateForm && (
 <form onSubmit={createManagementId} className="rounded-3xl border border-rose-100 bg-white/70 p-6 shadow-xl shadow-rose-500/5 backdrop-blur-md">
 <div className="mb-5 flex items-center gap-3">
 <div className="rounded-xl bg-rose-100 p-2 text-rose-600"><ShieldCheck className="h-5 w-5" /></div>
 <div><h2 className="font-bold text-slate-900">Create New Dashboard ID</h2><p className="text-xs text-slate-500">Selected dashboard ke login page par ye email aur password kaam karega.</p></div>
 </div>
 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
 <div><label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Full Name</label><Input required minLength={2} value={newId.name} onChange={(e) => setNewId({ ...newId, name: e.target.value })} placeholder="Full name" /></div>
 <div><label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Login Email</label><Input required type="email" value={newId.email} onChange={(e) => setNewId({ ...newId, email: e.target.value })} placeholder="name@company.com" /></div>
 <div><label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Password</label><Input required minLength={8} type="password" value={newId.password} onChange={(e) => setNewId({ ...newId, password: e.target.value })} placeholder="Minimum 8 characters" /></div>
 <div><label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Confirm Password</label><Input required minLength={8} type="password" value={newId.confirmPassword} onChange={(e) => setNewId({ ...newId, confirmPassword: e.target.value })} placeholder="Repeat password" /></div>
 <div><label className="mb-1.5 block text-xs font-bold uppercase text-slate-500">Dashboard Role</label><select value={newId.role} onChange={(e) => setNewId({ ...newId, role: e.target.value as CreatableRole })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="marketing">Marketing</option><option value="finance">Finance</option><option value="sales">Sales</option><option value="support">Support</option></select></div>
 </div>
 <div className="mt-5 flex justify-end"><Button disabled={creating} type="submit" className="min-w-36 bg-gradient-to-r from-rose-500 to-pink-600 text-white">{creating ? "Creating..." : "Create ID"}</Button></div>
 </form>
 )}

 {error && (
 <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
 <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</span>
 <Button size="sm" variant="outline" className="border-rose-200 bg-white text-rose-700" onClick={() => fetchUsers(true)}>
 <RefreshCw className="mr-2 h-4 w-4" />Retry
 </Button>
 </div>
 )}

 <section className="overflow-hidden rounded-3xl bg-white/70 shadow-xl shadow-rose-500/5 ring-1 ring-white/60 backdrop-blur-md">
 <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
 <div><h2 className="font-bold text-slate-900">Created Dashboard IDs</h2><p className="text-xs text-slate-500">All management login accounts in one place.</p></div>
 <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">{managementIds.length} IDs</span>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-slate-600">
 <thead className="bg-slate-50/70 text-left text-xs font-bold uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-3">Name / Login Email</th><th className="px-6 py-3">Dashboard Role</th><th className="px-6 py-3">Login Page</th><th className="px-6 py-3">Created</th><th className="px-6 py-3">Status</th></tr></thead>
 <tbody className="divide-y divide-slate-100">
 {managementIds.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No dashboard IDs created yet.</td></tr> : managementIds.map((user) => {
 const role = user.role as DashboardRole;
 return <tr key={`management-${user.id}`} className="hover:bg-rose-50/30"><td className="px-6 py-4"><div className="font-bold text-slate-900">{user.name}</div><div className="text-xs text-slate-500">{user.email}</div></td><td className="px-6 py-4"><span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">{roleLabels[role]}</span></td><td className="px-6 py-4"><a className="font-medium text-rose-600 hover:underline" href={roleLoginPaths[role]}>{roleLoginPaths[role]}</a></td><td className="px-6 py-4">{user.joined}</td><td className="px-6 py-4"><span className={cn("rounded-lg px-2.5 py-1 text-xs font-bold capitalize", user.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{user.status}</span></td></tr>;
 })}
 </tbody>
 </table>
 </div>
 </section>

 <div className="overflow-hidden rounded-3xl bg-white/60 backdrop-blur-md shadow-xl shadow-rose-500/5 ring-1 ring-white/50">
 <div className="border-b border-slate-100 px-6 py-4"><h2 className="font-bold text-slate-900">All Platform Accounts</h2><p className="text-xs text-slate-500">Dating users and management IDs.</p></div>
 <table className="w-full table-fixed text-sm text-slate-600">
 <colgroup>
 <col className="w-[31%]" />
 <col className="w-[11%]" />
 <col className="w-[9%]" />
 <col className="w-[12%]" />
 <col className="w-[10%]" />
 <col className="w-[27%]" />
 </colgroup>
 <thead className="border-b border-slate-200/50 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
 <tr>
 <th className="px-6 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Plan</th>
 <th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status</th>
 <th className="px-6 py-3 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100/50 bg-white/50">
 {loading ? (
 <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">Loading real data...</td></tr>
 ) : filtered.length === 0 ? (
 <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">{error ? "Users could not be loaded." : "No users found."}</td></tr>
 ) : (
 paginatedUsers.map((u) => (
 <tr key={u.id} className="hover:bg-white/80 transition-colors">
 <td className="px-6 py-2.5">
 <div className="flex min-w-0 items-center gap-2 text-[13px] font-bold text-slate-900">
 <span className="truncate">
 {u.name}
 </span>
 {u.verified && <BadgeCheck className="h-[16px] w-[16px] text-rose-500" />}
 </div>
 <div className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{u.email}</div>
 </td>
 <td className="whitespace-nowrap px-4 py-2.5 align-middle text-[11px] font-bold capitalize text-slate-600">{u.role.replace("_", " ")}</td>
 <td className="px-4 py-2.5 align-middle">
 <span className={`inline-flex h-6 min-w-[58px] items-center justify-center whitespace-nowrap rounded-full px-2 text-[10px] font-bold ${u.plan === 'Premium' ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-sm shadow-rose-500/20' : 'bg-slate-100 text-slate-600'}`}>
 {u.plan}
 </span>
 </td>
 <td className="whitespace-nowrap px-4 py-2.5 align-middle text-[13px] font-medium text-slate-500">{u.joined}</td>
 <td className="px-4 py-2.5 align-middle">
 <span className={cn(
 "inline-flex h-6 min-w-[58px] items-center justify-center rounded-full px-2 text-[10px] font-bold capitalize",
 u.status === "active" && "bg-emerald-100 text-emerald-700",
 u.status === "suspended" && "bg-amber-100 text-amber-700",
 u.status === "banned" && "bg-rose-100 text-rose-700",
 )}>{u.status}</span>
 </td>
 <td className="px-4 py-2.5 align-middle">
 <div className="ml-auto flex flex-nowrap justify-end gap-1.5">
 {u.status !== "active" && (
 <Button size="sm" variant="outline" className="h-[26px] min-w-[60px] rounded-full border-emerald-200 bg-emerald-50/60 px-2.5 text-[10px] font-bold text-emerald-700 shadow-none hover:border-emerald-300 hover:bg-emerald-100" onClick={() => update(u.id, "active")}>Activate</Button>
 )}
 {u.status !== "suspended" && (
 <Button size="sm" variant="outline" className="h-[26px] min-w-[60px] rounded-full border-amber-200 bg-amber-50/60 px-2.5 text-[10px] font-bold text-amber-700 shadow-none hover:border-amber-300 hover:bg-amber-100" onClick={() => update(u.id, "suspended")}>Suspend</Button>
 )}
 {u.status !== "banned" && (
 <Button size="sm" variant="outline" className="h-[26px] min-w-[44px] rounded-full border-rose-200 bg-rose-50/70 px-2.5 text-[10px] font-bold text-rose-700 shadow-none hover:border-rose-300 hover:bg-rose-100" onClick={() => update(u.id, "banned")}>Ban</Button>
 )}
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 <div className="flex flex-col gap-3 border-t border-slate-100 bg-white/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
 <p className="text-xs font-semibold text-slate-500">
 Showing {filtered.length === 0 ? 0 : startIndex + 1}-{Math.min(startIndex + USERS_PER_PAGE, filtered.length)} of {filtered.length} users
 </p>
 <div className="flex items-center gap-2">
 <Button
 type="button"
 size="sm"
 variant="outline"
 disabled={page === 1}
 onClick={() => setPage((value) => Math.max(1, value - 1))}
 className="rounded-lg border-slate-200 bg-white text-slate-600"
 >
 Previous
 </Button>
 <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
 Page {page} of {pageCount}
 </span>
 <Button
 type="button"
 size="sm"
 variant="outline"
 disabled={page === pageCount}
 onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
 className="rounded-lg border-slate-200 bg-white text-slate-600"
 >
 Next
 </Button>
 </div>
 </div>
 </div>
 </div>
 );
}
