"use client";

import { ShieldAlert, MessageSquareWarning, UserMinus, Ban, ClipboardList, Gavel } from "lucide-react";
import { StatCard, PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { Badge } from "@/features/support/components/ui/badge";



const queue = [
  { user: "@user_3492", reason: "Sent abusive messages to 3 matches", action: "Suspend 7d", risk: "High" },
  { user: "@profile_777", reason: "Photo mismatch with verification selfie", action: "Re-verify", risk: "Medium" },
  { user: "@spam_bot_12", reason: "Bulk identical messages to 40+ users", action: "Ban", risk: "High" },
  { user: "@user_8821", reason: "Reported for fake age in bio", action: "Manual review", risk: "Low" },
  { user: "@kabir.r", reason: "Multiple match unmatches under 10s", action: "Watchlist", risk: "Low" },
];

const appeals = [
  { id: "APL-4421", user: "@neha.k", reason: "Ban appeal — disputes spam report", status: "In review" },
  { id: "APL-4419", user: "@arjun_b", reason: "Suspension appeal — false harassment claim", status: "Approved" },
  { id: "APL-4416", user: "@vikram_99", reason: "Photo rejection appeal", status: "Rejected" },
];

export default function TrustSafetyPage() {
  return (
    <div>
      <PageHeader title="Trust & Safety" description="Protecting the connectLove community from harm and abuse." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Flagged Profiles" value="318" icon={ShieldAlert} tone="warning" />
        <StatCard label="Flagged Msgs" value="1,204" icon={MessageSquareWarning} tone="info" />
        <StatCard label="Suspended" value="87" icon={UserMinus} tone="destructive" />
        <StatCard label="Banned Users" value="42" icon={Ban} tone="destructive" />
        <StatCard label="Review Queue" value="156" icon={ClipboardList} tone="primary" />
        <StatCard label="Appeals Request" value="29" icon={Gavel} tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm border-border/40">
          <CardHeader className="pb-4 border-b border-border/20 mb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pending Review Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {queue.map((q, i) => (
                <div key={i} className="flex items-start justify-between rounded-lg border border-border/20 bg-black/20 p-3 transition-colors hover:bg-black/40">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{q.user}</span>
                      <Badge variant="outline" className={
                        q.risk === "High" ? "border-destructive/40 text-destructive"
                        : q.risk === "Medium" ? "border-[color:var(--warning)]/40 text-[color:var(--warning)]"
                        : "border-border text-muted-foreground"
                      }>{q.risk} risk</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{q.reason}</p>
                  </div>
                  <button className="rounded-md bg-white/5 border border-white/10 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-all">
                    {q.action}
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40">
          <CardHeader className="pb-4 border-b border-border/20 mb-2">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Appeal Requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {appeals.map((a) => (
              <div key={a.id} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs">{a.id}</span>
                  <Badge className={
                    a.status === "Approved" ? "bg-[color:var(--success)]/15 text-[color:var(--success)]"
                    : a.status === "Rejected" ? "bg-destructive/15 text-destructive"
                    : "bg-primary/15 text-primary"
                  }>{a.status}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium">{a.user}</p>
                <p className="text-xs text-muted-foreground">{a.reason}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}