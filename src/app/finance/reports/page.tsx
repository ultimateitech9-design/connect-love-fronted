"use client";


import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { FileText, FileSpreadsheet, FileDown, Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
const ranges = ["Daily", "Weekly", "Monthly", "Yearly", "Custom"] as const;

export default function Reports() {
 const [range, setRange] = useState<(typeof ranges)[number]>("Monthly");
 const [transactions, setTransactions] = useState<any[]>([]);

 useEffect(() => {
 api.payments()
 .then((data) => setTransactions(data.transactions || []))
 .catch(() => setTransactions([]));
 }, []);

 const reportRows = useMemo(() => {
 const revenue = transactions.filter((tx) => tx.status === "successful").reduce((sum, tx) => sum + tx.amount, 0);
 const refunds = transactions.filter((tx) => tx.status === "refunded").reduce((sum, tx) => sum + tx.amount, 0);
 const txns = transactions.length;
 return [
 { period: "Today", revenue, refunds, net: revenue - refunds, txns },
 { period: "This Month", revenue, refunds, net: revenue - refunds, txns },
 { period: "This Year", revenue, refunds, net: revenue - refunds, txns },
 ];
 }, [transactions]);

 return (
 <DashboardLayout title="Reports" subtitle="Generate and export financial reports.">
 <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
 <div className="flex items-center gap-2">
 {ranges.map((r) => (
 <button
 key={r}
 onClick={() => setRange(r)}
 className={`px-4 h-[36px] rounded-lg text-sm font-medium transition-colors ${
 range === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
 }`}
 >
 {r}
 </button>
 ))}
 </div>
 <div className="flex items-center gap-2">
 <button className="inline-flex items-center gap-2 h-[36px] px-3 rounded-lg bg-muted text-sm hover:bg-secondary"><FileText className="size-4" /> PDF</button>
 <button className="inline-flex items-center gap-2 h-[36px] px-3 rounded-lg bg-muted text-sm hover:bg-secondary"><FileSpreadsheet className="size-4" /> Excel</button>
 <button className="inline-flex items-center gap-2 h-[36px] px-3 rounded-lg bg-muted text-sm hover:bg-secondary"><FileDown className="size-4" /> CSV</button>
 </div>
 </div>

 {range === "Custom" && (
 <div className="mb-6 p-5 rounded-2xl bg-card border border-border flex flex-wrap items-end gap-4">
 <div>
 <label className="text-xs text-muted-foreground">From</label>
 <div className="mt-1 flex items-center gap-2 h-[40px] px-3 rounded-lg bg-muted">
 <Calendar className="size-4 text-muted-foreground" />
 <input type="date" className="bg-transparent outline-none text-sm" />
 </div>
 </div>
 <div>
 <label className="text-xs text-muted-foreground">To</label>
 <div className="mt-1 flex items-center gap-2 h-[40px] px-3 rounded-lg bg-muted">
 <Calendar className="size-4 text-muted-foreground" />
 <input type="date" className="bg-transparent outline-none text-sm" />
 </div>
 </div>
 <button className="h-[40px] px-5 rounded-lg text-primary-foreground text-sm font-medium" style={{ background: "var(--gradient-rose)" }}>
 Generate Report
 </button>
 </div>
 )}

 <div className="rounded-2xl bg-card border border-border overflow-hidden">
 <table className="w-full text-sm">
 <thead className="bg-muted/60 text-muted-foreground">
 <tr>
 {["Period", "Revenue", "Refunds", "Net Revenue", "Transactions"].map((h) => (
 <th key={h} className="text-left font-medium px-5 py-3">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody>
 {reportRows.map((r) => (
 <tr key={r.period} className="border-t border-border hover:bg-muted/40">
 <td className="px-5 py-3 font-medium">{r.period}</td>
 <td className="px-5 py-3">${r.revenue.toLocaleString()}</td>
 <td className="px-5 py-3 text-destructive">-${r.refunds.toLocaleString()}</td>
 <td className="px-5 py-3 font-semibold">${r.net.toLocaleString()}</td>
 <td className="px-5 py-3 text-muted-foreground">{r.txns.toLocaleString()}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </DashboardLayout>
 );
}
