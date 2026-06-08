"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/finance/StatCard";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

const tabs = ["Requests", "Approved", "Rejected", "History"] as const;

export default function Refunds() {
 const [tab, setTab] = useState<(typeof tabs)[number]>("Requests");
 const [refunds, setRefunds] = useState<any[]>([]);

 useEffect(() => {
 api.payments()
 .then((data) => {
 const rows = (data.transactions || [])
 .filter((tx) => tx.status === "refunded" || tx.status === "pending")
 .map((tx) => ({
 id: tx.id,
 user: tx.user,
 amount: tx.amount,
 reason: tx.status === "pending" ? "Payment pending review" : "Refund processed from payment record",
 status: tx.status === "refunded" ? "Approved" : "Pending",
 date: tx.date,
 }));
 setRefunds(rows);
 })
 .catch(() => setRefunds([]));
 }, []);

 const filtered = refunds.filter((r) => {
 if (tab === "Requests") return r.status === "Pending";
 if (tab === "Approved") return r.status === "Approved";
 if (tab === "Rejected") return r.status === "Rejected";
 return true;
 });

 return (
 <DashboardLayout title="Refunds" subtitle="Review, approve, or reject refund requests.">
 <div className="flex items-center gap-2 mb-4">
 {tabs.map((t) => (
 <button
 key={t}
 onClick={() => setTab(t)}
 className={`px-4 h-[2.5vw] rounded-lg text-sm font-medium transition-colors ${
 tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
 }`}
 >
 {t === "History" ? "Refund History" : t}
 </button>
 ))}
 </div>

 <div className="rounded-2xl bg-card border border-border overflow-hidden">
 <table className="w-full text-sm">
 <thead className="bg-muted/60 text-muted-foreground">
 <tr>
 {["Refund ID", "User", "Amount", "Reason", "Status", "Date", ""].map((h) => (
 <th key={h} className="text-left font-medium px-5 py-3">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filtered.map((r) => (
 <tr key={r.id} className="hover:bg-muted/30 transition-colors">
 <td className="px-5 py-4 font-medium">{r.id}</td>
 <td className="px-5 py-4">{r.user}</td>
 <td className="px-5 py-4 font-medium">${r.amount.toFixed(2)}</td>
 <td className="px-5 py-4 text-muted-foreground">{r.reason}</td>
 <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
 <td className="px-5 py-4 text-muted-foreground">{r.date}</td>
 <td className="px-5 py-4 text-right">
 {r.status === "Pending" && (
 <div className="flex items-center justify-end gap-2">
 <button className="size-8 rounded-lg grid place-items-center text-success bg-success/15 hover:bg-success/25 transition-colors">
 <Check className="size-4" />
 </button>
 <button className="size-8 rounded-lg grid place-items-center text-destructive bg-destructive/15 hover:bg-destructive/25 transition-colors">
 <X className="size-4" />
 </button>
 </div>
 )}
 </td>
 </tr>
 ))}
 {filtered.length === 0 && (
 <tr>
 <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
 No {tab.toLowerCase()} found.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </DashboardLayout>
 );
}
