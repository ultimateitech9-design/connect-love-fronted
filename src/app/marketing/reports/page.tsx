"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, CalendarRange, Megaphone, Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";

const iconMap: Record<string, React.ElementType> = {
 daily: Calendar,
 users: CalendarDays,
 campaigns: Megaphone,
 leads: CalendarRange,
};

type Report = { title: string; desc: string; meta: string; type: string };

export default function ReportsPage() {
 const [reports, setReports] = useState<Report[]>([]);
 const [error, setError] = useState("");

 useEffect(() => {
 api.marketingReports()
 .then((res) => setReports(res.reports))
 .catch(() => setError("Failed to load marketing reports from backend."));
 }, []);

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between flex-wrap gap-4 pb-2">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
 <p className="text-sm text-muted-foreground">Live marketing performance report summaries.</p>
 </div>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-medium shadow-lg shadow-pink-500/25 transition-all">
 <Download className="h-[16px] w-[16px]" /> Export All <ChevronDown className="h-[16px] w-[16px] opacity-70" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[13.333vw] bg-card border-border/50">
 <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary">
 <FileText className="h-[16px] w-[16px] text-rose-500" /> Export as PDF
 </DropdownMenuItem>
 <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary">
 <FileSpreadsheet className="h-[16px] w-[16px] text-emerald-500" /> Export as CSV
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

 <div className="grid gap-4 sm:grid-cols-2">
 {reports.length === 0 ? (
 <Card className="sm:col-span-2"><CardContent className="py-10 text-center text-sm text-muted-foreground">No marketing report data yet.</CardContent></Card>
 ) : reports.map((r) => {
 const Icon = iconMap[r.type] || FileText;
 return (
 <Card key={r.title} className="group hover:border-primary/40 transition-colors">
 <CardHeader className="flex flex-row items-start justify-between space-y-0">
 <div className="flex items-center gap-3">
 <div className="h-[44px] w-[44px] rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
 <Icon className="h-[20px] w-[20px] text-primary" />
 </div>
 <div>
 <CardTitle className="text-base">{r.title}</CardTitle>
 <div className="text-xs text-muted-foreground mt-0.5">{r.meta}</div>
 </div>
 </div>
 </CardHeader>
 <CardContent className="flex items-end justify-between gap-4">
 <p className="text-sm text-muted-foreground">{r.desc}</p>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button variant="outline" size="sm" className="gap-2 shrink-0">
 <Download className="h-[16px] w-[16px]" /> Download
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[11.111vw] bg-card border-border/50">
 <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary">
 <FileText className="h-[16px] w-[16px] text-rose-500" /> PDF
 </DropdownMenuItem>
 <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary">
 <FileSpreadsheet className="h-[16px] w-[16px] text-emerald-500" /> CSV
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </CardContent>
 </Card>
 );
 })}
 </div>
 </div>
 );
}
