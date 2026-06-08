"use client";

import { Flag, UserX, ShieldAlert, MailWarning, FileWarning, CheckCircle2 } from "lucide-react";
import { StatCard, PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { Badge } from "@/features/support/components/ui/badge";
import { Progress } from "@/features/support/components/ui/progress";



const buckets = [
  { label: "Fake Profile Reports", value: 184, total: 220, tone: "destructive" as const },
  { label: "Harassment Reports", value: 96, total: 130, tone: "warning" as const },
  { label: "Spam Reports", value: 142, total: 160, tone: "info" as const },
  { label: "Content Violations", value: 71, total: 95, tone: "primary" as const },
];

const recent = [
  { id: "CAT-01", type: "Spam", resolved: 1100, pending: 188, status: "Monitoring" },
  { id: "CAT-02", type: "Fake Profile", resolved: 650, pending: 192, status: "Critical" },
  { id: "CAT-03", type: "Harassment", resolved: 320, pending: 96, status: "High Priority" },
  { id: "CAT-04", type: "Content Violation", resolved: 350, pending: 44, status: "Under Control" },
];

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports & Complaints" description="What users are reporting and how we're acting on it." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Reports" value="3,142" icon={Flag} tone="primary" />
        <StatCard label="Fake Profiles" value="842" icon={UserX} tone="destructive" />
        <StatCard label="Harassment" value="416" icon={ShieldAlert} tone="warning" />
        <StatCard label="Spam" value="1,288" icon={MailWarning} tone="info" />
        <StatCard label="Violations" value="394" icon={FileWarning} tone="primary" />
        <StatCard label="Resolved" value="2,704" icon={CheckCircle2} delta="86%" tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 shadow-sm border-border/40">
          <CardHeader className="pb-4 border-b border-border/20 mb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Resolution Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {buckets.map((b) => {
              const pct = Math.round((b.value / b.total) * 100);
              return (
                <div key={b.label} className="space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground/80">{b.label}</span>
                    <span className="text-muted-foreground font-mono">{b.value}/{b.total}</span>
                  </div>
                  <Progress value={pct} className="h-1.5 bg-muted/50" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-border/40">
          <CardHeader className="pb-4 border-b border-border/20 mb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Category ID</th>
                    <th className="py-2 pr-4 font-medium">Type</th>
                    <th className="py-2 pr-4 font-medium">Resolved</th>
                    <th className="py-2 pr-4 font-medium">Pending</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs">{r.id}</td>
                      <td className="py-3 pr-4">{r.type}</td>
                      <td className="py-3 pr-4">{r.resolved}</td>
                      <td className="py-3 pr-4">{r.pending}</td>
                      <td className="py-3">{r.status}</td>
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