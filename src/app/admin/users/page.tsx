"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type AdminUser = {
 id: string;
 name: string;
 email: string;
 joined: string;
 status: "active" | "suspended" | "banned";
 verified: boolean;
 plan: "Free" | "Plus" | "Premium";
};

export default function UsersPage() {
 const [q, setQ] = useState("");
 const [list, setList] = useState<AdminUser[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchUsers = async () => {
 const token = getToken();
 if (!token) {
 setLoading(false);
 return;
 }

 try {
 const res = await fetch(`${API}/admin/users?limit=50`, {
 headers: { Authorization: `Bearer ${token}` }
 });
 
 if (res.ok) {
 const data = await res.json();
 if (data.users && data.users.length > 0) {
 const mappedUsers = data.users.map((u: any) => ({
 id: u.id.toString(),
 name: u.name,
 email: u.email,
 plan: u.plan === 'free' ? 'Free' : 'Premium',
 joined: new Date(u.createdAt).toISOString().split('T')[0],
 status: u.status,
 verified: true // Assuming database users are verified for demo
 }));
 
 setList(mappedUsers);
 }
 }
 } catch (err) {
 console.error("Failed to fetch users", err);
 } finally {
 setLoading(false);
 }
 };
 fetchUsers();
 }, []);

 const filtered = list.filter(
 (u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()),
 );

 const update = async (id: string, status: AdminUser["status"]) => {
 // Optimistic UI update
 setList((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));
 
 // Check if it's a real backend user (usually simple numeric ID, mock users start with 'u')
 if (!id.startsWith('u')) {
 const token = getToken();
 if (token) {
 try {
 await fetch(`${API}/admin/users/${id}/status`, {
 method: 'PATCH',
 headers: { 
 'Content-Type': 'application/json',
 Authorization: `Bearer ${token}` 
 },
 body: JSON.stringify({ status })
 });
 } catch (err) {
 console.error("Failed to update status on backend", err);
 toast.error("Failed to sync status with server");
 return;
 }
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
 <div className="relative">
 <Search className="absolute left-3.5 top-1/2 h-[1.111vw] w-[1.111vw] -translate-y-1/2 text-slate-400" />
 <Input 
 value={q} 
 onChange={(e) => setQ(e.target.value)} 
 placeholder="Search users…" 
 className="w-[20vw] pl-10 h-[3.056vw] rounded-full border-slate-200 bg-white/60 backdrop-blur-sm shadow-sm focus-visible:ring-rose-500/30 transition-all" 
 />
 </div>
 </header>

 <div className="overflow-hidden rounded-3xl bg-white/60 backdrop-blur-md shadow-xl shadow-rose-500/5 ring-1 ring-white/50">
 <table className="w-full text-sm text-slate-600">
 <thead className="text-left text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/50">
 <tr>
 <th className="px-6 py-4">User</th><th className="px-6 py-4">Plan</th>
 <th className="px-6 py-4">Joined</th><th className="px-6 py-4">Status</th>
 <th className="px-6 py-4 text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100/50 bg-white/50">
 {loading ? (
 <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">Loading real data...</td></tr>
 ) : filtered.length === 0 ? (
 <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium">No users found.</td></tr>
 ) : (
 filtered.map((u) => (
 <tr key={u.id} className="hover:bg-white/80 transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center gap-2 font-bold text-slate-900">
 {u.name}
 {u.verified && <BadgeCheck className="h-[1.111vw] w-[1.111vw] text-rose-500" />}
 </div>
 <div className="text-xs font-medium text-slate-500 mt-0.5">{u.email}</div>
 </td>
 <td className="px-6 py-4">
 <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${u.plan === 'Premium' ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-500/20' : 'bg-slate-100 text-slate-600'}`}>
 {u.plan}
 </span>
 </td>
 <td className="px-6 py-4 font-medium text-slate-500">{u.joined}</td>
 <td className="px-6 py-4">
 <span className={cn(
 "rounded-xl px-3 py-1.5 text-xs font-bold capitalize inline-block",
 u.status === "active" && "bg-emerald-100 text-emerald-700",
 u.status === "suspended" && "bg-amber-100 text-amber-700",
 u.status === "banned" && "bg-rose-100 text-rose-700",
 )}>{u.status}</span>
 </td>
 <td className="px-6 py-4">
 <div className="flex justify-end gap-2 w-[12.5vw] ml-auto">
 {u.status !== "active" && (
 <Button size="sm" variant="outline" className="w-[5.556vw] h-[2.222vw] rounded-lg border-emerald-100 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 shadow-sm font-semibold" onClick={() => update(u.id, "active")}>Activate</Button>
 )}
 {u.status !== "suspended" && (
 <Button size="sm" variant="outline" className="w-[5.556vw] h-[2.222vw] rounded-lg border-amber-100 text-amber-600 hover:bg-amber-50 hover:border-amber-200 shadow-sm font-semibold" onClick={() => update(u.id, "suspended")}>Suspend</Button>
 )}
 {u.status !== "banned" && (
 <Button size="sm" variant="outline" className="w-[5.556vw] h-[2.222vw] rounded-lg border-rose-100 text-rose-600 hover:bg-rose-50 hover:border-rose-200 shadow-sm font-semibold" onClick={() => update(u.id, "banned")}>Ban</Button>
 )}
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>
 );
}
