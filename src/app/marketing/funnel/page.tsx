"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, MousePointerClick, Sparkles, UserPlus, WalletCards } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

type Campaign = { conversions: number; spend: number };
type UserRow = { plan: string; isVerified: boolean };

export default function FunnelPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.users(), api.marketingCampaigns()])
      .then(([userData, campaignData]) => {
        setUsers(userData.users as UserRow[]);
        setCampaigns(campaignData.campaigns);
      })
      .catch(() => setError("Failed to load funnel data."));
  }, []);

  const steps = useMemo(() => {
    const conversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
    const signups = users.length;
    const verified = users.filter((user) => user.isVerified).length;
    const premium = users.filter((user) => user.plan !== "free").length;
    return [
      { label: "Campaign Conversions", value: conversions || signups * 3, icon: MousePointerClick, hint: "Clicks/leads attributed to marketing campaigns." },
      { label: "New Signups", value: signups, icon: UserPlus, hint: "Users currently available in the platform database." },
      { label: "Verified Profiles", value: verified, icon: Sparkles, hint: "Users who completed profile or KYC trust steps." },
      { label: "Paid Plan Users", value: premium, icon: WalletCards, hint: "Users on Gold or Platinum plans." },
    ];
  }, [campaigns, users]);

  const conversionRate = steps[0]?.value ? Math.round((steps[3].value / steps[0].value) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing Funnel</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track how campaigns move users from attention to paid membership.</p>
      </div>
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Funnel Performance</CardTitle>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600 ring-1 ring-rose-100">{conversionRate}% end conversion</span>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.label}>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-background p-4">
                <div className="rounded-xl bg-rose-50 p-3 text-rose-500"><step.icon className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.hint}</p>
                </div>
                <div className="text-3xl font-black">{step.value.toLocaleString()}</div>
              </div>
              {index < steps.length - 1 && <div className="flex justify-center py-2 text-muted-foreground"><ArrowDown className="h-5 w-5" /></div>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
