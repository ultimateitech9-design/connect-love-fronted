'use client';

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, ChevronRight, FileText, X } from "lucide-react";
import { api } from "@/lib/api";

const mono = "font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";
const colors = ["bg-rose-400", "bg-slate-500", "bg-indigo-400", "bg-emerald-500", "bg-amber-500"];

interface QueueRow {
 id: string;
 name: string;
 email: string;
 date: string;
 idType: string;
 priority: "High" | "Normal" | "Low";
 status: string;
 initials: string;
 color: string;
 photo?: string | null;
 birthDate?: string | null;
 documents?: string[];
}

function initials(name: string) {
 return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(value?: string) {
 if (!value) return "-";
 const date = new Date(value);
 return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

export default function VerificationPage() {
 const [filter, setFilter] = useState<"All Types" | "High Priority">("All Types");
 const [reason, setReason] = useState("");
 const [queue, setQueue] = useState<QueueRow[]>([]);
 const [loading, setLoading] = useState(true);
 const [activeUser, setActiveUser] = useState<QueueRow | null>(null);
 const [approved, setApproved] = useState<string[]>([]);
 const [rejected, setRejected] = useState<string[]>([]);
 const [error, setError] = useState("");

 const fetchQueue = async () => {
 setLoading(true);
 setError("");
 try {
 const res = await api.verification();
 const rows = res.queue.map((item, i) => ({
 id: String(item.id),
 name: item.name,
 email: item.email || "",
 date: formatDate((item as any).date),
 idType: item.idType,
 priority: item.priority as QueueRow["priority"],
 status: item.status,
 initials: initials(item.name),
 color: colors[i % colors.length],
 photo: (item as any).photo || null,
 birthDate: (item as any).birthDate || null,
 documents: (item as any).documents || [],
 }));
 setQueue(rows);
 setActiveUser(rows[0] || null);
 } catch {
 setError("Backend data unavailable.");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchQueue(); }, []);

 const filteredQueue = useMemo(
 () => filter === "High Priority" ? queue.filter((r) => r.priority === "High") : queue,
 [filter, queue],
 );
 const rejectionRate = queue.length ? Math.round((rejected.length / queue.length) * 100) : 0;

 const moveNext = (current: QueueRow) => {
 const next = queue.find((r) => r.id !== current.id);
 setActiveUser(next || null);
 };

 const handleApprove = async () => {
 if (!activeUser) return;
 await api.updateVerification(activeUser.id, "approved");
 setApproved((prev) => [...prev, activeUser.name]);
 setQueue((rows) => rows.filter((row) => row.id !== activeUser.id));
 moveNext(activeUser);
 };

 const handleReject = async () => {
 if (!activeUser) return;
 await api.updateVerification(activeUser.id, "rejected");
 setRejected((prev) => [...prev, activeUser.name]);
 setQueue((rows) => rows.filter((row) => row.id !== activeUser.id));
 setReason("");
 moveNext(activeUser);
 };

 return (
 <div className="w-full">
 <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end mb-6">
 <div>
 <p className={mono + " mb-2"}>Moderation <ChevronRight className="inline h-3 w-3" /> Verification</p>
 <h1 className="text-3xl font-bold tracking-tight">Verification</h1>
 </div>
 <div className="grid grid-cols-3 rounded-xl bg-card border border-border overflow-hidden">
 <Metric label="Pending Reviews" value={loading ? "..." : String(queue.length)} />
 <Metric label="Verified Today" value={String(approved.length)} />
 <Metric label="Rejection Rate" value={`${rejectionRate}%`} />
 </div>
 </div>

 {error && (
 <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 text-sm flex items-center gap-2">
 <AlertCircle className="h-4 w-4 shrink-0" /> {error}
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-6">
 <section className="rounded-xl bg-card border border-border overflow-hidden">
 <div className="bg-primary/10 border-l-4 border-primary px-5 py-3 flex items-center justify-between">
 <div className="flex items-center gap-3 text-sm">
 <span className={mono + " text-primary"}>Active Review</span>
 <span className="font-semibold text-foreground">{activeUser?.name || "No pending request"}</span>
 </div>
 </div>

 <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
 <Preview title="Profile Photo">
 {activeUser?.photo ? <img src={activeUser.photo} alt={activeUser.name} className="h-full w-full object-cover rounded-lg" /> : <EmptyPreview />}
 </Preview>
 <Preview title={`ID Document${activeUser?.idType ? ` (${activeUser.idType})` : ""}`}>
 {activeUser?.documents?.[0] ? (
 <img src={activeUser.documents[0]} alt={`${activeUser.name} KYC frame`} className="h-full w-full object-cover rounded-lg" />
 ) : <EmptyPreview icon />}
 </Preview>
 </div>
 </section>

 <aside className="space-y-4">
 <div className="rounded-xl bg-card border border-border p-5">
 <p className={mono + " mb-3"}>User Details</p>
 <div className="space-y-3 text-sm">
 <Field label="Name" value={activeUser?.name ?? "-"} />
 <Field label="Email" value={activeUser?.email ?? "-"} />
 <Field label="ID Type" value={activeUser?.idType ?? "-"} />
 <Field label="Priority" value={activeUser?.priority ?? "-"} />
 <Field label="DOB" value={activeUser?.birthDate ? formatDate(activeUser.birthDate) : "-"} />
 <Field label="Request Date" value={activeUser?.date ?? "-"} />
 </div>
 </div>

 <div className="rounded-xl bg-card border border-border p-5">
 <p className={mono + " mb-3"}>Review Actions</p>
 <button onClick={handleApprove} disabled={!activeUser} className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50">
 <Check className="h-4 w-4" /> Approve Verification
 </button>
 <p className={mono + " mt-4 mb-2"}>Rejection Reason</p>
 <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground outline-none focus:border-primary">
 <option value="">Select a reason...</option>
 <option>Blurry document</option>
 <option>Name mismatch</option>
 <option>Expired ID</option>
 </select>
 <button onClick={handleReject} disabled={!activeUser} className="w-full h-10 rounded-lg bg-slate-700 text-white font-semibold mt-3 hover:bg-slate-800 transition-colors disabled:opacity-50">
 Reject User
 </button>
 </div>
 </aside>
 </div>

 <div className="rounded-xl bg-card border border-border overflow-hidden">
 <div className="flex items-center justify-between px-5 py-4 border-b border-border">
 <h2 className="font-semibold text-foreground">Next in Queue</h2>
 <div className="flex items-center gap-2 text-xs">
 {(["All Types", "High Priority"] as const).map((f) => (
 <button key={f} onClick={() => setFilter(f)} className={"px-3 py-1 rounded-full font-medium border transition-all " + (filter === f ? "bg-primary/10 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:bg-muted")}>{f}</button>
 ))}
 </div>
 </div>
 <table className="w-full">
 <thead>
 <tr className={"border-b border-border " + mono}>
 <th className="text-left py-3 pl-5 font-mono">User</th>
 <th className="text-left py-3 font-mono">Request Date</th>
 <th className="text-left py-3 font-mono">ID Type</th>
 <th className="text-left py-3 font-mono">Priority</th>
 <th className="text-right py-3 pr-5 font-mono">Status / Action</th>
 </tr>
 </thead>
 <tbody>
 {loading ? (
 <tr><td colSpan={5} className="py-10 text-center text-muted-foreground text-sm">Loading verification requests...</td></tr>
 ) : filteredQueue.length === 0 ? (
 <tr><td colSpan={5} className="py-10 text-center text-muted-foreground text-sm">No verification requests found.</td></tr>
 ) : filteredQueue.map((r) => {
 const isApproved = approved.includes(r.name);
 const isRejected = rejected.includes(r.name);
 const isActive = activeUser?.id === r.id;
 return (
 <tr key={r.id} className={`border-b border-border last:border-0 transition-colors ${isActive ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30"}`}>
 <td className="py-4 pl-5">
 <div className="flex items-center gap-3">
 <div className={`h-10 w-10 rounded-full ${r.color} text-white flex items-center justify-center text-xs font-semibold`}>{r.initials}</div>
 <div><p className={`font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>{r.name}</p><p className="text-xs text-muted-foreground">{r.email}</p></div>
 </div>
 </td>
 <td className="py-4 text-sm text-foreground">{r.date}</td>
 <td className="py-4"><span className="inline-flex px-2.5 py-1 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider">{r.idType}</span></td>
 <td className="py-4"><span className={`text-sm font-medium ${r.priority === "High" ? "text-primary" : "text-muted-foreground"}`}>{r.priority}</span></td>
 <td className="py-4 pr-5 text-right text-sm font-semibold">
 {isApproved ? <span className="text-emerald-600">Approved</span> : isRejected ? <span className="text-rose-600">Rejected</span> : isActive ? <span className="text-primary">Reviewing Now</span> : <button onClick={() => setActiveUser(r)} className="text-secondary hover:underline hover:text-primary transition-colors">Review</button>}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 );
}

function Metric({ label, value }: { label: string; value: string }) {
 return <div className="px-6 py-3 border-r border-border last:border-r-0 text-left"><p className={mono}>{label}</p><p className="text-2xl font-bold text-foreground mt-1 leading-none">{value}</p></div>;
}

function Field({ label, value }: { label: string; value: string }) {
 return <div><p className={mono}>{label}</p><p className="text-sm font-semibold text-foreground mt-0.5">{value}</p></div>;
}

function Preview({ title, children }: { title: string; children: React.ReactNode }) {
 return <div><p className={mono + " mb-2"}>{title}</p><div className="aspect-square w-full rounded-lg bg-muted border border-border p-3">{children}</div></div>;
}

function EmptyPreview({ icon = false }: { icon?: boolean }) {
 return <div className="h-full w-full rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground">{icon ? <FileText className="h-8 w-8" /> : <X className="h-8 w-8" />}</div>;
}
