"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, ChevronDown, ArrowUp } from "lucide-react";

const trend = [
 { month: "Jan", users: 4126 }, { month: "Feb", users: 5812 },
 { month: "Mar", users: 6482 }, { month: "Apr", users: 7652 },
 { month: "May", users: 9102 }, { month: "Jun", users: 11847 },
];

const CustomLabel = (props: any) => {
 const { x, y, value, index } = props;
 if (index === trend.length - 1) {
 return (
 <g>
 <rect x={x - 24} y={y - 28} width={48} height={20} fill="#ec4899" rx={4} />
 <polygon points={`${x-4},${y-8} ${x+4},${y-8} ${x},${y-2}`} fill="#ec4899" />
 <text x={x} y={y - 14} fill="#fff" fontSize={11} fontWeight="bold" textAnchor="middle">{value.toLocaleString()}</text>
 </g>
 );
 }
 return <text x={x} y={y - 12} fill="hsl(var(--muted-foreground))" fontSize={11} fontWeight="500" textAnchor="middle">{value.toLocaleString()}</text>;
};

const sources = [
 { name: "Organic", value: 7200, color: "hsl(345 70% 75%)" },
 { name: "Paid", value: 4600, color: "hsl(345 85% 60%)" },
];

const channelBreakdown = [
 { name: "Instagram Ads", value: 2100, color: "hsl(330 80% 65%)" },
 { name: "Google Ads", value: 1000, color: "hsl(15 80% 70%)" },
 { name: "Referral", value: 900, color: "hsl(300 50% 75%)" },
 { name: "SEO", value: 6300, color: "hsl(345 30% 80%)" },
];

export default function AcquisitionPage() {
 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">User Acquisition</h1>
 <p className="text-sm text-muted-foreground">Where new ConnectLove members are coming from.</p>
 </div>

 <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
 <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">New Registrations</div><div className="text-2xl font-bold">11,847</div><div className="text-xs text-primary mt-1">+18.4% MoM</div></CardContent></Card>
 <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Organic Users</div><div className="text-2xl font-bold">7,200</div><div className="text-xs text-muted-foreground mt-1">No ads viewed</div></CardContent></Card>
 <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Paid Users</div><div className="text-2xl font-bold">4,647</div><div className="text-xs text-muted-foreground mt-1">Came via ads</div></CardContent></Card>
 <Card><CardContent className="pt-6"><div className="text-xs text-muted-foreground">Organic Share</div><div className="text-2xl font-bold">60.8%</div><div className="text-xs text-primary mt-1">Healthy mix</div></CardContent></Card>
 </div>

 <div className="grid gap-4 lg:grid-cols-3">
 <Card className="lg:col-span-2 flex flex-col justify-between">
 <CardHeader className="flex flex-row items-center justify-between pb-2">
 <CardTitle className="text-base flex items-center gap-2">
 <div className="p-1.5 rounded-md bg-pink-500/10 text-pink-500">
 <TrendingUp className="h-[1.111vw] w-[1.111vw]" />
 </div>
 Acquisition Trend
 </CardTitle>
 <div className="flex items-center gap-1 text-sm border border-border px-3 py-1.5 rounded-lg hover:bg-accent cursor-pointer transition-colors text-muted-foreground">
 Monthly <ChevronDown className="h-[1.111vw] w-[1.111vw]" />
 </div>
 </CardHeader>
 <CardContent className="h-[17.778vw] mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={trend} margin={{ top: 30, right: 20, left: -20, bottom: 0 }}>
 <defs>
 <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(val) => val === 0 ? '0' : `${val / 1000}K`} />
 <Tooltip cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "white" }} />
 <Area type="monotone" dataKey="users" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" dot={{ r: 4, fill: "#ec4899", strokeWidth: 2, stroke: "hsl(var(--card))" }} activeDot={{ r: 6, fill: "#ec4899", strokeWidth: 0 }} label={<CustomLabel />} />
 </AreaChart>
 </ResponsiveContainer>
 </CardContent>
 <div className="p-4 pt-0">
 <div className="bg-card border border-border/50 rounded-2xl p-4 flex items-center justify-between shadow-sm">
 <div className="flex items-center gap-4">
 <div className="h-[3.333vw] w-[3.333vw] rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
 <TrendingUp className="h-[1.667vw] w-[1.667vw]" />
 </div>
 <div className="flex flex-col">
 <span className="text-sm text-muted-foreground font-medium">Total New Users</span>
 <div className="flex items-baseline gap-3">
 <span className="text-2xl font-bold">44,021</span>
 <span className="text-sm text-emerald-500 font-medium flex items-center"><ArrowUp className="h-[0.833vw] w-[0.833vw] mr-0.5" /> 28.6% <span className="text-muted-foreground text-xs font-normal ml-2">vs Dec 01 - May 31</span></span>
 </div>
 </div>
 </div>
 <div className="w-px h-[2.778vw] bg-border/50 mx-4 hidden sm:block"></div>
 <div className="flex items-center gap-4 hidden sm:flex">
 <div className="flex flex-col">
 <span className="text-sm text-muted-foreground font-medium">Avg. Monthly Growth</span>
 <span className="text-2xl font-bold">15.3%</span>
 </div>
 <div className="flex items-end gap-1 h-[2.222vw] ml-2">
 <div className="w-[0.417vw] h-[0.833vw] bg-pink-500/40 rounded-full"></div>
 <div className="w-[0.417vw] h-[1.111vw] bg-pink-500/60 rounded-full"></div>
 <div className="w-[0.417vw] h-[1.389vw] bg-pink-500/80 rounded-full"></div>
 <div className="w-[0.417vw] h-[2.222vw] bg-pink-500 rounded-full"></div>
 </div>
 </div>
 </div>
 </div>
 </Card>

 <Card>
 <CardHeader className="pb-2">
 <CardTitle className="text-base flex items-center gap-2">
 <div className="p-1.5 rounded-md bg-pink-500/10 text-pink-500">
 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
 </div>
 Organic vs Paid
 </CardTitle>
 </CardHeader>
 <CardContent className="h-[17.778vw] flex items-center justify-between p-6 pt-0">
 <div className="relative w-1/2 h-full">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={sources} dataKey="value" nameKey="name" innerRadius={65} outerRadius={85} paddingAngle={4} stroke="none">
 {sources.map((s) => <Cell key={s.name} fill={s.color} />)}
 </Pie>
 <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(345 30% 90%)", background: "hsl(var(--card))", color: "white" }} />
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <span className="text-xs text-muted-foreground font-medium">Total Users</span>
 <span className="text-xl font-bold text-white">11,847</span>
 </div>
 </div>
 
 <div className="w-1/2 flex flex-col gap-6 justify-center pl-4">
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-2">
 <div className="w-[0.833vw] h-[0.833vw] rounded-full" style={{background: 'hsl(345 70% 75%)'}}></div>
 <span className="text-sm font-medium text-muted-foreground">Organic Users</span>
 </div>
 <span className="text-xl font-bold text-white ml-5">7,200 <span className="text-sm text-muted-foreground font-medium ml-1">(60.8%)</span></span>
 </div>
 <div className="flex flex-col gap-1">
 <div className="flex items-center gap-2">
 <div className="w-[0.833vw] h-[0.833vw] rounded-full" style={{background: 'hsl(345 85% 60%)'}}></div>
 <span className="text-sm font-medium text-muted-foreground">Paid Users</span>
 </div>
 <span className="text-xl font-bold text-white ml-5">4,647 <span className="text-sm text-muted-foreground font-medium ml-1">(39.2%)</span></span>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 <Card>
 <CardHeader><CardTitle className="text-base">Acquisition Sources</CardTitle></CardHeader>
 <CardContent>
 <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
 {channelBreakdown.map((c) => (
 <div key={c.name} className="rounded-xl border border-border p-4">
 <div className="h-[0.556vw] w-[3.333vw] rounded-full mb-3" style={{ background: c.color }} />
 <div className="text-xs text-muted-foreground">{c.name}</div>
 <div className="text-xl font-bold">{c.value.toLocaleString()}</div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
