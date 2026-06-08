"use client";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { HeartCrack, HeartHandshake, Repeat, UserCheck } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";


const cohort = [
  { m: "M0", retained: 100 },
  { m: "M1", retained: 78 },
  { m: "M2", retained: 64 },
  { m: "M3", retained: 55 },
  { m: "M4", retained: 49 },
  { m: "M5", retained: 44 },
  { m: "M6", retained: 41 },
];

const churnVsRenew = [
  { m: "Jan", churn: 8.2, renewal: 76 },
  { m: "Feb", churn: 7.8, renewal: 77 },
  { m: "Mar", churn: 7.1, renewal: 78 },
  { m: "Apr", churn: 6.9, renewal: 79 },
  { m: "May", churn: 6.4, renewal: 80 },
  { m: "Jun", churn: 5.9, renewal: 82 },
];

export default function Retention() {
  return (
    <>
      <PageHeader
        title="Retention Metrics"
        subtitle="Love that lasts — how many subscribers stay, renew, and come back for another swipe."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Renewal Rate" value="82.1%" delta={2.3} icon={Repeat} tint="rose" />
        <Kpi label="Subscription Cancellations" value="5.9%" delta={-1.2} icon={HeartCrack} tint="plum" />
        <Kpi label="Returning Customers" value="6,420" delta={9.4} icon={UserCheck} tint="coral" />
        <Kpi label="Average Subscription Duration" value="9.2 mo" delta={4.1} icon={HeartHandshake} tint="gold" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="6-Month Cohort Retention" subtitle="Jan signup cohort, % retained" className="lg:col-span-2">
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <LineChart data={cohort}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 350)" />
                <XAxis dataKey="m" stroke="oklch(0.5 0.04 350)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.04 350)" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 350)" }} />
                <Line type="monotone" dataKey="retained" stroke="oklch(0.62 0.22 0)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Top Subscription Cancellation Reasons">
          <ul className="space-y-3 text-sm">
            {[
              { r: "Found a match 💕", pct: 38 },
              { r: "Too expensive", pct: 22 },
              { r: "Not enough matches", pct: 18 },
              { r: "Taking a break", pct: 14 },
              { r: "Other", pct: 8 },
            ].map((x) => (
              <li key={x.r}>
                <div className="mb-1 flex justify-between">
                  <span>{x.r}</span>
                  <span className="font-semibold tabular-nums">{x.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full" style={{ width: `${x.pct * 2}%`, background: "var(--gradient-sunset)" }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Renewal vs Subscription Cancellations (6 months)">
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <LineChart data={churnVsRenew}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 350)" />
                <XAxis dataKey="m" stroke="oklch(0.5 0.04 350)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.04 350)" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 350)" }} />
                <Legend />
                <Line type="monotone" dataKey="renewal" stroke="oklch(0.62 0.22 0)" strokeWidth={3} dot={{ r: 4 }} />
                <Line name="Subscription Cancellations" type="monotone" dataKey="churn" stroke="oklch(0.45 0.15 340)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}

