"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { api } from "@/lib/api";

export default function HighPriorityPage() {
 const [tickets, setTickets] = useState<any[]>([]);
 const [error, setError] = useState("");
 useEffect(() => { api.supportTickets().then((rows) => setTickets(rows.filter((t: any) => ["open", "escalated"].includes(t.status)))).catch(() => setError("Failed to load high-priority tickets.")); }, []);
 return <div><PageHeader title="High Priority" description="Open and escalated live tickets." />{error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}<Card><CardHeader><CardTitle className="text-base">Priority Queue</CardTitle></CardHeader><CardContent>{tickets.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No high-priority tickets.</div> : tickets.map((t) => <div key={t.id} className="border-b border-border py-3 text-sm"><div className="font-medium">#{t.id} {t.subject}</div><div className="text-muted-foreground">{t.name} - {t.status}</div></div>)}</CardContent></Card></div>;
}
