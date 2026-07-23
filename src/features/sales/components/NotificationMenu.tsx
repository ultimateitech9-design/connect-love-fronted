"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock3, Megaphone } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api, type CampaignRecord } from "@/lib/api";

export function NotificationMenu() {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);

  useEffect(() => {
    api.notifications().then((response) => setCampaigns(response.notifications.slice(0, 5))).catch(() => setCampaigns([]));
  }, []);

  const pending = campaigns.filter((campaign) => campaign.status === "pending_approval").length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative grid h-10 w-10 place-items-center rounded-full bg-secondary/50 text-foreground outline-none hover:bg-secondary" aria-label="Campaign updates">
          <Bell className="h-4 w-4" />
          {pending > 0 ? <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">{pending}</span> : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="px-2 py-2 text-base font-semibold">Live campaign updates</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {campaigns.length === 0 ? <div className="p-5 text-center text-xs text-muted-foreground">No campaign records.</div> : campaigns.map((campaign) => {
          const Icon = campaign.status === "active" ? CheckCircle2 : campaign.status === "pending_approval" ? Clock3 : Megaphone;
          return <DropdownMenuItem key={campaign.id} className="flex cursor-default items-start gap-3 p-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{campaign.campaign}</p><p className="text-xs capitalize text-muted-foreground">{campaign.status.replace("_", " ")} · {campaign.impressions} views</p></div>
          </DropdownMenuItem>;
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
