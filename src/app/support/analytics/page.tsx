"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { api } from "@/lib/api";

export default function SupportAnalyticsPage() {
 const [trend, setTrend] = useState<{ day: string; received: number; resolved: number }[]>([]);
 const [error, setError] = useState("");

 useEffect(() => {
 api.supportOverview().then((res) => setTrend(res.ticketTrend)).catch(() => setError("Failed to load support analytics from backend."));
 }, []);

 return <div><PageHeader title="Support Analytics" description="Live support trend from tickets." />{error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}<Card><CardHeader><CardTitle className="text-base">Ticket Trend</CardTitle></CardHeader><CardContent>{trend.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No analytics data yet.</div> : trend.map((row) => <div key={row.day} className="flex justify-between border-b border-border py-2 text-sm"><span>{row.day}</span><span>{row.received} received / {row.resolved} resolved</span></div>)}</CardContent></Card></div>;
}
