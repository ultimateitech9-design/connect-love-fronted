'use client';

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { Send, Megaphone, CalendarClock, PauseCircle, Filter, Plus, Eye, Pencil, Trash2, AlertCircle, MoreVertical } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/admin/PageHeader";

type NotifStatus = "All" | "Active" | "Scheduled" | "Paused";

interface Campaign {
 name: string; type: string; audience: string; status: string; created: string;
}

const statusStyles: Record<string, string> = {
 Active: "text-emerald-500",
 Scheduled: "text-blue-500",
 Paused: "text-amber-500",
};

function ActionMenu() {
 const [isOpen, setIsOpen] = useState(false);
 const menuRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 function handleClickOutside(e: MouseEvent) {
 if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
 setIsOpen(false);
 }
 }
 if (isOpen) {
 document.addEventListener("mousedown", handleClickOutside);
 }
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [isOpen]);

 return (
 <div className="relative" ref={menuRef}>
 <button 
 onClick={() => setIsOpen(!isOpen)}
 className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors"
 >
 <MoreVertical className="h-4 w-4" />
 </button>
 {isOpen && (
 <div className="absolute left-0 top-full mt-1 w-32 bg-card rounded-xl shadow-lg border border-border z-50 py-1.5 overflow-hidden">
 <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-rose-500/10 hover:text-rose-400 text-rose-500 transition-colors">
 <Trash2 className="h-4 w-4" /> Delete
 </button>
 </div>
 )}
 </div>
 );
}

export default function NotificationsPage() {
 const [filter, setFilter] = useState<NotifStatus>("All");
 const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 const fetchCampaigns = async () => {
 setLoading(true);
 setError("");
 try {
 const res = await api.notifications();
 setAllCampaigns(res.notifications.map((n) => ({
 name: n.campaign,
 type: n.type,
 audience: n.audience,
 status: n.status,
 created: "—",
 })));
 } catch {
 setError("Failed to load notifications from backend. Is the backend server running?");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchCampaigns(); }, []);

 const filtered = filter === "All" ? allCampaigns : allCampaigns.filter((c) => c.status === filter);

 return (
 <div>
 <PageHeader title="Notifications" description="Campaigns and scheduled alerts.">
 <div className="flex items-center gap-2">
 
 <button
 className="h-10 px-4 rounded-lg text-primary-foreground font-medium text-sm flex items-center gap-2"
 style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-brand)" }}
 onClick={() => {}}
 >
 <Plus className="h-4 w-4" /> New Campaign
 </button>
 </div>
 </PageHeader>

 {error && (
 <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm flex items-center gap-2">
 <AlertCircle className="h-4 w-4 shrink-0" /> {error}
 </div>
 )}

 {/* Stat Cards - clickable */}
 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
 <StatCard label="Total Sent" value="284,920" icon={Send} tone="pink" onClick={() => setFilter("All")} />
 <StatCard label="Active Campaigns" value={loading ? "..." : String(allCampaigns.filter(c => c.status === "Active").length)} icon={Megaphone} tone="blue" onClick={() => setFilter("Active")} />
 <StatCard label="Scheduled" value={loading ? "..." : String(allCampaigns.filter(c => c.status === "Scheduled").length)} icon={CalendarClock} tone="violet" onClick={() => setFilter("Scheduled")} />
 <StatCard label="Paused" value={loading ? "..." : String(allCampaigns.filter(c => c.status === "Paused").length)} icon={PauseCircle} tone="amber" onClick={() => setFilter("Paused")} />
 </div>

 <div>
 {/* Campaign Table */}
 <div>
 {/* Status Filter */}
 <div className="flex flex-wrap gap-2 mb-4 items-center">
 <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
 <Filter className="h-3.5 w-3.5" /> Status:
 </span>
 {(["All", "Active", "Scheduled", "Paused"] as const).map((s) => (
 <button
 key={s}
 onClick={() => setFilter(s)}
 className={
 "px-3 py-1.5 rounded-full text-xs font-medium border transition-all " +
 (filter === s
 ? "bg-primary text-primary-foreground border-primary shadow-sm"
 : "bg-card text-foreground border-border hover:bg-accent")
 }
 >
 {s}
 </button>
 ))}
 </div>

 {/* Table */}
 <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-muted/60">
 <tr>
 {["Campaign", "Type", "Audience", "Status", "Created", "Actions"].map((col) => (
 <th key={col} className="text-left font-semibold text-foreground px-4 py-3 whitespace-nowrap">
 {col}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {loading ? (
 Array.from({ length: 3 }).map((_, i) => (
 <tr key={i} className="border-t border-border">
 {Array.from({ length: 6 }).map((__, j) => (
 <td key={j} className="px-4 py-3"><div className="h-5 rounded bg-muted animate-pulse" /></td>
 ))}
 </tr>
 ))
 ) : filtered.map((row, i) => (
 <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
 <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{row.name}</td>
 <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{row.type}</td>
 <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{row.audience}</td>
 <td className="px-4 py-3 whitespace-nowrap">
 <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${statusStyles[row.status]}`}>
 <span className="h-1.5 w-1.5 rounded-full bg-current" />
 {row.status}
 </span>
 </td>
 <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{row.created}</td>
 <td className="px-4 py-3 whitespace-nowrap">
 <ActionMenu />
 </td>
 </tr>
 ))}
 {filtered.length === 0 && (
 <tr>
 <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
 No campaigns found for this status.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
