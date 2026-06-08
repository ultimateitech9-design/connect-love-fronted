"use client";

import { Inbox, Timer, Hourglass, Smile, Repeat } from "lucide-react";
import { StatCard, PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";



const data = [
  { week: "W1", response: 3.2, resolution: 14, csat: 4.4 },
  { week: "W2", response: 2.9, resolution: 12, csat: 4.5 },
  { week: "W3", response: 2.6, resolution: 11, csat: 4.6 },
  { week: "W4", response: 2.4, resolution: 10, csat: 4.6 },
  { week: "W5", response: 2.2, resolution: 9.5, csat: 4.7 },
  { week: "W6", response: 2.1, resolution: 9, csat: 4.7 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="User Support Analytics" description="How fast and how well we respond to users." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Requests Received" value="4,218" icon={Inbox} delta="Last 30 days" tone="primary" />
        <StatCard label="Avg. Response Time" value="2m 14s" icon={Timer} delta="-18s WoW" tone="info" />
        <StatCard label="Avg. Resolution Time" value="9h 22m" icon={Hourglass} delta="-1h 10m WoW" tone="success" />
        <StatCard label="User Rating" value="4.7 / 5" icon={Smile} delta="1,204 ratings" tone="warning" />
        <StatCard label="Repeat Complaints" value="3.4%" icon={Repeat} delta="Within 30 days" tone="destructive" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Response & Resolution Time (min / h)</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
                <Line type="monotone" dataKey="response" stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="resolution" stroke="var(--chart-3)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">User Satisfaction Trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} domain={[4, 5]} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="csat" stroke="var(--chart-5)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}