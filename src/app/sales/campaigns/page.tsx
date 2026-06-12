"use client";

import { useEffect, useState } from "react";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Megaphone, Bell, Users, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";

export default function SalesCampaignsPage() {
 const [campaigns, setCampaigns] = useState<{ id: string; name: string; status: string; audience: string; spend: number; conversions: number; roi: number }[]>([]);
 const [error, setError] = useState("");

 useEffect(() => {
 api.marketingCampaigns()
 .then((res) => setCampaigns(res.campaigns))
 .catch(() => setError("Failed to load campaigns from backend."));
 }, []);

 const active = campaigns.filter((c) => c.status === "active").length;
 const conversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);

 return (
 <>
 <PageHeader title="Sales Campaigns" subtitle="Live campaigns from platform notification records." />
 {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 <Kpi label="Campaigns" value={String(campaigns.length)} icon={Megaphone} tint="rose" />
 <Kpi label="Active" value={String(active)} icon={Bell} tint="gold" />
 <Kpi label="Conversions" value={String(conversions)} icon={Users} tint="coral" />
 <Kpi label="Average ROI" value={campaigns.length ? (campaigns.reduce((s, c) => s + c.roi, 0) / campaigns.length).toFixed(1) : "0"} icon={TrendingUp} tint="plum" />
 </div>
 <div className="mt-6">
 <Panel title="Campaign Records">
 <div className="divide-y divide-border">
 {campaigns.length === 0 ? <div className="py-10 text-center text-sm text-muted-foreground">No campaigns found.</div> : campaigns.map((c) => (
 <div key={c.id} className="flex items-center justify-between py-3 text-sm"><div><div className="font-medium">{c.name}</div><div className="text-muted-foreground">{c.audience}</div></div><span>{c.status}</span></div>
 ))}
 </div>
 </Panel>
 </div>
 </>
 );
}
