"use client";

import { useEffect, useState } from "react";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Repeat, Users, TrendingUp, Filter } from "lucide-react";
import { api } from "@/lib/api";

export default function RetentionPage() {
 const [users, setUsers] = useState(0);
 const [premium, setPremium] = useState(0);
 const [error, setError] = useState("");

 useEffect(() => {
 api.users()
 .then((res) => {
 setUsers(res.users.length);
 setPremium(res.users.filter((u) => u.plan !== "free").length);
 })
 .catch(() => setError("Failed to load retention data from backend."));
 }, []);

 const rate = users ? Number(((premium / users) * 100).toFixed(1)) : 0;

 return (
 <>
 <PageHeader title="Retention" subtitle="Live retention proxy based on active premium users." />
 {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 <Kpi label="Total Users" value={String(users)} icon={Users} tint="rose" />
 <Kpi label="Premium Users" value={String(premium)} icon={Repeat} tint="gold" />
 <Kpi label="Premium Share" value={`${rate}%`} icon={TrendingUp} tint="coral" />
 <Kpi label="Churn Data" value="-" icon={Filter} tint="plum" />
 </div>
 <div className="mt-6"><Panel title="Retention Data"><div className="py-10 text-center text-sm text-muted-foreground">Cohort retention requires subscription renewal history. Current page uses live users only.</div></Panel></div>
 </>
 );
}
