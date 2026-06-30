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
 api.financeRefunds()
 .then((data) => {
 setRefunds(data.refunds.map((r) => ({
 ...r,
 reason: r.status === "Requests" ? "Payment pending review" : "Refund processed from payment record",
 status: r.status === "Requests" ? "Pending" : r.status,
 })));
 })
 .catch(() => setRefunds([]));
 }, []);

 const approveRefund = async (id: string) => {
 await api.refundPayment(id);
 setRefunds((rows) => rows.map((row) => row.id === id ? { ...row, status: "Approved" } : row));
 };

 const rejectRefund = async (id: string) => {
 await api.rejectRefund(id);
 setRefunds((rows) => rows.map((row) => row.id === id ? { ...row, status: "Rejected" } : row));
 };

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
 className={`px-4 h-[36px] rounded-lg text-sm font-medium transition-colors ${
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
 <button onClick={() => approveRefund(r.id)} className="size-8 rounded-lg grid place-items-center text-success bg-success/15 hover:bg-success/25 transition-colors">
 <Check className="size-4" />
 </button>
 <button onClick={() => rejectRefund(r.id)} className="size-8 rounded-lg grid place-items-center text-destructive bg-destructive/15 hover:bg-destructive/25 transition-colors">
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
