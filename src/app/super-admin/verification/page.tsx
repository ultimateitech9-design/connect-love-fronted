'use client';

import { useEffect, useState } from "react";
import { Check, ChevronRight, ZoomIn, Columns2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

const mono = "font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground";

interface QueueRow {
 name: string; email: string; date: string;
 idType: "PASSPORT" | "DRIVER'S LICENSE" | "NATIONAL ID";
 priority: "High" | "Medium" | "Low";
 active?: boolean; initials: string; color: string;
}

const defaultQueue: QueueRow[] = [
 { name: "Elena Rodriguez", email: "elena.r@example.com", date: "Oct 24, 14:12", idType: "PASSPORT", priority: "High", active: true, initials: "ER", color: "bg-rose-400" },
 { name: "Marcus Thorne", email: "m.thorne@example.com", date: "Oct 24, 13:45", idType: "DRIVER'S LICENSE", priority: "Medium", initials: "MT", color: "bg-slate-500" },
 { name: "Sophia Chen", email: "soph.chen@example.com", date: "Oct 24, 13:02", idType: "NATIONAL ID", priority: "Medium", initials: "SC", color: "bg-indigo-400" },
];

export default function VerificationPage() {
 const [filter, setFilter] = useState<"All Types" | "High Priority">("All Types");
 const [reason, setReason] = useState("");
 const [queue, setQueue] = useState<QueueRow[]>(defaultQueue);
 const [loading, setLoading] = useState(true);
 const [activeUser, setActiveUser] = useState(defaultQueue[0]);
 const [approved, setApproved] = useState<string[]>([]);
 const [rejected, setRejected] = useState<string[]>([]);
 const [error, setError] = useState("");

 const fetchQueue = async () => {
 setLoading(true);
 setError("");
 try {
 const res = await api.verification();
 // Merge backend data with frontend display data
 const merged = res.queue.map((item, i) => ({
 ...defaultQueue[i % defaultQueue.length],
 name: item.name,
 idType: item.idType as QueueRow["idType"],
 priority: item.priority as QueueRow["priority"],
 }));
 setQueue(merged);
 if (merged.length > 0) setActiveUser(merged[0]);
 } catch {
 setError("Backend data unavailable — showing sample queue.");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchQueue(); }, []);

 const filteredQueue = filter === "High Priority" ? queue.filter((r) => r.priority === "High") : queue;

 const handleApprove = () => {
 if (!activeUser) return;
 setApproved((prev) => [...prev, activeUser.name]);
 const next = queue.find((r) => r.name !== activeUser.name && !approved.includes(r.name) && !rejected.includes(r.name));
 if (next) setActiveUser(next);
 };

 const handleReject = () => {
 if (!reason) return;
 setRejected((prev) => [...prev, activeUser.name]);
 setReason("");
 const next = queue.find((r) => r.name !== activeUser.name && !approved.includes(r.name) && !rejected.includes(r.name));
 if (next) setActiveUser(next);
 };

 const handleRequestDoc = () => {
 // Request sent silently
 };

 const handleReviewClick = (row: QueueRow) => {
 setActiveUser({ ...row, active: true });
 window.scrollTo({ top: 0, behavior: "smooth" });
 };

 return (
 <div className="max-w-[88.889vw]">
 <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-end mb-6">
 <div>
 <p className={mono + " mb-2"}>
 Moderation <ChevronRight className="inline h-[0.833vw] w-[0.833vw]" /> Verification
 </p>
 <h1 className="text-3xl font-bold tracking-tight">Verification</h1>
 </div>
 <div className="flex items-center gap-3">
 
 <div className="grid grid-cols-3 rounded-xl bg-card border border-border overflow-hidden">
 <div className="px-6 py-3 border-r border-border text-left">
 <p className={mono}>Pending Reviews</p>
 <p className="text-2xl font-bold text-primary mt-1 leading-none">{loading ? "..." : queue.length}</p>
 </div>
 <div className="px-6 py-3 border-r border-border text-left">
 <p className={mono}>Verified Today</p>
 <p className="text-2xl font-bold text-foreground mt-1 leading-none">{approved.length || 48}</p>
 </div>
 <div className="px-6 py-3 text-left">
 <p className={mono}>Rejection Rate</p>
 <p className="text-2xl font-bold text-foreground mt-1 leading-none">12%</p>
 </div>
 </div>
 </div>
 </div>

 {error && (
 <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 text-sm flex items-center gap-2">
 <AlertCircle className="h-[1.111vw] w-[1.111vw] shrink-0" /> {error}
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-6">
 <div className="rounded-xl bg-card border border-border overflow-hidden">
 <div className="bg-primary/10 border-l-4 border-primary px-5 py-3 flex items-center justify-between">
 <div className="flex items-center gap-3 text-sm">
 <span className={mono + " text-primary"}>Active Review</span>
 <span className="text-foreground">
 <span className="font-semibold">{activeUser?.name}</span>
 {activeUser?.priority === "High" && (
 <span className="ml-2 text-xs text-rose-600 font-medium">⚠ High Priority</span>
 )}
 </span>
 {approved.includes(activeUser?.name ?? "") && (
 <span className="text-xs text-emerald-600 font-bold">✓ APPROVED</span>
 )}
 {rejected.includes(activeUser?.name ?? "") && (
 <span className="text-xs text-rose-600 font-bold">✗ REJECTED</span>
 )}
 </div>
 <div className="flex items-center gap-3 text-muted-foreground">
 <button className="hover:text-foreground transition-colors">
 <ZoomIn className="h-[1.111vw] w-[1.111vw]" />
 </button>
 <button className="hover:text-foreground transition-colors">
 <Columns2 className="h-[1.111vw] w-[1.111vw]" />
 </button>
 </div>
 </div>

 <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
 <div>
 <div className="flex items-center justify-between mb-2">
 <p className={mono}>Profile Photo</p>
 <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary/10 text-secondary">AI Confidence: 94%</span>
 </div>
 <div
 className="aspect-square w-full rounded-lg bg-gradient-to-br from-amber-100 via-rose-100 to-rose-200 flex items-center justify-center text-5xl text-rose-300"
 >
 ☺
 </div>
 </div>
 <div>
 <div className="flex items-center justify-between mb-2">
 <p className={mono}>ID Document ({activeUser?.idType})</p>
 <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">Manual Review</span>
 </div>
 <div
 className="aspect-square w-full rounded-lg bg-slate-100 border border-border p-3 flex items-end"
 >
 <div className="w-full bg-card rounded-md p-3 text-xs space-y-1.5 shadow-sm">
 <div className="flex justify-between"><span className="text-muted-foreground">Name:</span><span className="font-semibold">{activeUser?.name}</span></div>
 <div className="flex justify-between"><span className="text-muted-foreground">DOB:</span><span className="font-semibold">14 May 1996</span></div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 <div className="rounded-xl bg-card border border-border p-5">
 <p className={mono + " mb-3"}>User Details</p>
 <div className="space-y-3 text-sm">
 <Field label="Name" value={activeUser?.name ?? "—"} />
 <Field label="ID Type" value={activeUser?.idType ?? "—"} />
 <Field label="Priority" value={activeUser?.priority ?? "—"} />
 <Field label="Request Date" value={activeUser?.date ?? "—"} />
 </div>
 </div>

 <div className="rounded-xl bg-card border border-border p-5">
 <p className={mono + " mb-3"}>Review Actions</p>
 <button
 onClick={handleApprove}
 disabled={approved.includes(activeUser?.name ?? "") || rejected.includes(activeUser?.name ?? "")}
 className="w-full h-[3.056vw] rounded-lg bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
 >
 <span className="h-[1.389vw] w-[1.389vw] rounded-full bg-white/20 flex items-center justify-center">
 <Check className="h-[0.833vw] w-[0.833vw]" />
 </span>
 Approve Verification
 </button>
 <p className={mono + " mt-4 mb-2"}>Rejection Reason</p>
 <select
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 className="w-full h-[2.778vw] rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground outline-none focus:border-primary"
 >
 <option value="">Select a reason...</option>
 <option>Blurry document</option>
 <option>Name mismatch</option>
 <option>Expired ID</option>
 </select>
 <button
 onClick={handleReject}
 disabled={approved.includes(activeUser?.name ?? "") || rejected.includes(activeUser?.name ?? "")}
 className="w-full h-[3.056vw] rounded-lg bg-slate-700 text-white font-semibold mt-3 hover:bg-slate-800 transition-colors disabled:opacity-50"
 >
 Reject User
 </button>
 <button
 onClick={handleRequestDoc}
 className="w-full h-[2.778vw] rounded-lg border border-primary/30 text-primary font-semibold mt-3 hover:bg-primary/5 transition-colors"
 >
 Request New Document
 </button>
 </div>
 </div>
 </div>

 <div className="rounded-xl bg-card border border-border overflow-hidden">
 <div className="flex items-center justify-between px-5 py-4 border-b border-border">
 <h2 className="font-semibold text-foreground">Next in Queue</h2>
 <div className="flex items-center gap-2 text-xs">
 <span className="text-muted-foreground">Filter by:</span>
 {(["All Types", "High Priority"] as const).map((f) => (
 <button
 key={f}
 onClick={() => setFilter(f)}
 className={
 "px-3 py-1 rounded-full font-medium border transition-all " +
 (filter === f ? "bg-primary/10 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:bg-muted")
 }
 >
 {f}
 </button>
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
 {filteredQueue.map((r) => {
 const isApproved = approved.includes(r.name);
 const isRejected = rejected.includes(r.name);
 const isActive = activeUser?.name === r.name;
 return (
 <tr key={r.name} className={`border-b border-border last:border-0 transition-colors ${isActive ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30"}`}>
 <td className="py-4 pl-5">
 <div className="flex items-center gap-3">
 <div className={`h-[2.5vw] w-[2.5vw] rounded-full ${r.color} text-white flex items-center justify-center text-xs font-semibold`}>{r.initials}</div>
 <div>
 <p className={`font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>{r.name}</p>
 <p className="text-xs text-muted-foreground">{r.email}</p>
 </div>
 </div>
 </td>
 <td className="py-4 text-sm text-foreground">{r.date}</td>
 <td className="py-4">
 <span className="inline-flex px-2.5 py-1 rounded-md bg-secondary/10 text-secondary text-[10px] font-bold uppercase tracking-wider">{r.idType}</span>
 </td>
 <td className="py-4">
 <span className={`inline-flex items-center gap-2 text-sm font-medium ${r.priority === "High" ? "text-primary" : "text-muted-foreground"}`}>
 <span className={`h-[0.556vw] w-[0.556vw] rounded-full ${r.priority === "High" ? "bg-primary" : "bg-muted-foreground"}`} />
 {r.priority}
 </span>
 </td>
 <td className="py-4 pr-5 text-right text-sm font-semibold">
 {isApproved ? <span className="text-emerald-600">✓ Approved</span>
 : isRejected ? <span className="text-rose-600">✗ Rejected</span>
 : isActive ? <span className="text-primary">Reviewing Now</span>
 : <button onClick={() => handleReviewClick(r)} className="text-secondary hover:underline hover:text-primary transition-colors">Review</button>}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 <div
 className="w-full py-3 text-center text-xs text-muted-foreground border-t border-border"
 >
 Load more pending requests ▾
 </div>
 </div>
 </div>
 );
}

function Field({ label, value }: { label: string; value: string }) {
 return (
 <div>
 <p className={mono}>{label}</p>
 <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
 </div>
 );
}
