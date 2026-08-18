"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, ExternalLink, Inbox, Loader2, Mail, MessageSquareWarning, Phone, RefreshCw, Search, UserRound } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { api } from "@/lib/api";

type Complaint = { id: number; name: string; email: string; phone?: string; photoDataUrl?: string; subject: string; message: string; status: string; createdAt: string };

const statusStyles: Record<string, string> = {
  open: "bg-amber-50 text-amber-700 ring-amber-200",
  reviewing: "bg-blue-50 text-blue-700 ring-blue-200",
  pending: "bg-blue-50 text-blue-700 ring-blue-200",
  escalated: "bg-rose-50 text-rose-700 ring-rose-200",
  resolved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-slate-100 text-slate-700 ring-slate-200",
};

const labelStatus = (status: string) => status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const rows = await api.supportTickets();
      setComplaints(rows.filter((row: Complaint) => String(row.status).toLowerCase() !== "newsletter"));
    } catch {
      setError("Complaints could not be loaded. Please check the backend connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadComplaints(); }, [loadComplaints]);

  const stats = useMemo(() => ({
    total: complaints.length,
    open: complaints.filter((item) => item.status === "open").length,
    escalated: complaints.filter((item) => item.status === "escalated").length,
    resolved: complaints.filter((item) => ["resolved", "closed"].includes(item.status)).length,
  }), [complaints]);

  const visibleComplaints = useMemo(() => {
    const term = search.trim().toLowerCase();
    return complaints.filter((item) => {
      const matchesStatus = filter === "all" || (filter === "resolved" ? ["resolved", "closed"].includes(item.status) : item.status === filter);
      const matchesSearch = !term || `${item.id} ${item.name} ${item.email} ${item.phone ?? ""} ${item.subject} ${item.message}`.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [complaints, filter, search]);

  const updateStatus = async (id: number, status: string) => {
    setUpdatingId(id);
    setError("");
    try {
      await api.updateTicketStatus(id, status);
      setComplaints((items) => items.map((item) => item.id === id ? { ...item, status } : item));
    } catch {
      setError("Complaint status could not be updated. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return <div>
    <PageHeader title="Complaints" description="Contact Us complaints shared with Support and Super Admin." />
    {error && <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}

    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Complaints" value={loading ? "..." : String(stats.total)} icon={MessageSquareWarning} tone="pink" />
      <StatCard label="Open" value={loading ? "..." : String(stats.open)} icon={Inbox} tone="amber" />
      <StatCard label="Escalated" value={loading ? "..." : String(stats.escalated)} icon={AlertTriangle} tone="violet" />
      <StatCard label="Resolved" value={loading ? "..." : String(stats.resolved)} icon={CheckCircle2} tone="blue" />
    </div>

    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, subject or message..." className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100" /></div>
        <div className="flex gap-2">
          <select value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none"><option value="all">All statuses</option><option value="open">Open</option><option value="reviewing">Reviewing</option><option value="escalated">Escalated</option><option value="resolved">Resolved</option></select>
          <button type="button" onClick={() => void loadComplaints()} disabled={loading} className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold hover:bg-muted disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</button>
        </div>
      </div>

      {loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Loading complaints...</div>
      : visibleComplaints.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center"><MessageSquareWarning className="mb-3 h-9 w-9 text-muted-foreground/50" /><p className="font-semibold">No complaints found</p><p className="mt-1 text-sm text-muted-foreground">New Contact Us submissions will appear here automatically.</p></div>
      : <div className="divide-y divide-border">{visibleComplaints.map((item) => <article key={item.id} className="p-4 transition hover:bg-muted/20 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><span className="font-mono text-xs font-bold text-rose-600">#{item.id}</span><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${statusStyles[item.status] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`}>{labelStatus(item.status)}</span><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{new Date(item.createdAt).toLocaleString()}</span></div>
            <h2 className="mt-2 break-words text-base font-bold">{item.subject}</h2><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{item.message}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4" />{item.name}</span><a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 hover:text-rose-600"><Mail className="h-4 w-4" />{item.email}</a>{item.phone && <a href={`tel:${item.phone}`} className="inline-flex items-center gap-1.5 hover:text-rose-600"><Phone className="h-4 w-4" />{item.phone}</a>}</div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row xl:w-64 xl:flex-col">
            {item.photoDataUrl && <a href={item.photoDataUrl} target="_blank" rel="noreferrer" className="group relative block h-28 w-28 overflow-hidden rounded-xl border border-border"><img src={item.photoDataUrl} alt={`Evidence for complaint ${item.id}`} className="h-full w-full object-cover transition group-hover:scale-105" /><span className="absolute bottom-1 right-1 rounded-md bg-black/65 p-1 text-white"><ExternalLink className="h-3.5 w-3.5" /></span></a>}
            <div className="flex flex-wrap gap-2"><button disabled={updatingId === item.id || item.status === "reviewing"} onClick={() => void updateStatus(item.id, "reviewing")} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 disabled:opacity-50">Review</button><button disabled={updatingId === item.id || item.status === "escalated"} onClick={() => void updateStatus(item.id, "escalated")} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 disabled:opacity-50">Escalate</button><button disabled={updatingId === item.id || ["resolved", "closed"].includes(item.status)} onClick={() => void updateStatus(item.id, "resolved")} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50">Resolve</button></div>
          </div>
        </div>
      </article>)}</div>}
    </section>
  </div>;
}
