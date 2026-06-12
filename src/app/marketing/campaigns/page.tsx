"use client";

import { useEffect, useState } from "react";
import { Plus, LayoutGrid, Rocket, Wallet, CircleDollarSign, TrendingUp, Trash2 } from "lucide-react";
import { api } from "@/lib/api";

type Campaign = { id: string; name: string; channel: string; status: string; audience: string; spend: number; conversions: number; roi: number };

export default function CampaignsPage() {
 const [campaigns, setCampaigns] = useState<Campaign[]>([]);
 const [error, setError] = useState("");

 useEffect(() => {
 api.marketingCampaigns().then((data) => setCampaigns(data.campaigns)).catch(() => setError("Failed to load campaigns from backend."));
 }, []);

 const active = campaigns.filter((c) => c.status === "active").length;
 const totalSpent = campaigns.reduce((sum, c) => sum + c.spend, 0);
 const conversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
 const avgRoi = campaigns.length ? (campaigns.reduce((sum, c) => sum + c.roi, 0) / campaigns.length).toFixed(1) : "0.0";

 const deleteCampaign = async (id: string) => {
 try { await api.deleteNotification(id); } catch {}
 setCampaigns((rows) => rows.filter((row) => row.id !== id));
 };

 return (
 <div className="min-h-screen bg-background text-foreground space-y-6">
 <div className="flex items-center justify-between flex-wrap gap-4 pb-2">
 <div><h1 className="text-3xl font-bold tracking-tight">Campaign Management</h1><p className="text-muted-foreground mt-1 text-sm">Live marketing campaigns from notification records</p></div>
 <button className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-pink-500/25 transition-all">
 <Plus className="h-[1.111vw] w-[1.111vw]" /> New Campaign
 </button>
 </div>
 {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <Kpi icon={LayoutGrid} label="Total Campaigns" value={String(campaigns.length)} />
 <Kpi icon={Rocket} label="Active Campaigns" value={String(active)} />
 <Kpi icon={Wallet} label="Total Spent" value={`$${totalSpent.toLocaleString()}`} />
 <Kpi icon={TrendingUp} label="Avg. ROI" value={avgRoi} />
 </div>

 <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
 <div className="p-6 border-b border-border/30 flex justify-between items-center"><h2 className="text-base font-semibold">All Campaigns</h2><div className="flex items-center gap-2 text-sm text-muted-foreground"><CircleDollarSign className="h-4 w-4" /> {conversions} conversions</div></div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-muted-foreground uppercase bg-background/30 border-b border-border/30">
 <tr><th className="px-6 py-4 font-medium">Campaign</th><th className="px-6 py-4 font-medium">Channel</th><th className="px-6 py-4 font-medium">Status</th><th className="px-6 py-4 font-medium">Audience</th><th className="px-6 py-4 font-medium">Spent</th><th className="px-6 py-4 font-medium">ROI</th><th className="px-6 py-4 font-medium text-right">Actions</th></tr>
 </thead>
 <tbody className="divide-y divide-border/30">
 {campaigns.length === 0 ? <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No campaigns found.</td></tr> : campaigns.map((c) => (
 <tr key={c.id} className="hover:bg-sidebar-accent/10 transition-colors">
 <td className="px-6 py-4 font-medium">{c.name}</td>
 <td className="px-6 py-4">{c.channel}</td>
 <td className="px-6 py-4">{c.status}</td>
 <td className="px-6 py-4">{c.audience}</td>
 <td className="px-6 py-4">${c.spend.toLocaleString()}</td>
 <td className="px-6 py-4">{c.roi.toFixed(1)}</td>
 <td className="px-6 py-4 text-right"><button onClick={() => deleteCampaign(c.id)} className="text-muted-foreground hover:text-red-500"><Trash2 className="h-[1.111vw] w-[1.111vw]" /></button></td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}

function Kpi({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
 return <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm"><div className="flex justify-between items-start"><div><p className="text-xs font-medium text-muted-foreground mb-1">{label}</p><h3 className="text-2xl font-bold">{value}</h3></div><div className="bg-pink-500/10 p-2.5 rounded-xl"><Icon className="h-[1.389vw] w-[1.389vw] text-pink-500" /></div></div></div>;
}
