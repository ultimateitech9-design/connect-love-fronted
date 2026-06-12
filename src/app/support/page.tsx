"use client";

import { useEffect, useState } from "react";
import { Ticket, CheckCircle2, Clock, AlertTriangle, Flag, Users, Smile, Timer } from "lucide-react";
import { StatCard, PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { api } from "@/lib/api";

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

type RecentTicket = { id: string; user: string; topic: string; priority: string; status: string };

export default function Overview() {
  const [stats, setStats] = useState({ totalTickets: 0, resolvedToday: 0, openTickets: 0, escalated: 0 });
  const [trend, setTrend] = useState<{ day: string; received: number; resolved: number }[]>([]);
  const [mix, setMix] = useState<{ name: string; value: number }[]>([]);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.supportOverview()
      .then((data) => {
        setStats(data.stats);
        setTrend(data.ticketTrend);
        setMix(data.complaintMix);
        setRecentTickets(data.recent.map((ticket) => ({
          id: `#${ticket.id}`,
          user: ticket.name,
          topic: ticket.subject,
          priority: ticket.status === "escalated" ? "High" : ticket.status === "open" ? "Medium" : "Low",
          status: ticket.status.replace(/\b\w/g, (c) => c.toUpperCase()),
        })));
      })
      .catch(() => setError("Failed to load support data from backend."));
  }, []);

  return (
    <div>
      <PageHeader title="Support Overview" description="Live support tickets from the database." />
      {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Tickets" value={String(stats.totalTickets)} icon={Ticket} delta="Live DB" tone="primary" />
        <StatCard label="Resolved Today" value={String(stats.resolvedToday)} icon={CheckCircle2} delta="Closed/resolved tickets" tone="success" />
        <StatCard label="Avg. Response" value="0m" icon={Timer} delta="No SLA data yet" tone="info" />
        <StatCard label="User Rating" value="0 / 5" icon={Smile} delta="No ratings yet" tone="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Tickets - Received vs Resolved</CardTitle></CardHeader>
          <CardContent className="h-72">
            {trend.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No ticket trend data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="rec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="res" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="received" stroke="var(--chart-1)" fill="url(#rec)" strokeWidth={2} />
                  <Area type="monotone" dataKey="resolved" stroke="var(--chart-5)" fill="url(#res)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Complaint Categories</CardTitle></CardHeader>
          <CardContent className="h-72">
            {mix.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No complaint categories yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mix} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {mix.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Tickets" value={String(stats.openTickets)} icon={Clock} tone="warning" />
        <StatCard label="Escalated" value={String(stats.escalated)} icon={AlertTriangle} tone="destructive" />
        <StatCard label="Active Reports" value={String(stats.openTickets + stats.escalated)} icon={Flag} tone="info" />
        <StatCard label="VIP Requests" value="0" icon={Users} tone="primary" />
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Recent Tickets</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Ticket</th>
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">Topic</th>
                  <th className="py-2 pr-4 font-medium">Priority</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No support tickets found.</td></tr>
                ) : recentTickets.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{r.id}</td>
                    <td className="py-3 pr-4">{r.user}</td>
                    <td className="py-3 pr-4">{r.topic}</td>
                    <td className="py-3 pr-4">{r.priority}</td>
                    <td className="py-3 font-medium">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
