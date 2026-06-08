"use client";

import { Flame, ArrowUpCircle, Briefcase, Crown } from "lucide-react";
import { StatCard, PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";
import { Badge } from "@/features/support/components/ui/badge";



const critical = [
  { id: "CR-1142", title: "Payment gateway downtime — UPI failures", impact: "1,200 users", status: "Investigating", owner: "Payments team" },
  { id: "CR-1140", title: "Mass harassment report from college campus", impact: "32 users", status: "Action taken", owner: "T&S team" },
  { id: "CR-1138", title: "Verification selfie OCR returning errors", impact: "210 users", status: "Patch deployed", owner: "Platform team" },
];

const escalated = [
  { id: "#48288", user: "@rahul.dev", topic: "Fake profile impersonation — public figure", level: "L3" },
  { id: "#48271", user: "@arjun_b", topic: "Repeated harassment despite suspension", level: "L2" },
  { id: "#48259", user: "@meera.j", topic: "Refund dispute — high value subscription", level: "L2" },
];

const vip = [
  { user: "@influencer_aanya", note: "Verified creator — login OTP not arriving", priority: "Within 1h" },
  { user: "@actor_dev_k", note: "Premium plus account upgrade request", priority: "Within 2h" },
  { user: "@brand_partner_mx", note: "Bulk profile verification for campaign", priority: "Same day" },
];

export default function HighPriorityPage() {
  return (
    <div>
      <PageHeader title="High Priority" description="Critical incidents, escalations, and VIP attention." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Critical Issues" value="3" icon={Flame} tone="destructive" />
        <StatCard label="Escalated Cases" value="37" icon={ArrowUpCircle} tone="warning" />
        <StatCard label="Management Review" value="8" icon={Briefcase} tone="info" />
        <StatCard label="VIP User Requests" value="14" icon={Crown} tone="primary" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Critical Issues</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {critical.map((c) => (
              <div key={c.id} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-destructive">{c.id}</span>
                  <Badge className="bg-destructive/15 text-destructive">{c.status}</Badge>
                </div>
                <p className="mt-1 font-semibold">{c.title}</p>
                <p className="text-xs text-muted-foreground">Impact: {c.impact} • Owner: {c.owner}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Escalated Cases</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {escalated.map((e) => (
              <div key={e.id} className="flex items-start justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <span className="font-mono text-xs">{e.id}</span>
                  <p className="font-medium">{e.topic}</p>
                  <p className="text-xs text-muted-foreground">{e.user}</p>
                </div>
                <Badge variant="outline" className="border-[color:var(--warning)]/40 text-[color:var(--warning)]">
                  {e.level}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">VIP User Requests</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {vip.map((v) => (
                <div key={v.user} className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{v.user}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{v.note}</p>
                  <p className="mt-2 text-xs font-semibold text-primary">SLA: {v.priority}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}