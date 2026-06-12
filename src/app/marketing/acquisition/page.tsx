"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

export default function AcquisitionPage() {
 const [rows, setRows] = useState<{ channel: string; value: number }[]>([]);
 const [trend, setTrend] = useState<{ day: string; spend: number; users: number }[]>([]);
 const [error, setError] = useState("");

 useEffect(() => {
 api.marketingOverview()
 .then((data) => {
 setRows(data.channelData);
 setTrend(data.spendTrend);
 })
 .catch(() => setError("Failed to load acquisition data from backend."));
 }, []);

 return (
 <div className="space-y-6">
 <div><h1 className="text-2xl font-bold tracking-tight">Acquisition</h1><p className="text-sm text-muted-foreground">Live acquisition channels from users, campaigns, and leads.</p></div>
 {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {rows.length === 0 ? <Card className="lg:col-span-4"><CardContent className="py-10 text-center text-sm text-muted-foreground">No acquisition data yet.</CardContent></Card> : rows.map((row) => (
 <Card key={row.channel}><CardHeader><CardTitle className="text-base">{row.channel}</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{row.value}</div></CardContent></Card>
 ))}
 </div>
 <Card><CardHeader><CardTitle className="text-base">Recent Acquisition Trend</CardTitle></CardHeader><CardContent className="space-y-2">
 {trend.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No trend data yet.</div> : trend.map((row) => <div key={row.day} className="flex justify-between border-b border-border py-2 text-sm"><span>{row.day}</span><span>{row.users} users</span></div>)}
 </CardContent></Card>
 </div>
 );
}
