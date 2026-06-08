import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays, CalendarRange, Megaphone, Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const reports = [
 { title: "Daily Report", desc: "Marketing performance for today", icon: Calendar, meta: "Today · auto-generated" },
 { title: "Weekly Report", desc: "Last 7 days roll-up across all channels", icon: CalendarDays, meta: "Week 23" },
 { title: "Monthly Report", desc: "Full month performance & spend breakdown", icon: CalendarRange, meta: "May 2026" },
 { title: "Campaigns Report", desc: "Per-campaign performance & ROI", icon: Megaphone, meta: "7 active campaigns" },
];

export default function ReportsPage() {
 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between flex-wrap gap-4 pb-2">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
 <p className="text-sm text-muted-foreground">Download marketing performance reports.</p>
 </div>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <Button className="gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-medium shadow-lg shadow-pink-500/25 transition-all">
 <Download className="h-[1.111vw] w-[1.111vw]" /> Export All <ChevronDown className="h-[1.111vw] w-[1.111vw] opacity-70" />
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[13.333vw] bg-card border-border/50">
 <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary">
 <FileText className="h-[1.111vw] w-[1.111vw] text-rose-500" /> Export as PDF
 </DropdownMenuItem>
 <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary">
 <FileSpreadsheet className="h-[1.111vw] w-[1.111vw] text-emerald-500" /> Export as CSV
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 {reports.map((r) => (
 <Card key={r.title} className="group hover:border-primary/40 transition-colors">
 <CardHeader className="flex flex-row items-start justify-between space-y-0">
 <div className="flex items-center gap-3">
 <div className="h-[3.056vw] w-[3.056vw] rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
 <r.icon className="h-[1.389vw] w-[1.389vw] text-primary" />
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
 <Download className="h-[1.111vw] w-[1.111vw]" /> Download
 </Button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[11.111vw] bg-card border-border/50">
 <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary">
 <FileText className="h-[1.111vw] w-[1.111vw] text-rose-500" /> PDF
 </DropdownMenuItem>
 <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary">
 <FileSpreadsheet className="h-[1.111vw] w-[1.111vw] text-emerald-500" /> CSV
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 );
}
