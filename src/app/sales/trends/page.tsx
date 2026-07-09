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
  const [estimated, setEstimated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.salesTrends(), api.users(), api.salesPlans()])
      .then(([res, userRes, planRes]) => {
        if (res.monthly.length > 0) {
          setMonthly(res.monthly);
          setWeekly(res.weekly);
          setKpis(res.kpis);
          return;
        }

        const paidUsers = userRes.users.filter((user) => user.plan.toLowerCase() !== "free");
        const planPrice = (planKey: string) => {
          const normalized = planKey.toLowerCase();
          return planRes.plans.find((plan) =>
            plan.key?.toLowerCase() === normalized || plan.name.toLowerCase().includes(normalized)
          )?.price ?? 0;
        };
        const monthlyMap = new Map<string, { m: string; sales: number; date: number }>();
        const weeklyMap = new Map<string, { w: string; sales: number }>();
        const now = new Date();

        paidUsers.forEach((user) => {
          const joined = new Date(user.joined);
          if (Number.isNaN(joined.getTime())) return;
          const key = `${joined.getFullYear()}-${joined.getMonth()}`;
          const label = joined.toLocaleString("en-US", { month: "short", year: "2-digit" });
          const row = monthlyMap.get(key) ?? { m: label, sales: 0, date: joined.getTime() };
          row.sales += planPrice(user.plan);
          monthlyMap.set(key, row);

          if (joined.getMonth() === now.getMonth() && joined.getFullYear() === now.getFullYear()) {
            const week = `W${Math.ceil(joined.getDate() / 7)}`;
            const weekRow = weeklyMap.get(week) ?? { w: week, sales: 0 };
            weekRow.sales += planPrice(user.plan);
            weeklyMap.set(week, weekRow);
          }
        });

        const fallbackMonthly = [...monthlyMap.values()]
          .sort((a, b) => a.date - b.date)
          .map((row, index, rows) => ({
            m: row.m,
            sales: row.sales,
            growth: index > 0 && rows[index - 1].sales > 0
              ? Number((((row.sales - rows[index - 1].sales) / rows[index - 1].sales) * 100).toFixed(1))
              : 0,
          }));
        const fallbackWeekly = [...weeklyMap.values()].sort((a, b) => a.w.localeCompare(b.w));
        const currentMonthValue = fallbackWeekly.reduce((sum, row) => sum + row.sales, 0);

        setEstimated(true);
        setMonthly(fallbackMonthly);
        setWeekly(fallbackWeekly);
        setKpis({
          todaySales: 0,
          weekSales: fallbackWeekly.at(-1)?.sales ?? 0,
          monthSales: currentMonthValue,
          threeMonthGrowth: fallbackMonthly.slice(-3).reduce((sum, row) => sum + row.growth, 0),
        });
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
        <Panel
          title="Monthly Sales Trend"
          subtitle={estimated ? "Estimated subscription value from paid-user signup dates" : "Revenue (USD) from live payments"}
          action={estimated ? <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Estimated</span> : undefined}
        >
          <div className="h-80 w-full">
            {monthly.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No paid users or successful payments yet.</div>
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
