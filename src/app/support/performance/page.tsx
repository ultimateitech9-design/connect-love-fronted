"use client";

import { PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";



const recVsRes = [
  { m: "Jan", received: 920, resolved: 870 },
  { m: "Feb", received: 1040, resolved: 990 },
  { m: "Mar", received: 1180, resolved: 1120 },
  { m: "Apr", received: 1320, resolved: 1280 },
  { m: "May", received: 1410, resolved: 1390 },
  { m: "Jun", received: 1520, resolved: 1480 },
];

const complaintMix = [
  { name: "Fake Profiles", value: 38 },
  { name: "Spam", value: 24 },
  { name: "Harassment", value: 22 },
  { name: "Payment Issues", value: 16 },
  { name: "Login Issues", value: 14 },
  { name: "Subscription Issues", value: 10 },
];
const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-1)"];

const csat = [
  { m: "Jan", csat: 4.3 }, { m: "Feb", csat: 4.4 }, { m: "Mar", csat: 4.5 },
  { m: "Apr", csat: 4.6 }, { m: "May", csat: 4.65 }, { m: "Jun", csat: 4.7 },
];

const agents = [
  { name: "Aarav K.", resolved: 312, csat: 4.8, responseTime: "1m 12s" },
  { name: "Sneha P.", resolved: 298, csat: 4.7, responseTime: "1m 34s" },
  { name: "Rohan M.", resolved: 276, csat: 4.6, responseTime: "1m 55s" },
  { name: "Isha R.", resolved: 254, csat: 4.7, responseTime: "1m 40s" },
  { name: "Karan D.", resolved: 232, csat: 4.5, responseTime: "2m 10s" },
];

const escalation = [
  { m: "Jan", esc: 42 }, { m: "Feb", esc: 38 }, { m: "Mar", esc: 45 },
  { m: "Apr", esc: 36 }, { m: "May", esc: 31 }, { m: "Jun", esc: 28 },
];

export default function PerformancePage() {
  return (
    <div>
      <PageHeader title="Performance Report" description="How the support function is performing month over month." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Tickets Received vs Resolved</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recVsRes}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="received" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="resolved" fill="var(--chart-5)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Complaint Category Distribution</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={complaintMix} dataKey="value" innerRadius={55} outerRadius={95} paddingAngle={3} label>
                  {complaintMix.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>


        <Card>
          <CardHeader><CardTitle className="text-base">Escalation Trend</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={escalation}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="esc" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Agent Performance Comparison</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Agent</th>
                  <th className="py-2 pr-4 font-medium">Tickets Resolved (30d)</th>
                  <th className="py-2 pr-4 font-medium">Rating</th>
                  <th className="py-2 font-medium">Avg Response Time</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.name} className="border-b border-border/40 last:border-0">
                    <td className="py-3 pr-4 font-medium">{a.name}</td>
                    <td className="py-3 pr-4">{a.resolved}</td>
                    <td className="py-3 pr-4">{a.csat} / 5</td>
                    <td className="py-3">{a.responseTime}</td>
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