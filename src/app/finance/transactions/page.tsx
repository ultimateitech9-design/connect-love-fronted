"use client";


import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge } from "@/components/finance/StatCard";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
const tabs = ["All", "Successful", "Pending", "Failed"] as const;

export default function Transactions() {
 const [tab, setTab] = useState<(typeof tabs)[number]>("All");
 const [transactions, setTransactions] = useState<any[]>([]);
 useEffect(() => {
 api.payments()
 .then((data) => setTransactions(data.transactions || []))
 .catch(() => setTransactions([]));
 }, []);
 const filtered = tab === "All" ? transactions : transactions.filter((t) => t.status.toLowerCase() === tab.toLowerCase());

 return (
 <DashboardLayout title="Transactions" subtitle="All payments processed across ConnectLove.">
 <div className="flex items-center gap-2 mb-4">
 {tabs.map((t) => (
 <button
 key={t}
 onClick={() => setTab(t)}
 className={`px-4 h-[36px] rounded-lg text-sm font-medium transition-colors ${
 tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
 }`}
 >
 {t} Payments
 </button>
 ))}
 </div>

 <div className="rounded-2xl bg-card border border-border overflow-hidden">
 <table className="w-full text-sm">
 <thead className="bg-muted/60 text-muted-foreground">
 <tr>
 {["Transaction ID", "User", "Amount", "Payment Method", "Status", "Date"].map((h) => (
 <th key={h} className="text-left font-medium px-5 py-3">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {filtered.map((t) => (
 <tr key={t.id} className="border-t border-border hover:bg-muted/40">
 <td className="px-5 py-3 font-mono text-xs">{t.id}</td>
 <td className="px-5 py-3 font-medium">{t.user}</td>
 <td className="px-5 py-3">${t.amount.toFixed(2)}</td>
 <td className="px-5 py-3 text-muted-foreground">Database</td>
 <td className="px-5 py-3"><StatusBadge status={t.status.replace(/\b\w/g, (c: string) => c.toUpperCase())} /></td>
 <td className="px-5 py-3 text-muted-foreground">{t.date}</td>
 </tr>
 ))}
 {filtered.length === 0 && (
 <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">No transactions</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </DashboardLayout>
 );
}
