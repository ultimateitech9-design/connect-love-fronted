"use client";

import { KeyRound, LogIn, CreditCard, Crown, BadgeCheck, Undo2 } from "lucide-react";
import { StatCard, PageHeader } from "@/features/support/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/features/support/components/ui/card";



const tasks = [
  { title: "Account Recovery", desc: "Users locked out of accounts — needs email/OTP verification.", count: 48 },
  { title: "Login Issues", desc: "OTP delays, social login failures and session bugs.", count: 132 },
  { title: "Payment Issues", desc: "Failed UPI, card declines, double charges.", count: 76 },
  { title: "Subscription Issues", desc: "Premium activation, plan changes, auto-renewal.", count: 54 },
  { title: "Profile Verification", desc: "Selfie verification, ID matching review queue.", count: 91 },
  { title: "Refund Requests", desc: "Accidental purchases and dispute follow-ups.", count: 27 },
];

export default function CustomerSupportPage() {
  return (
    <div>
      <PageHeader title="Customer Support" description="Day-to-day account, billing and verification help." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Account Recovery" value="48" icon={KeyRound} tone="primary" />
        <StatCard label="Login Issues" value="132" icon={LogIn} tone="info" />
        <StatCard label="Payment Issues" value="76" icon={CreditCard} tone="destructive" />
        <StatCard label="Subscription Issues" value="54" icon={Crown} tone="warning" />
        <StatCard label="Verification" value="91" icon={BadgeCheck} tone="success" />
        <StatCard label="Refunds" value="27" icon={Undo2} tone="primary" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((t) => (
          <Card key={t.title} className="shadow-sm border-border/40 transition-all hover:-translate-y-0.5 hover:shadow-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/20 mb-3 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.title}</CardTitle>
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white border border-white/10">
                {t.count} open
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              <button className="mt-4 text-xs font-semibold text-primary hover:text-white transition-colors">
                View queue →
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}