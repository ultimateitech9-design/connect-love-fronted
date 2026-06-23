"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { FileText, Send, Plus, Trash2, Download, Eye, Search } from "lucide-react";
import { StatusBadge } from "@/components/finance/StatCard";

type Line = { desc: string; qty: number; price: number };

const historyTabs = ["All", "Paid", "Unpaid", "Overdue"] as const;

export default function InvoicesModule() {
 const [activeView, setActiveView] = useState<"generate" | "history">("generate");
 const [invoices, setInvoices] = useState<any[]>([]);
 const [planOptions, setPlanOptions] = useState<string[]>(["Premium Match"]);

 // Generate State
 const [customer, setCustomer] = useState("");
 const [email, setEmail] = useState("");
 const [plan, setPlan] = useState<string>("Premium Match");
 const [due, setDue] = useState("2026-06-15");
 const [notes, setNotes] = useState("");
 const [lines, setLines] = useState<Line[]>([
 { desc: "Premium Match - Monthly subscription", qty: 1, price: 9.99 },
 ]);

 useEffect(() => {
 Promise.all([api.payments(), api.invoices()])
 .then((data) => {
 const [payments, invoiceData] = data;
 const plans = payments.plans.map((p) => p.name);
 setPlanOptions(plans.length ? plans : ["Premium Match"]);
 setPlan(plans[0] || "Premium Match");
 setInvoices(invoiceData.invoices.map((tx) => ({
 id: tx.id,
 user: tx.customer,
 plan: tx.plan,
 amount: tx.amount,
 status: tx.status,
 issued: tx.due,
 due: tx.due,
 })));
 })
 .catch(() => setInvoices([]));
 }, []);

 const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
 const tax = +(subtotal * 0.08).toFixed(2);
 const total = +(subtotal + tax).toFixed(2);

 const update = (i: number, patch: Partial<Line>) =>
 setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

 // History State
 const [tab, setTab] = useState<(typeof historyTabs)[number]>("All");
 const [q, setQ] = useState("");

 const filtered = invoices.filter((i) => {
 const matchesTab = tab === "All" || i.status === tab;
 const matchesQ = !q || i.user.toLowerCase().includes(q.toLowerCase()) || i.id.toLowerCase().includes(q.toLowerCase());
 return matchesTab && matchesQ;
 });

 const totalPaid = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
 const totalUnpaid = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
 const generateInvoice = async () => {
 const created: any = await api.createInvoice({ customer, email, plan, due, notes, amount: total });
 setInvoices((rows) => [{
 id: created.id,
 user: created.customer,
 plan: created.plan,
 amount: created.amount,
 status: created.status,
 issued: new Date().toISOString().slice(0, 10),
 due: created.due,
 }, ...rows]);
 setActiveView("history");
 };

 return (
 <DashboardLayout title="Invoices" subtitle="Generate new invoices or view your billing history.">
 {/* View Switcher Tabs */}
 <div className="flex items-center gap-2 mb-6 border-b border-border pb-1">
 <button
 onClick={() => setActiveView("generate")}
 className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
 activeView === "generate" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
 }`}
 >
 Generate Invoice
 </button>
 <button
 onClick={() => setActiveView("history")}
 className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
 activeView === "history" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
 }`}
 >
 Invoice History
 </button>
 </div>

 {activeView === "generate" ? (
 <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
 <div className="xl:col-span-2 space-y-6">
 <section className="rounded-2xl bg-card border border-border p-6">
 <h2 className="text-sm font-semibold mb-4">Customer details</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <Field label="Full name">
 <input value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Customer name" className={inputCls} />
 </Field>
 <Field label="Email">
 <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@email.com" className={inputCls} />
 </Field>
 <Field label="Plan">
 <select value={plan} onChange={(e) => setPlan(e.target.value)} className={inputCls}>
 {planOptions.map((p) => <option key={p}>{p}</option>)}
 </select>
 </Field>
 <Field label="Due date">
 <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputCls} />
 </Field>
 </div>
 </section>

 <section className="rounded-2xl bg-card border border-border p-6">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-sm font-semibold">Line items</h2>
 <button
 onClick={() => setLines((ls) => [...ls, { desc: "", qty: 1, price: 0 }])}
 className="inline-flex items-center gap-1 text-xs font-medium px-3 h-[32px] rounded-md bg-primary/10 text-primary hover:bg-primary/20"
 >
 <Plus className="size-3.5" /> Add item
 </button>
 </div>
 <div className="space-y-2">
 {lines.map((l, i) => (
 <div key={i} className="grid grid-cols-12 gap-2">
 <input value={l.desc} onChange={(e) => update(i, { desc: e.target.value })} placeholder="Description" className={`${inputCls} col-span-6`} />
 <input type="number" min={1} value={l.qty} onChange={(e) => update(i, { qty: +e.target.value })} className={`${inputCls} col-span-2`} />
 <input type="number" step="0.01" value={l.price} onChange={(e) => update(i, { price: +e.target.value })} className={`${inputCls} col-span-3`} />
 <button
 onClick={() => setLines((ls) => ls.filter((_, idx) => idx !== i))}
 className="col-span-1 grid place-items-center rounded-lg bg-muted hover:bg-destructive/15 hover:text-destructive"
 >
 <Trash2 className="size-4" />
 </button>
 </div>
 ))}
 </div>
 </section>

 <section className="rounded-2xl bg-card border border-border p-6">
 <h2 className="text-sm font-semibold mb-3">Notes</h2>
 <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Optional message to the customer…" className={`${inputCls} resize-none`} />
 </section>
 </div>

 <aside className="space-y-4">
 <div className="rounded-2xl bg-card border border-border p-6 sticky top-6">
 <div className="flex items-center gap-2 mb-4">
 <div className="size-9 rounded-lg grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-rose)" }}>
 <FileText className="size-4" />
 </div>
 <div>
 <div className="text-sm font-semibold">Invoice Preview</div>
 <div className="text-xs text-muted-foreground">INV-2026-0143</div>
 </div>
 </div>
 <div className="space-y-1.5 text-sm">
 <Row label="Customer" value={customer || "—"} />
 <Row label="Plan" value={plan} />
 <Row label="Due" value={due} />
 </div>
 <div className="border-t border-border my-4" />
 <div className="space-y-1.5 text-sm">
 <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
 <Row label="Tax (8%)" value={`$${tax.toFixed(2)}`} />
 <div className="flex justify-between pt-2 mt-2 border-t border-border">
 <span className="font-semibold">Total</span>
 <span className="font-semibold text-lg">${total.toFixed(2)}</span>
 </div>
 </div>
 <button onClick={generateInvoice} className="w-full mt-5 inline-flex items-center justify-center gap-2 h-[44px] rounded-lg text-primary-foreground font-medium shadow-[var(--shadow-rose)]" style={{ background: "var(--gradient-rose)" }}>
 <Send className="size-4" /> Generate & Send
 </button>
 <button className="w-full mt-2 h-[40px] rounded-lg bg-muted text-sm font-medium hover:bg-secondary">
 Save as draft
 </button>
 </div>
 </aside>
 </div>
 ) : (
 <div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
 <SummaryCard label="Total Invoices" value={invoices.length.toString()} />
 <SummaryCard label="Collected" value={`$${totalPaid.toFixed(2)}`} />
 <SummaryCard label="Outstanding" value={`$${totalUnpaid.toFixed(2)}`} />
 </div>

 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
 <div className="flex items-center gap-2 flex-wrap">
 {historyTabs.map((t) => (
 <button
 key={t}
 onClick={() => setTab(t)}
 className={`px-4 h-[36px] rounded-lg text-sm font-medium transition-colors ${
 tab === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-secondary"
 }`}
 >
 {t}
 </button>
 ))}
 </div>
 <div className="relative w-full md:w-[17.778vw]">
 <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input
 value={q}
 onChange={(e) => setQ(e.target.value)}
 placeholder="Search invoice or user..."
 className="w-full h-[36px] pl-9 pr-3 rounded-lg bg-card border border-border text-sm outline-none focus:border-primary transition-colors"
 />
 </div>
 </div>

 <div className="rounded-2xl bg-card border border-border overflow-hidden">
 <table className="w-full text-sm">
 <thead className="bg-muted/60 text-muted-foreground">
 <tr>
 {["Invoice ID", "User", "Plan", "Amount", "Issued", "Status", ""].map((h) => (
 <th key={h} className="text-left font-medium px-5 py-3">{h}</th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {filtered.map((i) => (
 <tr key={i.id} className="hover:bg-muted/30 transition-colors">
 <td className="px-5 py-4 font-medium">{i.id}</td>
 <td className="px-5 py-4">{i.user}</td>
 <td className="px-5 py-4 text-muted-foreground">{i.plan}</td>
 <td className="px-5 py-4 font-medium">${i.amount.toFixed(2)}</td>
 <td className="px-5 py-4 text-muted-foreground">{i.issued}</td>
 <td className="px-5 py-4"><StatusBadge status={i.status} /></td>
 <td className="px-5 py-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <button className="size-8 rounded-lg grid place-items-center text-muted-foreground hover:bg-muted transition-colors">
 <Eye className="size-4" />
 </button>
 <button className="size-8 rounded-lg grid place-items-center text-muted-foreground hover:bg-muted transition-colors">
 <Download className="size-4" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 {filtered.length === 0 && (
 <tr>
 <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
 No invoices found matching your criteria.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </DashboardLayout>
 );
}

const inputCls = "h-[40px] px-3 rounded-lg bg-muted text-sm outline-none focus:ring-2 focus:ring-ring w-full";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
 return (
 <label className="block">
 <span className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</span>
 {children}
 </label>
 );
}

function Row({ label, value }: { label: string; value: string }) {
 return (
 <div className="flex justify-between">
 <span className="text-muted-foreground">{label}</span>
 <span className="font-medium">{value}</span>
 </div>
 );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
 return (
 <div className="rounded-2xl bg-card border border-border p-5">
 <div className="text-sm text-muted-foreground">{label}</div>
 <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
 </div>
 );
}
