"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { api } from "@/lib/api";

export default function CustomerSupportPage() {
 const [tickets, setTickets] = useState<any[]>([]);
 const [error, setError] = useState("");
 useEffect(() => { api.supportTickets().then(setTickets).catch(() => setError("Failed to load customer tickets.")); }, []);
 return <div><PageHeader title="Customer Support" description="Live customer support submissions." />{error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}<Card><CardHeader><CardTitle className="text-base">Customer Tickets</CardTitle></CardHeader><CardContent>{tickets.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No customer tickets found.</div> : tickets.map((t) => <div key={t.id} className="border-b border-border py-3 text-sm"><div className="font-medium">#{t.id} {t.subject}</div><div className="text-muted-foreground">{t.name} - {t.email} - {t.phone || "No phone"}</div><div className="mt-2 text-muted-foreground">{t.message}</div>{t.photoDataUrl && <img src={t.photoDataUrl} alt="Support ticket attachment" className="mt-3 h-24 w-24 rounded-lg object-cover" />}</div>)}</CardContent></Card></div>;
}
