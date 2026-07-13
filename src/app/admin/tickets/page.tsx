"use client";
import { API_ORIGIN } from "@/config/runtime";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getManagementToken } from "@/lib/auth";
import { api } from "@/lib/api";

const API = API_ORIGIN;

export default function TicketsPage() {
 const [tickets, setTickets] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const token = getManagementToken();
 if (!token) {
 setLoading(false);
 return;
 }
 fetch(`${API}/admin/contacts`, { headers: { Authorization: `Bearer ${token}` } })
 .then((res) => res.ok ? res.json() : [])
 .then((data) => setTickets(Array.isArray(data) ? data : []))
 .finally(() => setLoading(false));
 }, []);

 const updateStatus = async (id: number, status: string) => {
 await api.updateTicketStatus(id, status);
 setTickets((rows) => rows.map((row) => row.id === id ? { ...row, status } : row));
 };

 return (
 <div className="space-y-6">
 <header>
 <h1 className="text-2xl font-semibold">Support tickets</h1>
 <p className="text-sm text-muted-foreground">Address complaints and check resolution status.</p>
 </header>
 <div className="space-y-3">
 {loading ? (
 <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">Loading tickets from database...</div>
 ) : tickets.length === 0 ? (
 <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">No support tickets found.</div>
 ) : tickets.map((t) => (
 <div key={t.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
 <div>
 <p className="font-medium">{t.subject}</p>
 <p className="text-xs text-muted-foreground">From {t.name} · {new Date(t.createdAt).toISOString().split("T")[0]}</p>
 </div>
 <div className="flex items-center gap-3">
 <span className={cn(
 "rounded-full px-3 py-1 text-xs font-medium capitalize",
 t.status === "open" && "bg-rose-100 text-rose-700",
 t.status === "reviewing" && "bg-amber-100 text-amber-700",
 t.status === "closed" && "bg-emerald-100 text-emerald-700",
 )}>{t.status}</span>
 <Button size="sm" variant="outline" onClick={() => updateStatus(t.id, "reviewing")}>Review</Button>
 <Button size="sm" onClick={() => updateStatus(t.id, "closed")}>Close</Button>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
