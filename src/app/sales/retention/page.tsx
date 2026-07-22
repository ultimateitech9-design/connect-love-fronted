"use client";

import { useEffect, useState } from "react";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Repeat, Users, TrendingUp, Filter } from "lucide-react";
import { api } from "@/lib/api";

type RetentionUser = Awaited<ReturnType<typeof api.users>>["users"][number];

export default function RetentionPage() {
 const [users, setUsers] = useState<RetentionUser[]>([]);
 const [error, setError] = useState("");

 useEffect(() => {
 api.users()
 .then((res) => {
 setUsers(res.users);
 })
 .catch(() => setError("Failed to load retention data from backend."));
 }, []);

 const premiumUsers = users.filter((user) => user.plan !== "free");
 const activePremium = premiumUsers.filter((user) => user.status.toLowerCase() === "active").length;
 const rate = users.length ? Number(((premiumUsers.length / users.length) * 100).toFixed(1)) : 0;
 const planRows = [
  { key: "free", label: "Free", tone: "bg-slate-100 text-slate-700" },
  { key: "gold", label: "Gold", tone: "bg-amber-100 text-amber-700" },
  { key: "platinum", label: "Diamond", tone: "bg-violet-100 text-violet-700" },
 ].map((plan) => {
  const members = users.filter((user) => user.plan.toLowerCase() === plan.key);
  return {
   ...plan,
   total: members.length,
   active: members.filter((user) => user.status.toLowerCase() === "active").length,
   verified: members.filter((user) => user.isVerified).length,
   share: users.length ? ((members.length / users.length) * 100).toFixed(1) : "0.0",
  };
 });

 return (
 <>
 <PageHeader title="Retention" subtitle="Live retention proxy based on active premium users." />
 {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 <Kpi label="Total Users" value={String(users.length)} icon={Users} tint="rose" />
 <Kpi label="Premium Users" value={String(premiumUsers.length)} icon={Repeat} tint="gold" />
 <Kpi label="Premium Share" value={`${rate}%`} icon={TrendingUp} tint="coral" />
 <Kpi label="Active Premium" value={String(activePremium)} icon={Filter} tint="plum" />
 </div>
 <div className="mt-6">
  <Panel title="Retention Data" subtitle="Live membership health grouped by subscription plan">
   <div className="overflow-x-auto">
    <table className="w-full min-w-[620px] text-sm">
     <thead>
      <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
       <th className="px-3 py-3 font-semibold">Plan</th>
       <th className="px-3 py-3 text-center font-semibold">Total Users</th>
       <th className="px-3 py-3 text-center font-semibold">Active</th>
       <th className="px-3 py-3 text-center font-semibold">Verified</th>
       <th className="px-3 py-3 text-right font-semibold">User Share</th>
      </tr>
     </thead>
     <tbody>
      {planRows.map((plan) => (
       <tr key={plan.key} className="border-b border-border last:border-0 hover:bg-muted/40">
        <td className="px-3 py-4">
         <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${plan.tone}`}>{plan.label}</span>
        </td>
        <td className="px-3 py-4 text-center font-semibold text-foreground">{plan.total}</td>
        <td className="px-3 py-4 text-center text-emerald-600">{plan.active}</td>
        <td className="px-3 py-4 text-center text-blue-600">{plan.verified}</td>
        <td className="px-3 py-4 text-right font-semibold text-foreground">{plan.share}%</td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>
  </Panel>
 </div>
 </>
 );
}
