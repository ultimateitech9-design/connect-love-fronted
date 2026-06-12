'use client';

import { useState, useMemo, useEffect } from "react";
import { api } from "@/lib/api";
import { ScrollText, AlertCircle, AlertTriangle, ShieldAlert, XOctagon, Activity, Search, Filter, } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { PageHeader } from "@/components/admin/PageHeader";

type ActionFilter = "All" | "Success" | "Blocked";

interface LogEntry {
 user: string; activity: string; ip: string; device: string; time: string; action: string;
}

const actionStyles: Record<string, string> = {
 Success: "bg-emerald-50 text-emerald-700",
 Blocked: "bg-rose-50 text-rose-700",
};

export default function LogsPage() {
 const [searchQuery, setSearchQuery] = useState("");
 const [actionFilter, setActionFilter] = useState<ActionFilter>("All");
 const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
 const [loading, setLoading] = useState(true);
 const [logsError, setLogsError] = useState("");

 const fetchLogs = async () => {
 setLoading(true);
 setLogsError("");
 try {
 const res = await api.logs();
 setAllLogs(res.logs.map((l) => ({
 user: l.user,
 activity: l.activity,
 ip: l.ipAddress,
 device: "—",
 time: "—",
 action: l.action,
 })));
 } catch {
 setLogsError("Backend se logs load nahi hue.");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchLogs(); }, []);

 const filteredLogs = useMemo(() => {
 return allLogs.filter((log) => {
 const matchesSearch =
 !searchQuery.trim() ||
 log.user.toLowerCase().includes(searchQuery.toLowerCase().trim());
 const matchesAction = actionFilter === "All" || log.action === actionFilter;
 return matchesSearch && matchesAction;
 });
 }, [searchQuery, actionFilter]);

 const successCount = allLogs.filter((l) => l.action === "Success").length;
 const blockedCount = allLogs.filter((l) => l.action === "Blocked").length;

 return (
 <div>
 <PageHeader title="System Logs" description="Audit trail across the platform.">
 
 </PageHeader>

 {logsError && (
 <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm flex items-center gap-2">
 <AlertCircle className="h-4 w-4 shrink-0" /> {logsError}
 </div>
 )}

 {/* Stat Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
 <StatCard label="Total Logs" value="1.2M" icon={ScrollText} tone="pink" onClick={() => { setSearchQuery(""); setActionFilter("All"); }} />
 <StatCard label="Errors" value="142" icon={AlertCircle} tone="amber" />
 <StatCard label="Warnings" value="318" icon={AlertTriangle} tone="violet" />
 <StatCard label="Security" value="48" icon={ShieldAlert} tone="blue" />
 <StatCard label="Failed / Blocked" value={String(blockedCount)} icon={XOctagon} tone="pink" onClick={() => setActionFilter("Blocked")} />
 <StatCard label="Active Events" value="2,108" icon={Activity} tone="blue" />
 </div>

 {/* Search + Filter Bar */}
 <div className="flex flex-wrap items-center gap-3 mb-4">
 {/* Search */}
 <div className="relative w-full sm:w-[250px]">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
 <input
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by username..."
 className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary transition-colors"
 />
 </div>

 {/* Action Filter */}
 <div className="flex items-center gap-2">
 <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
 <Filter className="h-3.5 w-3.5" /> Action:
 </span>
 {(["All", "Success", "Blocked"] as const).map((f) => (
 <button
 key={f}
 onClick={() => setActionFilter(f)}
 className={
 "px-3 py-1.5 rounded-full text-xs font-medium border transition-all " +
 (actionFilter === f
 ? "bg-primary text-primary-foreground border-primary shadow-sm"
 : "bg-card text-foreground border-border hover:bg-accent")
 }
 >
 {f}
 </button>
 ))}
 </div>

 {/* Results count */}
 <span className="text-xs text-muted-foreground ml-auto">
 Showing {filteredLogs.length} of {allLogs.length} logs
 </span>

 {/* Clear */}
 {(searchQuery || actionFilter !== "All") && (
 <button
 onClick={() => { setSearchQuery(""); setActionFilter("All"); }}
 className="text-xs text-secondary font-medium hover:underline"
 >
 Clear filters
 </button>
 )}
 </div>

 {/* Logs Table */}
 <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-muted/60">
 <tr>
 {["User", "Activity", "IP Address", "Device", "Time", "Action"].map((col) => (
 <th key={col} className="text-left font-semibold text-foreground px-4 py-3 whitespace-nowrap">
 {col}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {loading ? (
 Array.from({ length: 5 }).map((_, i) => (
 <tr key={i} className="border-t border-border">
 {Array.from({ length: 6 }).map((__, j) => (
 <td key={j} className="px-4 py-3"><div className="h-5 rounded bg-muted animate-pulse" /></td>
 ))}
 </tr>
 ))
 ) : filteredLogs.map((log, i) => (
 <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
 <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{log.user}</td>
 <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{log.activity}</td>
 <td className="px-4 py-3 text-muted-foreground font-mono text-xs whitespace-nowrap">{log.ip}</td>
 <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{log.device}</td>
 <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{log.time}</td>
 <td className="px-4 py-3 whitespace-nowrap">
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${actionStyles[log.action]}`}>
 <span className="h-1.5 w-1.5 rounded-full bg-current" />
 {log.action}
 </span>
 </td>
 </tr>
 ))}
 {filteredLogs.length === 0 && (
 <tr>
 <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
 No logs found matching your search.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
