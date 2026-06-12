"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { api } from "@/lib/api";

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-1)"];

export default function PerformancePage() {
  const [trend, setTrend] = useState<{ day: string; received: number; resolved: number }[]>([]);
  const [mix, setMix] = useState<{ name: string; value: number }[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.supportOverview()
      .then((data) => {
        setTrend(data.ticketTrend);
        setMix(data.complaintMix);
      })
      .catch(() => setError("Failed to load support performance from backend."));
  }, []);

  const escalation = trend.map((row) => ({ day: row.day, esc: Math.max(row.received - row.resolved, 0) }));

  return (
    <div>
      <PageHeader title="Performance Report" description="Live support performance based on database tickets." />
      {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Tickets Received vs Resolved</CardTitle></CardHeader>
          <CardContent className="h-72">
            {trend.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No ticket trend data yet.</div> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="received" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" fill="var(--chart-5)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Complaint Category Distribution</CardTitle></CardHeader>
          <CardContent className="h-72">
            {mix.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No complaint category data yet.</div> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mix} dataKey="value" innerRadius={55} outerRadius={95} paddingAngle={3} label>
                  {mix.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Unresolved Trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            {escalation.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No unresolved trend data yet.</div> : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={escalation}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="esc" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Agent Performance Comparison</CardTitle></CardHeader>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Agent-level performance data is not available until agent assignment is stored for tickets.
        </CardContent>
      </Card>
    </div>
  );
}
