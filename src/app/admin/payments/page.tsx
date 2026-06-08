"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function PaymentsPage() {
 const [payments, setPayments] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const token = getToken();
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
 ) : payments.length === 0 ? (
 <tr><td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">No payments found.</td></tr>
 ) : payments.map((p) => (
 <tr key={p.id} className="border-t border-border">
 <td className="px-5 py-3">{p.user?.name || "Deleted user"}</td>
 <td className="px-5 py-3">{p.planName}</td>
 <td className="px-5 py-3">${Number(p.amount).toFixed(2)}</td>
 <td className="px-5 py-3">{new Date(p.createdAt).toISOString().split("T")[0]}</td>
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
