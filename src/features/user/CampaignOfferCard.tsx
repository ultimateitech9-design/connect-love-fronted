"use client";

import { useEffect, useRef, useState } from "react";
import { BadgePercent, Sparkles, X } from "lucide-react";
import { api } from "@/lib/api";

type ActiveCampaign = Awaited<ReturnType<typeof api.activeCampaigns>>["campaigns"][number];

export function CampaignOfferCard() {
  const [campaign, setCampaign] = useState<ActiveCampaign | null>(null);
  const impressionSent = useRef(false);

  useEffect(() => {
    let alive = true;
    api.activeCampaigns()
      .then(({ campaigns }) => {
        if (!alive) return;
        const visible = campaigns.find((item) => sessionStorage.getItem(`cl_campaign_dismissed:${item.id}`) !== "1");
        setCampaign(visible || null);
      })
      .catch(() => undefined);
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!campaign || impressionSent.current) return;
    impressionSent.current = true;
    void api.recordCampaignEvent(campaign.id, "impression").catch(() => undefined);
  }, [campaign]);

  if (!campaign) return null;

  const dismiss = () => {
    sessionStorage.setItem(`cl_campaign_dismissed:${campaign.id}`, "1");
    void api.recordCampaignEvent(campaign.id, "dismiss").catch(() => undefined);
    setCampaign(null);
  };

  const openOffer = () => {
    void api.recordCampaignEvent(campaign.id, "click").catch(() => undefined);
    window.location.href = campaign.ctaUrl;
  };

  return (
    <section className="relative mb-5 overflow-hidden rounded-3xl border border-rose-200/70 bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 p-5 text-white shadow-xl shadow-rose-500/20 sm:p-6" role="status" aria-label="Current offer">
      <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-amber-300/20 blur-xl" />
      <button type="button" onClick={dismiss} aria-label="Dismiss offer" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/15 text-white transition hover:bg-black/25">
        <X className="h-4 w-4" />
      </button>
      <div className="relative flex flex-col gap-4 pr-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30"><Sparkles className="h-6 w-6" /></div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black tracking-tight sm:text-2xl">{campaign.title}</h2>
              {campaign.discountPercent ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-2.5 py-1 text-xs font-black text-rose-950"><BadgePercent className="h-3.5 w-3.5" />{campaign.discountPercent}% OFF</span> : null}
            </div>
            <p className="mt-1 max-w-2xl text-sm font-medium leading-relaxed text-white/90">{campaign.description}</p>
            {campaign.endsAt ? <p className="mt-2 text-xs font-semibold text-white/70">Valid until {new Date(campaign.endsAt).toLocaleString()}</p> : null}
          </div>
        </div>
        <button type="button" onClick={openOffer} className="h-11 shrink-0 rounded-full bg-white px-5 text-sm font-black text-rose-700 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
          {campaign.ctaLabel}
        </button>
      </div>
    </section>
  );
}
