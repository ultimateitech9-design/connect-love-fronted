"use client";

import { useState } from "react";
import { Plus, Bell, LayoutGrid, Rocket, Wallet, CircleDollarSign, TrendingUp, MoreHorizontal, Heart, Crown, MapPin, PlaySquare, Users, Edit, Trash2, Eye, Filter } from "lucide-react";
import {
 RadialBarChart,
 RadialBar,
 ResponsiveContainer,
} from "recharts";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuLabel,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";

const campaignsData = [
 { 
 id: 1, 
 name: "Valentine's Week Offer", 
 status: "Active", 
 budget: 12000, 
 spent: 8400, 
 perf: 92,
 color: "hsl(340, 82%, 52%)",
 Icon: Heart
 },
 { 
 id: 2, 
 name: "Premium Membership Promotion", 
 status: "Active", 
 budget: 8000, 
 spent: 5200, 
 perf: 76,
 color: "hsl(260, 60%, 55%)",
 Icon: Crown
 },
 { 
 id: 3, 
 name: "New City Launch — Mumbai", 
 status: "Paused", 
 budget: 5000, 
 spent: 1800, 
 perf: 41,
 color: "hsl(30, 90%, 55%)",
 Icon: MapPin
 },
 { 
 id: 4, 
 name: "Weekend Boost Reels", 
 status: "Active", 
 budget: 4000, 
 spent: 3100, 
 perf: 88,
 color: "hsl(180, 70%, 45%)",
 Icon: PlaySquare
 },
 { 
 id: 5, 
 name: "Spring Singles Mixer", 
 status: "Completed", 
 budget: 6000, 
 spent: 6000, 
 perf: 100,
 color: "hsl(140, 60%, 50%)",
 Icon: Users
 },
];

const radialData = [
 { name: 'spent', value: 70, fill: 'hsl(340, 82%, 52%)' },
 { name: 'remaining', value: 100, fill: 'hsl(222, 47%, 20%)' } // Background track
];

export default function CampaignsPage() {
 const [campaigns] = useState(campaignsData);
 const [statusFilter, setStatusFilter] = useState("All");

 const filteredCampaigns = campaigns.filter(c => 
 statusFilter === "All" ? true : c.status === statusFilter
 );

 return (
 <div className="min-h-screen bg-background text-foreground space-y-6">
 {/* Top Header */}
 <div className="flex items-center justify-between flex-wrap gap-4 pb-2">
 <div>
 <h1 className="text-3xl font-bold text-white tracking-tight">Campaign Management</h1>
 <p className="text-muted-foreground mt-1 text-sm">Track, manage and optimize your marketing campaigns</p>
 </div>
 <div className="flex items-center gap-4">
 <button className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-pink-500/25 transition-all">
 <Plus className="h-[1.111vw] w-[1.111vw]" /> New Campaign
 </button>
 </div>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
 {/* Total Campaigns */}
 <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-xs font-medium text-muted-foreground mb-1">Total Campaigns</p>
 <h3 className="text-2xl font-bold text-white">5</h3>
 </div>
 <div className="bg-pink-500/10 p-2.5 rounded-xl">
 <LayoutGrid className="h-[1.389vw] w-[1.389vw] text-pink-500" />
 </div>
 </div>
 <p className="text-[11px] text-muted-foreground mt-4 flex items-center gap-1">
 <TrendingUp className="h-[0.833vw] w-[0.833vw] text-green-400" /> 
 <span className="text-green-400">↑ 25%</span> vs last month
 </p>
 </div>
 {/* Active Campaigns */}
 <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-xs font-medium text-muted-foreground mb-1">Active Campaigns</p>
 <h3 className="text-2xl font-bold text-white">3</h3>
 </div>
 <div className="bg-purple-500/10 p-2.5 rounded-xl">
 <Rocket className="h-[1.389vw] w-[1.389vw] text-purple-400" />
 </div>
 </div>
 <p className="text-[11px] text-muted-foreground mt-4 flex items-center gap-1">
 <TrendingUp className="h-[0.833vw] w-[0.833vw] text-green-400" /> 
 <span className="text-green-400">↑ 20%</span> vs last month
 </p>
 </div>
 {/* Total Budget */}
 <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-xs font-medium text-muted-foreground mb-1">Total Budget</p>
 <h3 className="text-2xl font-bold text-white">$35,000</h3>
 </div>
 <div className="bg-teal-500/10 p-2.5 rounded-xl">
 <Wallet className="h-[1.389vw] w-[1.389vw] text-teal-400" />
 </div>
 </div>
 <p className="text-[11px] text-muted-foreground mt-4 flex items-center gap-1">
 <TrendingUp className="h-[0.833vw] w-[0.833vw] text-green-400" /> 
 <span className="text-green-400">↑ 12%</span> vs last month
 </p>
 </div>
 {/* Total Spent */}
 <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-xs font-medium text-muted-foreground mb-1">Total Spent</p>
 <h3 className="text-2xl font-bold text-white">$24,500</h3>
 </div>
 <div className="bg-orange-500/10 p-2.5 rounded-xl">
 <CircleDollarSign className="h-[1.389vw] w-[1.389vw] text-orange-400" />
 </div>
 </div>
 <p className="text-[11px] text-muted-foreground mt-4 flex items-center gap-1">
 <TrendingUp className="h-[0.833vw] w-[0.833vw] text-red-400 rotate-180" /> 
 <span className="text-red-400">↓ 8%</span> vs last month
 </p>
 </div>
 {/* Avg Performance */}
 <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
 <div className="flex justify-between items-start">
 <div>
 <p className="text-xs font-medium text-muted-foreground mb-1">Avg. Performance</p>
 <h3 className="text-2xl font-bold text-white">72%</h3>
 </div>
 <div className="bg-green-500/10 p-2.5 rounded-xl">
 <TrendingUp className="h-[1.389vw] w-[1.389vw] text-green-400" />
 </div>
 </div>
 <p className="text-[11px] text-muted-foreground mt-4 flex items-center gap-1">
 <TrendingUp className="h-[0.833vw] w-[0.833vw] text-green-400" /> 
 <span className="text-green-400">↑ 15%</span> vs last month
 </p>
 </div>
 </div>

 <div className="grid lg:grid-cols-3 gap-6">
 {/* Campaign Overview - Custom Glowing Scatter Plot */}
 <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
 <h2 className="text-base font-semibold text-white mb-6">Campaign Overview</h2>
 <div className="relative h-[17.361vw] w-full mt-8 border-l border-b border-border/30">
 {/* Grid labels */}
 <span className="absolute -left-8 top-0 text-[10px] text-muted-foreground">High</span>
 <span className="absolute -left-8 bottom-0 text-[10px] text-muted-foreground">Low</span>
 <span className="absolute -left-[45px] top-[40%] -rotate-90 text-[10px] tracking-wider text-muted-foreground">Performance</span>
 
 <span className="absolute -bottom-6 left-0 text-[10px] text-muted-foreground">Low</span>
 <span className="absolute -bottom-6 right-0 text-[10px] text-muted-foreground">High</span>
 <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-wider text-muted-foreground">Spent</span>

 {/* Glowing connecting line */}
 <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
 <path 
 d="M 15% 20% Q 25% 60%, 35% 70% T 50% 15% T 70% 50% T 85% 30%" 
 fill="none" 
 stroke="rgba(255,255,255,0.1)" 
 strokeWidth="2" 
 strokeDasharray="4 4" 
 />
 </svg>

 {/* Nodes */}
 <div className="absolute top-[20%] left-[15%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
 <div className="h-[3.333vw] w-[3.333vw] rounded-full border border-pink-500/50 bg-pink-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)] relative group">
 <Heart className="h-[1.389vw] w-[1.389vw] text-pink-500" />
 <div className="absolute top-1/2 left-[120%] -translate-y-1/2 whitespace-nowrap opacity-100 z-10 pointer-events-none">
 <p className="text-xs font-semibold text-white leading-tight">Valentine's<br/>Week Offer</p>
 <p className="text-pink-500 font-bold text-sm">92%</p>
 </div>
 </div>
 </div>

 <div className="absolute top-[70%] left-[35%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
 <div className="h-[2.778vw] w-[2.778vw] rounded-full border border-orange-500/50 bg-orange-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] relative">
 <MapPin className="h-[1.111vw] w-[1.111vw] text-orange-400" />
 <div className="absolute top-1/2 left-[120%] -translate-y-1/2 whitespace-nowrap opacity-100 z-10">
 <p className="text-xs font-semibold text-white leading-tight">New City<br/>Launch — Mumbai</p>
 <p className="text-orange-400 font-bold text-sm">41%</p>
 </div>
 </div>
 </div>

 <div className="absolute top-[15%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
 <div className="h-[3.333vw] w-[3.333vw] rounded-full border border-purple-500/50 bg-purple-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.3)] relative">
 <Crown className="h-[1.389vw] w-[1.389vw] text-purple-400" />
 <div className="absolute top-1/2 left-[120%] -translate-y-1/2 whitespace-nowrap opacity-100 z-10">
 <p className="text-xs font-semibold text-white leading-tight">Premium Membership</p>
 <p className="text-purple-400 font-bold text-sm">76%</p>
 </div>
 </div>
 </div>

 <div className="absolute top-[50%] left-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
 <div className="h-[2.778vw] w-[2.778vw] rounded-full border border-green-500/50 bg-green-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)] relative">
 <Users className="h-[1.111vw] w-[1.111vw] text-green-400" />
 <div className="absolute top-[110%] left-1/2 -translate-x-1/2 whitespace-nowrap opacity-100 z-10 text-center mt-2">
 <p className="text-xs font-semibold text-white leading-tight">Spring Singles Mixer</p>
 <p className="text-green-400 font-bold text-sm">100%</p>
 </div>
 </div>
 </div>

 <div className="absolute top-[30%] left-[85%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
 <div className="h-[3.333vw] w-[3.333vw] rounded-full border border-teal-500/50 bg-teal-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.3)] relative">
 <PlaySquare className="h-[1.389vw] w-[1.389vw] text-teal-400" />
 <div className="absolute top-[110%] left-1/2 -translate-x-1/2 whitespace-nowrap opacity-100 z-10 text-center mt-2">
 <p className="text-xs font-semibold text-white leading-tight">Weekend Boost Reels</p>
 <p className="text-teal-400 font-bold text-sm">88%</p>
 </div>
 </div>
 </div>

 </div>

 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[10px] text-muted-foreground">
 <div className="flex items-center gap-1.5"><span className="h-[0.556vw] w-[0.556vw] rounded-full bg-green-400"></span> Excellent (80-100%)</div>
 <div className="flex items-center gap-1.5"><span className="h-[0.556vw] w-[0.556vw] rounded-full bg-purple-400"></span> Good (60-80%)</div>
 <div className="flex items-center gap-1.5"><span className="h-[0.556vw] w-[0.556vw] rounded-full bg-orange-400"></span> Average (40-60%)</div>
 <div className="flex items-center gap-1.5"><span className="h-[0.556vw] w-[0.556vw] rounded-full bg-pink-500"></span> Low (0-40%)</div>
 </div>
 </div>

 {/* Budget vs Spent Gauge */}
 <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
 <h2 className="text-base font-semibold text-white">Budget vs Spent</h2>
 
 <div className="h-[13.889vw] w-full relative mt-4">
 <ResponsiveContainer width="100%" height="100%">
 <RadialBarChart 
 cx="50%" 
 cy="80%" 
 innerRadius="110%" 
 outerRadius="140%" 
 barSize={20} 
 data={radialData}
 startAngle={180}
 endAngle={0}
 >
 <RadialBar
 background={false}
 dataKey="value"
 cornerRadius={10}
 />
 </RadialBarChart>
 </ResponsiveContainer>
 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
 <h2 className="text-4xl font-bold text-white tracking-tighter">70%</h2>
 <p className="text-[11px] text-muted-foreground uppercase tracking-widest mt-1">Budget Utilized</p>
 </div>
 </div>

 <div className="flex justify-between items-center border-t border-border/30 pt-4 mt-2">
 <div className="text-center">
 <h4 className="text-lg font-bold text-white">$24,500</h4>
 <p className="text-xs text-muted-foreground">Spent</p>
 </div>
 <div className="text-center">
 <h4 className="text-lg font-bold text-white">$35,000</h4>
 <p className="text-xs text-muted-foreground">Total Budget</p>
 </div>
 </div>
 
 <div className="mt-4 bg-background/50 rounded-xl p-3 text-center border border-border/20">
 <p className="text-sm text-white">You have <span className="text-pink-500 font-bold">$10,500</span> remaining</p>
 <p className="text-[10px] text-muted-foreground mt-0.5">30% of total budget</p>
 </div>
 </div>
 </div>

 {/* Campaigns Table */}
 <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
 <div className="p-6 border-b border-border/30 flex justify-between items-center">
 <h2 className="text-base font-semibold text-white">All Campaigns</h2>
 
 {/* Status Filter Dropdown */}
 <div className="w-[12.5vw]">
 <Select value={statusFilter} onValueChange={setStatusFilter}>
 <SelectTrigger className="h-[2.222vw] text-xs bg-background/50 border-border/50">
 <Filter className="w-[0.972vw] h-[0.972vw] mr-2 text-muted-foreground" />
 <SelectValue placeholder="Filter Status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="All">All Status</SelectItem>
 <SelectItem value="Active">Active</SelectItem>
 <SelectItem value="Paused">Paused</SelectItem>
 <SelectItem value="Completed">Completed</SelectItem>
 </SelectContent>
 </Select>
 </div>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-muted-foreground uppercase bg-background/30 border-b border-border/30">
 <tr>
 <th className="px-6 py-4 font-medium tracking-wider">Campaign</th>
 <th className="px-6 py-4 font-medium tracking-wider">Status</th>
 <th className="px-6 py-4 font-medium tracking-wider">Budget</th>
 <th className="px-6 py-4 font-medium tracking-wider">Spent</th>
 <th className="px-6 py-4 font-medium tracking-wider">Performance</th>
 <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border/30">
 {filteredCampaigns.map((c) => (
 <tr key={c.id} className="hover:bg-sidebar-accent/10 transition-colors">
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <div className="h-[2.222vw] w-[2.222vw] rounded-full flex items-center justify-center bg-background/50 border border-border/50" style={{ color: c.color, backgroundColor: `${c.color}15`, borderColor: `${c.color}40` }}>
 <c.Icon className="h-[1.111vw] w-[1.111vw]" />
 </div>
 <span className="font-medium text-white">{c.name}</span>
 </div>
 </td>
 <td className="px-6 py-4">
 <span className={`px-2.5 py-1 text-[11px] font-medium rounded-md bg-background/50 border
 ${c.status === 'Active' ? 'text-green-400 border-green-500/20' : 
 c.status === 'Paused' ? 'text-orange-400 border-orange-500/20' : 
 'text-blue-400 border-blue-500/20'}`}
 >
 {c.status}
 </span>
 </td>
 <td className="px-6 py-4 text-white">${c.budget.toLocaleString()}</td>
 <td className="px-6 py-4 text-white">${c.spent.toLocaleString()}</td>
 <td className="px-6 py-4">
 <div className="flex items-center gap-3">
 <span className="text-white font-medium w-[2.222vw]">{c.perf}%</span>
 <div className="w-full h-[0.417vw] bg-background rounded-full overflow-hidden">
 <div className="h-full rounded-full" style={{ width: `${c.perf}%`, backgroundColor: c.color }} />
 </div>
 </div>
 </td>
 <td className="px-6 py-4 text-right">
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <button className="text-muted-foreground hover:text-white p-1 rounded-md hover:bg-sidebar-accent/50 transition-colors">
 <MoreHorizontal className="h-[1.111vw] w-[1.111vw]" />
 </button>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[11.111vw] bg-card border-border/50">
 <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">Actions</DropdownMenuLabel>
 <DropdownMenuSeparator className="bg-border/30" />
 <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary">
 <Eye className="h-[1.111vw] w-[1.111vw]" /> View Details
 </DropdownMenuItem>
 <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary">
 <Edit className="h-[1.111vw] w-[1.111vw]" /> Edit Campaign
 </DropdownMenuItem>
 <DropdownMenuSeparator className="bg-border/30" />
 <DropdownMenuItem className="cursor-pointer gap-2 text-red-500 focus:bg-red-500/10 focus:text-red-500">
 <Trash2 className="h-[1.111vw] w-[1.111vw]" /> Delete
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </td>
 </tr>
 ))}
 {filteredCampaigns.length === 0 && (
 <tr>
 <td colSpan={6} className="text-center py-6 text-muted-foreground">
 No campaigns found.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
