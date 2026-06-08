"use client";

import { DollarSign, UserPlus, Megaphone, Target, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
 ResponsiveContainer,
 AreaChart,
 Area,
 XAxis,
 YAxis,
 Tooltip,
 CartesianGrid,
 BarChart,
 Bar,
} from "recharts";

const kpis = [
 { label: "Total Marketing Spend", value: "$48,250", delta: "+12.4%", icon: DollarSign },
 { label: "New Users Acquired", value: "12,847", delta: "+8.2%", icon: UserPlus },
 { label: "Active Campaigns", value: "7", delta: "2 launching", icon: Megaphone },
 { label: "Cost Per Acquisition", value: "$3.76", delta: "-4.1%", icon: Target },
 { label: "Conversion Rate", value: "6.8%", delta: "+1.3%", icon: TrendingUp },
];

const spendTrend = [
 { day: "Mon", spend: 4200, users: 980 },
 { day: "Tue", spend: 5100, users: 1240 },
 { day: "Wed", spend: 4800, users: 1180 },
 { day: "Thu", spend: 6200, users: 1620 },
 { day: "Fri", spend: 7400, users: 2010 },
 { day: "Sat", spend: 8200, users: 2380 },
 { day: "Sun", spend: 7100, users: 1980 },
];

const channelData = [
 { channel: "Instagram", value: 4200 },
 { channel: "Google", value: 2600 },
 { channel: "Facebook", value: 1900 },
 { channel: "Referral", value: 1400 },
];

export default function MarketingDashboard() {
 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
 <p className="text-sm text-muted-foreground">ConnectLove growth overview — last 7 days</p>
 </div>

 <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
 {kpis.map((k) => (
 <Card key={k.label} className="border-border/60">
 <CardContent className="pt-6">
 <div className="flex items-center justify-between mb-3">
 <div className="h-[2.5vw] w-[2.5vw] rounded-lg bg-primary/10 flex items-center justify-center">
 <k.icon className="h-[1.111vw] w-[1.111vw] text-primary" />
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
 <CardHeader>
 <CardTitle className="text-base">Spend vs New Users</CardTitle>
 </CardHeader>
 <CardContent className="h-[20vw]">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={spendTrend}>
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
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-base">Top Channels</CardTitle>
 </CardHeader>
 <CardContent className="h-[20vw]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={channelData} layout="vertical">
 <CartesianGrid strokeDasharray="3 3" stroke="hsl(345 30% 92%)" />
 <XAxis type="number" stroke="hsl(345 20% 50%)" fontSize={12} />
 <YAxis type="category" dataKey="channel" stroke="hsl(345 20% 50%)" fontSize={12} width={70} />
 <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(345 30% 90%)" }} />
 <Bar dataKey="value" fill="hsl(345 80% 65%)" radius={[0, 8, 8, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
