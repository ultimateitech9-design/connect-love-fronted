"use client";

import { DollarSign, UserPlus, Megaphone, Target, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

export default function MarketingDashboard() {
 const icons = [DollarSign, UserPlus, Megaphone, Target, TrendingUp];
 const [kpis, setKpis] = useState<{ label: string; value: string; delta: string; icon: React.ElementType }[]>([]);
 const [trend, setTrend] = useState<{ day: string; spend: number; users: number }[]>([]);
 const [channels, setChannels] = useState<{ channel: string; value: number }[]>([]);
 const [error, setError] = useState("");

 useEffect(() => {
 api.marketingOverview()
 .then((data) => {
 setKpis(data.kpis.map((item, index) => ({ ...item, icon: icons[index] || TrendingUp })));
 setTrend(data.spendTrend);
 setChannels(data.channelData);
 })
 .catch(() => setError("Failed to load marketing dashboard from backend."));
 }, []);

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
 <p className="text-sm text-muted-foreground">Live ConnectLove growth overview.</p>
 </div>
 {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

 <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
 {kpis.map((k) => (
 <Card key={k.label} className="border-border/60">
 <CardContent className="pt-6">
 <div className="flex items-center justify-between mb-3">
 <div className="h-[36px] w-[36px] rounded-lg bg-primary/10 flex items-center justify-center">
 <k.icon className="h-[16px] w-[16px] text-primary" />
 </div>
 <span className="text-xs font-medium text-primary">{k.delta}</span>
 </div>
 <div className="text-2xl font-bold">{k.value}</div>
 <div className="text-xs text-muted-foreground mt-1">{k.label}</div>
 </CardContent>
 </Card>
 ))}
 </div>

 <div className="grid gap-4 lg:grid-cols-3">
 <Card className="lg:col-span-2">
 <CardHeader><CardTitle className="text-base">Spend vs New Users</CardTitle></CardHeader>
 <CardContent className="h-[20vw]">
 {trend.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No marketing trend data yet.</div> : (
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={trend}>
 <defs>
 <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="hsl(345 80% 65%)" stopOpacity={0.5} />
 <stop offset="100%" stopColor="hsl(345 80% 65%)" stopOpacity={0} />
 </linearGradient>
 <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
 <stop offset="0%" stopColor="hsl(320 70% 70%)" stopOpacity={0.5} />
 <stop offset="100%" stopColor="hsl(320 70% 70%)" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="hsl(345 30% 92%)" />
 <XAxis dataKey="day" stroke="hsl(345 20% 50%)" fontSize={12} />
 <YAxis stroke="hsl(345 20% 50%)" fontSize={12} />
 <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(345 30% 90%)" }} />
 <Area type="monotone" dataKey="spend" stroke="hsl(345 80% 60%)" fill="url(#gSpend)" />
 <Area type="monotone" dataKey="users" stroke="hsl(320 70% 65%)" fill="url(#gUsers)" />
 </AreaChart>
 </ResponsiveContainer>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader><CardTitle className="text-base">Top Channels</CardTitle></CardHeader>
 <CardContent className="h-[20vw]">
 {channels.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No channel data yet.</div> : (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={channels} layout="vertical">
 <CartesianGrid strokeDasharray="3 3" stroke="hsl(345 30% 92%)" />
 <XAxis type="number" stroke="hsl(345 20% 50%)" fontSize={12} />
 <YAxis type="category" dataKey="channel" stroke="hsl(345 20% 50%)" fontSize={12} width={70} />
 <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(345 30% 90%)" }} />
 <Bar dataKey="value" fill="hsl(345 80% 65%)" radius={[0, 8, 8, 0]} />
 </BarChart>
 </ResponsiveContainer>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
