"use client";

import { FlaskConical, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const experiments = [
  { name: "Premium CTA Copy", a: "See who liked you", b: "Unlock premium matches", winner: "A", lift: "+12.4%", status: "Winning" },
  { name: "Weekend Push Timing", a: "Friday 6 PM", b: "Saturday 11 AM", winner: "B", lift: "+8.1%", status: "Running" },
  { name: "Verified Badge Creative", a: "Trust badge icon", b: "Profile screenshot", winner: "A", lift: "+5.6%", status: "Complete" },
  { name: "Offer Discount", a: "10% off", b: "7-day trial", winner: "B", lift: "+15.2%", status: "Running" },
];

export default function ExperimentsPage() {
  const running = experiments.filter((item) => item.status === "Running").length;
  const best = experiments.reduce((top, item) => Number(item.lift.replace(/[^0-9.]/g, "")) > Number(top.lift.replace(/[^0-9.]/g, "")) ? item : top, experiments[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Experiments</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track A/B tests for marketing copy, creatives, timing, and offers.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi icon={FlaskConical} label="Running Tests" value={String(running)} />
        <Kpi icon={Trophy} label="Best Lift" value={best.lift} />
        <Kpi icon={TrendingUp} label="Winning Variant" value={`${best.name}: ${best.winner}`} />
      </div>
      <Card className="border-border/70 shadow-sm">
        <CardHeader><CardTitle className="text-base">Experiment Board</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {experiments.map((experiment) => (
            <div key={experiment.name} className="rounded-2xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{experiment.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">A: {experiment.a} • B: {experiment.b}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${experiment.status === "Running" ? "bg-blue-50 text-blue-700" : experiment.status === "Winning" ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-700"}`}>{experiment.status}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Winner</p>
                  <p className="mt-1 text-xl font-black text-rose-600">Variant {experiment.winner}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lift</p>
                  <p className="mt-1 text-xl font-black text-emerald-600">{experiment.lift}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="pt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="rounded-xl bg-rose-50 p-2 text-rose-500"><Icon className="h-5 w-5" /></div>
        </div>
        <p className="text-2xl font-black">{value}</p>
      </CardContent>
    </Card>
  );
}
