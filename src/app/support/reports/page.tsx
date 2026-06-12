"use client";

import { useEffect, useState } from "react";
import { Flag, UserX, ShieldAlert, MailWarning, FileWarning, CheckCircle2 } from "lucide-react";
import { StatCard, PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { Progress } from "@/features/support/components/ui/progress";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const [mix, setMix] = useState<{ name: string; value: number }[]>([]);
  const [stats, setStats] = useState({ totalTickets: 0, resolvedToday: 0, openTickets: 0, escalated: 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    api.supportOverview()
      .then((data) => {
        setMix(data.complaintMix);
        setStats(data.stats);
      })
      .catch(() => setError("Failed to load support reports from backend."));
  }, []);

  const resolved = Math.max(stats.totalTickets - stats.openTickets - stats.escalated, 0);

  return (
    <div>
      <PageHeader title="Reports & Complaints" description="Live support report categories from database tickets." />
      {error && <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Reports" value={String(stats.totalTickets)} icon={Flag} tone="primary" />
        <StatCard label="Top Category" value={mix[0]?.name || "-"} icon={UserX} tone="destructive" />
        <StatCard label="Escalated" value={String(stats.escalated)} icon={ShieldAlert} tone="warning" />
        <StatCard label="Open" value={String(stats.openTickets)} icon={MailWarning} tone="info" />
        <StatCard label="Categories" value={String(mix.length)} icon={FileWarning} tone="primary" />
        <StatCard label="Resolved" value={String(resolved)} icon={CheckCircle2} tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 shadow-sm border-border/40">
          <CardHeader className="pb-4 border-b border-border/20 mb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Category Volume</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {mix.length === 0 ? <div className="py-8 text-center text-sm text-muted-foreground">No report categories yet.</div> : mix.map((b) => {
              const pct = stats.totalTickets ? Math.round((b.value / stats.totalTickets) * 100) : 0;
              return (
                <div key={b.name} className="space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground/80">{b.name}</span>
                    <span className="text-muted-foreground font-mono">{b.value}</span>
                  </div>
                  <Progress value={pct} className="h-1.5 bg-muted/50" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-border/40">
          <CardHeader className="pb-4 border-b border-border/20 mb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Report Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 pr-4 font-medium">Count</th>
                    <th className="py-2 font-medium">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {mix.length === 0 ? <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No support reports found.</td></tr> : mix.map((r) => (
                    <tr key={r.name} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4">{r.name}</td>
                      <td className="py-3 pr-4">{r.value}</td>
                      <td className="py-3">{stats.totalTickets ? `${Math.round((r.value / stats.totalTickets) * 100)}%` : "0%"}</td>
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
