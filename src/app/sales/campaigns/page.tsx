"use client";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Gift, Megaphone, Share2, Ticket } from "lucide-react";


const promos = [
  { code: "LOVE25", uses: 4820, rev: "$48,210", lift: "+18%" },
  { code: "VDAY50", uses: 3210, rev: "$32,100", lift: "+22%" },
  { code: "FRIEND10", uses: 2940, rev: "$18,400", lift: "+9%" },
  { code: "WELCOME", uses: 2110, rev: "$14,720", lift: "+6%" },
];

const campaigns = [
  { name: "Valentine's Flash", channel: "Instagram", spend: 12000, rev: 48200, roas: 4.0 },
  { name: "Premium Reactivation", channel: "Email", spend: 2400, rev: 19800, roas: 8.3 },
  { name: "Weekend Boost", channel: "Google Ads", spend: 9800, rev: 27300, roas: 2.8 },
];

export default function Campaigns() {
  return (
    <>
      <PageHeader
        title="Campaign Performance"
        subtitle="Referrals, promo codes and paid campaigns — see which sparks lit the fire."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Referral Sales" value="$84,210" delta={14.6} icon={Share2} tint="rose" />
        <Kpi label="Promo Code Revenue" value="$113,430" delta={9.2} icon={Ticket} tint="coral" />
        <Kpi label="Campaign Revenue" value="$157,400" delta={11.8} icon={Megaphone} tint="plum" />
        <Kpi label="Ad Return" value="4.6x" delta={0.4} icon={Gift} tint="gold" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Top Promo Codes" subtitle="By redemption volume">
          <div className="space-y-3">
            {promos.map((p) => (
              <div key={p.code} className="flex items-center gap-4 rounded-xl bg-secondary/40 p-4">
                <div className="rounded-lg border-2 border-dashed border-brand-rose px-3 py-1.5 font-mono text-sm font-bold text-brand-rose">
                  {p.code}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{p.uses.toLocaleString()} redemptions</div>
                  <div className="text-xs text-muted-foreground">{p.rev} in revenue</div>
                </div>
                <div className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">{p.lift}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Referral Program" subtitle="Members inviting members">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-5 text-white" style={{ background: "var(--gradient-love)" }}>
              <div className="text-xs uppercase tracking-wider opacity-80">Referrers</div>
              <div className="mt-2 font-display text-3xl font-bold">9,420</div>
            </div>
            <div className="rounded-xl p-5 text-white" style={{ background: "var(--gradient-sunset)" }}>
              <div className="text-xs uppercase tracking-wider opacity-90">New Signups</div>
              <div className="mt-2 font-display text-3xl font-bold">18,210</div>
            </div>
            <div className="col-span-2 rounded-xl bg-secondary/50 p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Avg. invites per referrer</div>
              <div className="mt-2 font-display text-2xl font-bold">1.93</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full" style={{ width: "64%", background: "var(--gradient-love)" }} />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Marketing Campaigns">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3">Campaign</th>
                  <th className="pb-3">Channel</th>
                  <th className="pb-3">Spend</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Ad Return</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {campaigns.map((c) => (
                  <tr key={c.name}>
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3 text-muted-foreground">{c.channel}</td>
                    <td className="py-3 tabular-nums">${c.spend.toLocaleString()}</td>
                    <td className="py-3 font-display font-semibold">${c.rev.toLocaleString()}</td>
                    <td className="py-3">
                      <span className="font-semibold text-brand-rose">{c.roas}x</span>
                    </td>
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
