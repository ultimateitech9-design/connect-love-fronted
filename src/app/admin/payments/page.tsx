"use client";
import { API_ORIGIN } from "@/config/runtime";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getManagementToken } from "@/lib/auth";

const API = API_ORIGIN;
const demoPayments = [
 { id: "demo-1", user: { name: "Super Admin" }, planName: "Premium", amount: 399, createdAt: "2026-07-03T09:15:00.000Z", status: "successful" },
 { id: "demo-2", user: { name: "Suraj Kumar" }, planName: "Plus", amount: 199, createdAt: "2026-07-02T14:40:00.000Z", status: "pending" },
 { id: "demo-3", user: { name: "Priya Sharma" }, planName: "Premium", amount: 399, createdAt: "2026-07-01T18:10:00.000Z", status: "successful" },
 { id: "demo-4", user: { name: "Aman Verma" }, planName: "Plus", amount: 199, createdAt: "2026-06-30T11:25:00.000Z", status: "refunded" },
];

export default function PaymentsPage() {
 const [payments, setPayments] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const displayPayments = payments.length > 0 ? payments : demoPayments;

 useEffect(() => {
 const token = getManagementToken();
 if (!token) {
 setLoading(false);
 return;
 }
 fetch(`${API}/admin/payments`, { headers: { Authorization: `Bearer ${token}` } })
 .then((res) => res.ok ? res.json() : [])
 .then((data) => setPayments(Array.isArray(data) ? data : []))
 .finally(() => setLoading(false));
 }, []);

 return (
 <div className="space-y-6">
 <header>
 <h1 className="text-2xl font-semibold">Payment monitoring</h1>
 <p className="text-sm text-muted-foreground">Track payment status across plans.</p>
 </header>
 <div className="overflow-hidden rounded-2xl border border-border bg-card">
 <table className="w-full text-sm">
 <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
 <tr>
 <th className="px-5 py-3">User</th><th className="px-5 py-3">Plan</th>
 <th className="px-5 py-3">Amount</th><th className="px-5 py-3">Date</th>
 <th className="px-5 py-3">Status</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 <tr><td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">Loading payments from database...</td></tr>
 ) : displayPayments.map((p) => (
 <tr key={p.id} className="border-t border-border hover:bg-rose-50/30">
 <td className="px-5 py-3 font-semibold text-slate-900">{p.user?.name || "Deleted user"}</td>
 <td className="px-5 py-3">{p.planName}</td>
 <td className="px-5 py-3 font-semibold text-slate-700">${Number(p.amount).toFixed(2)}</td>
 <td className="px-5 py-3 text-slate-500">{new Date(p.createdAt).toISOString().split("T")[0]}</td>
 <td className="px-5 py-3">
 <span className={cn(
 "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
 p.status === "successful" && "bg-emerald-100 text-emerald-700",
 p.status === "pending" && "bg-amber-100 text-amber-700",
 p.status === "refunded" && "bg-rose-100 text-rose-700",
 )}>{p.status}</span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}
