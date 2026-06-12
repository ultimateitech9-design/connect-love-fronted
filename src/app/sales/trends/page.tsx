"use client";

import { useEffect, useState } from "react";
import { Kpi } from "@/features/sales/components/dashboard/Kpi";
import { Panel, PageHeader } from "@/features/sales/components/dashboard/Panel";
import { Calendar, CalendarDays, CalendarRange, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Area, AreaChart } from "recharts";
import { api } from "@/lib/api";

function money(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function Trends() {
  const [monthly, setMonthly] = useState<{ m: string; sales: number; growth: number }[]>([]);
  const [weekly, setWeekly] = useState<{ w: string; sales: number }[]>([]);
  const [kpis, setKpis] = useState({ todaySales: 0, weekSales: 0, monthSales: 0, threeMonthGrowth: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    api.salesTrends()
      .then((res) => {
        setMonthly(res.monthly);
        setWeekly(res.weekly);
        setKpis(res.kpis);
      })
      .catch(() => setError("Failed to load sales trends from backend."));
  }, []);

  return (
    <>
      <PageHeader title="Sales Trends" subtitle="Live revenue trend from successful payments." />
      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Today's Sales" value={money(kpis.todaySales)} delta={0} icon={Calendar} tint="rose" />
        <Kpi label="This Week" value={money(kpis.weekSales)} delta={0} icon={CalendarDays} tint="coral" />
        <Kpi label="This Month" value={money(kpis.monthSales)} delta={0} icon={CalendarRange} tint="gold" />
        <Kpi label="3-Month Growth" value={`${kpis.threeMonthGrowth.toFixed(1)}%`} delta={0} icon={TrendingUp} tint="plum" />
      </div>

      <div className="mt-6 grid gap-6">
        <Panel title="Monthly Sales Trend" subtitle="Revenue (USD) from live payments">
          <div className="h-80 w-full">
            {monthly.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No successful payments yet.</div>
            ) : (
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
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Weekly Sales (This Month)">
          <div className="h-64 w-full">
            {weekly.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No weekly payment data yet.</div>
            ) : (
              <ResponsiveContainer>
                <LineChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 350)" />
                  <XAxis dataKey="w" stroke="oklch(0.5 0.04 350)" fontSize={12} />
                  <YAxis stroke="oklch(0.5 0.04 350)" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.92 0.02 350)" }} />
                  <Line type="monotone" dataKey="sales" stroke="oklch(0.75 0.18 30)" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel title="Growth % vs Previous Month">
          <div className="h-64 w-full">
            {monthly.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No growth data yet.</div>
            ) : (
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
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
