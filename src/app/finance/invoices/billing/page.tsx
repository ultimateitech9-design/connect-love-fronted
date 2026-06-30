"use client";


import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Download, Filter } from "lucide-react";
import { downloadTable } from "@/lib/download";
const gateways = ["All", "Stripe", "Razorpay"] as const;

export default function BillingRecords() {
 const [gw, setGw] = useState<(typeof gateways)[number]>("All");
 const [billingRecords, setBillingRecords] = useState<any[]>([]);

 useEffect(() => {
 api.payments()
 .then((data) => {
 setBillingRecords((data.transactions || []).map((tx) => {
 const fee = +(tx.amount * 0.029).toFixed(2);
 return {
 id: `BR-${tx.id.slice(0, 8)}`,
 user: tx.user,
 invoice: `INV-${tx.id.slice(0, 8)}`,
 method: "Database",
 gateway: "Stripe",
 amount: tx.amount,
 fee,
 net: +(tx.amount - fee).toFixed(2),
 date: tx.date,
 };
 }));
 })
 .catch(() => setBillingRecords([]));
 }, []);

 const filtered = billingRecords.filter((b) => gw === "All" || b.gateway === gw);

 const gross = filtered.reduce((s, b) => s + b.amount, 0);
 const fees = filtered.reduce((s, b) => s + b.fee, 0);
 const net = filtered.reduce((s, b) => s + b.net, 0);

 return (
 <DashboardLayout title="Billing Records" subtitle="Detailed ledger of every charge, fee, and payout.">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 <Stat label="Gross Charged" value={`$${gross.toFixed(2)}`} />
 <Stat label="Processor Fees" value={`$${fees.toFixed(2)}`} muted />
 <Stat label="Net Settled" value={`$${net.toFixed(2)}`} accent />
 </div>

 <div className="flex items-center justify-between gap-3 mb-4">
 <div className="flex items-center gap-2">
 <Filter className="size-4 text-muted-foreground" />
 {gateways.map((g) => (
 <button
 key={g}
 onClick={() => setGw(g)}
 className={`px-3 h-[32px] rounded-md text-xs font-medium transition-colors ${
 gw === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
 }`}
 >
 {g}
 </button>
 ))}
 </div>
 <button onClick={() => downloadTable("billing-records.csv", filtered)} className="inline-flex items-center gap-2 px-4 h-[36px] rounded-lg bg-muted text-sm font-medium hover:bg-secondary">
 <Download className="size-4" /> Export CSV
 </button>
 </div>

 <div className="rounded-2xl bg-card border border-border overflow-hidden">
 <table className="w-full text-sm">
 <thead className="bg-muted/60 text-muted-foreground">
 <tr>
 {["Record", "Customer", "Invoice", "Method", "Gateway", "Amount", "Fee", "Net", "Date"].map((h) => (
 <th key={h} className="text-left font-medium px-5 py-3">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {filtered.map((b) => (
 <tr key={b.id} className="border-t border-border hover:bg-muted/40">
 <td className="px-5 py-3 font-mono text-xs">{b.id}</td>
 <td className="px-5 py-3 font-medium">{b.user}</td>
 <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{b.invoice}</td>
 <td className="px-5 py-3 text-muted-foreground">{b.method}</td>
 <td className="px-5 py-3">
 <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent/40 text-foreground">{b.gateway}</span>
 </td>
 <td className="px-5 py-3">${b.amount.toFixed(2)}</td>
 <td className="px-5 py-3 text-muted-foreground">${b.fee.toFixed(2)}</td>
 <td className="px-5 py-3 font-medium">${b.net.toFixed(2)}</td>
 <td className="px-5 py-3 text-muted-foreground">{b.date}</td>
 </tr>
 ))}
 {filtered.length === 0 && (
 <tr><td colSpan={9} className="px-5 py-10 text-center text-muted-foreground">No records</td></tr>
 )}
 </tbody>
 </table>
 </div>
 </DashboardLayout>
 );
}

function Stat({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
 return (
 <div className="rounded-2xl bg-card border border-border p-5">
 <div className="text-sm text-muted-foreground">{label}</div>
 <div className={`mt-2 text-2xl font-semibold tracking-tight ${accent ? "text-primary" : muted ? "text-muted-foreground" : ""}`}>{value}</div>
 </div>
 );
}
