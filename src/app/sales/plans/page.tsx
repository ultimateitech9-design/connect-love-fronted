"use client";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Crown, Gem, Sparkles, Trophy } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";


const planMonthly = [
  { m: "Jan", Basic: 1820, Gold: 2100, Platinum: 740 },
  { m: "Feb", Basic: 1960, Gold: 2350, Platinum: 810 },
  { m: "Mar", Basic: 2100, Gold: 2540, Platinum: 980 },
  { m: "Apr", Basic: 2240, Gold: 2820, Platinum: 1110 },
  { m: "May", Basic: 2380, Gold: 3010, Platinum: 1260 },
  { m: "Jun", Basic: 2510, Gold: 3290, Platinum: 1420 },
];

export default function Plans() {
  return (
    <>
      <PageHeader
        title="Plan Performance"
        subtitle="Compare Basic, Gold and Platinum sales — and spot the plan members fall in love with."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Basic Plan Sales" value="12,510" delta={6.4} icon={Sparkles} tint="coral" />
        <Kpi label="Gold Plan Sales" value="18,290" delta={11.2} icon={Crown} tint="gold" />
        <Kpi label="Platinum Plan Sales" value="6,420" delta={18.7} icon={Gem} tint="plum" />
        <Kpi label="Most Purchased" value="Gold" icon={Trophy} tint="rose" />
      </div>

      <div className="mt-6 grid gap-6">
        <Panel 
          title="Monthly Plan Sales" 
          subtitle="Units sold per plan"
          action={
            <div className="flex items-center gap-4 text-xs font-medium text-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-[2px]" style={{ background: "oklch(0.85 0.18 30)" }} />
                <span>Basic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-[2px]" style={{ background: "oklch(0.75 0.22 0)" }} />
                <span>Gold</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-[2px]" style={{ background: "oklch(0.65 0.15 340)" }} />
                <span>Platinum</span>
              </div>
            </div>
          }
        >
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer>
              <BarChart data={planMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 350)" />
                <XAxis dataKey="m" stroke="oklch(0.5 0.04 350)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.04 350)" fontSize={12} />
                <Bar dataKey="Basic" fill="oklch(0.85 0.18 30)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Gold" fill="oklch(0.75 0.22 0)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Platinum" fill="oklch(0.65 0.15 340)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {[
          { name: "Basic", price: "$9.99", perks: ["Unlimited swipes", "5 super likes/day", "See who liked you"], tint: "var(--gradient-sunset)" },
          { name: "Gold", price: "$19.99", perks: ["Everything in Basic", "Unlimited rewinds", "Priority profile boost"], tint: "var(--gradient-love)" },
          { name: "Platinum", price: "$49.99", perks: ["Everything in Gold", "Message before match", "Top-pick placement"], tint: "linear-gradient(135deg, oklch(0.35 0.1 340), oklch(0.22 0.08 340))" },
        ].map((p) => (
          <div key={p.name} className="rounded-2xl border border-border bg-card p-6" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="inline-block rounded-full px-3 py-1 text-xs font-semibold text-white" style={{ background: p.tint }}>
              {p.name}
            </div>
            <div className="mt-4 font-display text-4xl font-bold">{p.price}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {p.perks.map((perk) => <li key={perk}>• {perk}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
