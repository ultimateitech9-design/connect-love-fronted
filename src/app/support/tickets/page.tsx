"use client";

import { Ticket, Inbox, CheckCircle2, Clock, AlertTriangle, Flame } from "lucide-react";
import { StatCard, PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { Badge } from "@/features/support/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";



const priorityData = [
  { name: "High", value: 142 },
  { name: "Medium", value: 268 },
  { name: "Low", value: 76 },
];

const queue = [
  { id: "#48291", user: "priya_22", subject: "Payment failed during Premium upgrade", priority: "High", status: "Open", age: "12m" },
  { id: "#48289", user: "kabir.r", subject: "Match disappeared after super-like", priority: "Medium", status: "Pending", age: "34m" },
  { id: "#48288", user: "rahul.dev", subject: "Reporting fake profile abuse", priority: "High", status: "Escalated", age: "1h" },
  { id: "#48285", user: "anya_singh", subject: "OTP not received on login", priority: "Medium", status: "Open", age: "2h" },
  { id: "#48280", user: "vikram_99", subject: "Refund for accidental subscription", priority: "Low", status: "Resolved", age: "3h" },
  { id: "#48277", user: "meera.j", subject: "Profile verification stuck for 3 days", priority: "Medium", status: "Pending", age: "5h" },
  { id: "#48271", user: "arjun_b", subject: "Inappropriate messages from match", priority: "High", status: "Escalated", age: "6h" },
];

export default function TicketsPage() {
  return (
    <div>
      <PageHeader title="Ticket Management" description="All support tickets and their current state." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Tickets" value="12,847" icon={Ticket} tone="primary" />
        <StatCard label="Open" value="486" icon={Inbox} tone="info" />
        <StatCard label="Resolved" value="11,892" icon={CheckCircle2} tone="success" />
        <StatCard label="Pending" value="432" icon={Clock} tone="warning" />
        <StatCard label="Escalated" value="37" icon={AlertTriangle} tone="destructive" />
        <StatCard label="High Priority" value="58" icon={Flame} tone="destructive" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="shadow-sm border-border/40">
          <CardHeader className="pb-4 border-b border-border/20 mb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Ticket Priority Split</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-border/40">
          <CardHeader className="pb-4 border-b border-border/20 mb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">ID</th>
                    <th className="py-2 pr-4 font-medium">Subject</th>
                    <th className="py-2 pr-4 font-medium">Priority</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium">Age</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((q) => (
                    <tr key={q.id} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">{q.id}</td>
                      <td className="py-3 pr-4">
                        <div className="font-medium">{q.subject}</div>
                        <div className="text-xs text-muted-foreground">@{q.user}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-semibold ${
                          q.priority === "High" ? "text-destructive"
                          : q.priority === "Medium" ? "text-[color:var(--warning)]"
                          : "text-muted-foreground"
                        }`}>{q.priority}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-semibold ${
                          q.status === "Resolved" ? "text-[color:var(--success)]"
                          : q.status === "Escalated" ? "text-destructive"
                          : q.status === "Pending" ? "text-[color:var(--warning)]"
                          : "text-primary"
                        }`}>{q.status}</span>
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{q.age}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}