"use client";

import {
  Ticket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flag,
  Users,
  Smile,
  Timer,
} from "lucide-react";
import { StatCard, PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { Badge } from "@/features/support/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const ticketTrend = [
  { day: "Mon", received: 120, resolved: 95 },
  { day: "Tue", received: 145, resolved: 130 },
  { day: "Wed", received: 160, resolved: 140 },
  { day: "Thu", received: 130, resolved: 125 },
  { day: "Fri", received: 180, resolved: 150 },
  { day: "Sat", received: 95, resolved: 100 },
  { day: "Sun", received: 80, resolved: 90 },
];

const complaintMix = [
  { name: "Fake Profiles", value: 38 },
  { name: "Spam", value: 24 },
  { name: "Harassment", value: 22 },
  { name: "Payment Issues", value: 16 },
];
const pieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

const recent = [
  { id: "#48291", user: "priya_22", topic: "Payment failed", priority: "High", status: "Open" },
  { id: "#48288", user: "rahul.dev", topic: "Fake profile report", priority: "High", status: "Escalated" },
  { id: "#48285", user: "anya_singh", topic: "Cannot login", priority: "Medium", status: "Pending" },
  { id: "#48280", user: "vikram_99", topic: "Refund request", priority: "Low", status: "Resolved" },
  { id: "#48276", user: "neha.k", topic: "Profile verification", priority: "Medium", status: "Open" },
];

export default function Overview() {
  return (
    <div>
      <PageHeader
        title="Support Overview"
        description="Pulse of the connectLove support operation — today at a glance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Tickets" value="12,847" icon={Ticket} delta="+8.2% this week" tone="primary" />
        <StatCard label="Resolved Today" value="342" icon={CheckCircle2} delta="92% within SLA" tone="success" />
        <StatCard label="Avg. Response" value="2m 14s" icon={Timer} delta="-18s vs last week" tone="info" />
        <StatCard label="User Rating" value="4.7 / 5" icon={Smile} delta="Based on 1,204 ratings" tone="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Tickets — Received vs Resolved</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ticketTrend}>
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
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Area type="monotone" dataKey="received" stroke="var(--chart-1)" fill="url(#rec)" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" stroke="var(--chart-5)" fill="url(#res)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaint Categories</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complaintMix} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {complaintMix.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open Tickets" value="486" icon={Clock} tone="warning" />
        <StatCard label="Escalated" value="37" icon={AlertTriangle} tone="destructive" />
        <StatCard label="Active Reports" value="219" icon={Flag} tone="info" />
        <StatCard label="VIP Requests" value="14" icon={Users} tone="primary" />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Recent Tickets</CardTitle>
        </CardHeader>
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
                {recent.map((r) => (
                  <tr key={r.id} className="border-b border-border/40 last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{r.id}</td>
                    <td className="py-3 pr-4">@{r.user}</td>
                    <td className="py-3 pr-4">{r.topic}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          r.priority === "High"
                            ? "text-destructive"
                            : r.priority === "Medium"
                            ? "text-[color:var(--warning)]"
                            : "text-muted-foreground"
                        }
                      >
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={
                          r.status === "Resolved"
                            ? "text-[color:var(--success)] font-medium"
                            : r.status === "Escalated"
                            ? "text-destructive font-medium"
                            : r.status === "Pending"
                            ? "text-[color:var(--warning)] font-medium"
                            : "text-primary font-medium"
                        }
                      >
                        {r.status}
                      </span>
                    </td>
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
