"use client";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Calendar, CalendarDays, CalendarRange, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Area,
  AreaChart,
} from "recharts";


const monthly = [
  { m: "Jan", sales: 142000, growth: 6 },
  { m: "Feb", sales: 168000, growth: 18 },
  { m: "Mar", sales: 181000, growth: 7.7 },
  { m: "Apr", sales: 197000, growth: 8.8 },
  { m: "May", sales: 224000, growth: 13.7 },
  { m: "Jun", sales: 258000, growth: 15.2 },
  { m: "Jul", sales: 281000, growth: 8.9 },
  { m: "Aug", sales: 312000, growth: 11.0 },
];

const weekly = [
  { w: "W1", sales: 58000 },
  { w: "W2", sales: 62100 },
  { w: "W3", sales: 71200 },
  { w: "W4", sales: 80700 },
];

export default function Trends() {
  return (
    <>
      <PageHeader
        title="Sales Trends"
        subtitle="Daily, weekly and monthly rhythm of love — and the growth curve behind it."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Today's Sales" value="$11,240" delta={4.1} icon={Calendar} tint="rose" />
        <Kpi label="This Week" value="$80,720" delta={13.4} icon={CalendarDays} tint="coral" />
        <Kpi label="This Month" value="$312k" delta={11.0} icon={CalendarRange} tint="gold" />
        <Kpi label="3-Month Growth" value="+18.6%" delta={2.4} icon={TrendingUp} tint="plum" />
      </div>

      <div className="mt-6 grid gap-6">
        <Panel title="Monthly Sales Trend" subtitle="Revenue (USD) over the last 8 months">
          <div className="h-80 w-full">
            <ResponsiveContainer>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.62 0.22 0)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.62 0.22 0)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 350)" />
                <XAxis dataKey="m" stroke="oklch(0.5 0.04 350)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.04 350)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 350)" }} />
                <Area type="monotone" dataKey="sales" stroke="oklch(0.62 0.22 0)" strokeWidth={3} fill="url(#trend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Weekly Sales (This Month)">
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 350)" />
                <XAxis dataKey="w" stroke="oklch(0.5 0.04 350)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.04 350)" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 350)" }} />
                <Line type="monotone" dataKey="sales" stroke="oklch(0.75 0.18 30)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Growth % vs Previous Month">
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 350)" />
                <XAxis dataKey="m" stroke="oklch(0.5 0.04 350)" fontSize={12} />
                <YAxis stroke="oklch(0.5 0.04 350)" fontSize={12} unit="%" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 350)" }} />
                <Legend />
                <Line type="monotone" dataKey="growth" stroke="oklch(0.45 0.15 340)" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}

