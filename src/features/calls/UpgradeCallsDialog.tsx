"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Coins, Loader2, Phone, Video, X } from "lucide-react";
import { toast } from "sonner";
import { API_ORIGIN } from "@/config/runtime";
import { getToken } from "@/lib/auth";
import { buyCoins } from "@/features/wallet/buyCoins";
import { CouponField, couponPrice, type WalletCoupon } from "@/features/wallet/CouponField";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Why the popup opened: free trial time ended, coins ran out, monthly free calls used, or opened by the user. */
export type UpgradeReason = "free_limit" | "coins_exhausted" | "free_used" | "low_time" | "manual";

type Summary = {
  videoRatePerMinute: number;
  audioRatePerMinute: number;
  freeCallsPerMonth: number;
  freeCallsRemaining: number;
  packs: number[];
  balance: number;
};


const HEADINGS: Record<UpgradeReason, { title: string; text: (s: Summary | null) => string }> = {
  free_limit: { title: "Your call time is over", text: () => "Buy coins to keep talking without a time limit." },
  coins_exhausted: { title: "You're out of coins", text: () => "Your call ended because your coins ran out. Add coins to call again." },
  free_used: {
    title: "Free calls used up",
    text: (s) => `You've used all ${s?.freeCallsPerMonth ?? 7} free calls this month. Buy coins to keep calling.`,
  },
  manual: { title: "Buy coins", text: () => "Use coins for calls and gifts." },
  low_time: { title: "Your call is about to end", text: () => "Add coins now and your call keeps going without interruption." },
};


export function UpgradeCallsDialog({ reason, onClose }: { reason: UpgradeReason | null; onClose: () => void }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [buying, setBuying] = useState<number | null>(null);
  const [coupon, setCoupon] = useState<WalletCoupon | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      const response = await fetch(`${API_ORIGIN}/direct-calls/summary`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        cache: "no-store",
      });
      if (response.ok) setSummary(await response.json());
    } catch {
      // The packs below fall back to the defaults.
    }
  }, []);

  useEffect(() => {
    if (reason) void loadSummary();
  }, [reason, loadSummary]);

  const buy = async (coins: number) => {
    if (buying) return;
    setBuying(coins);
    try {
      const added = await buyCoins(coins, `${coins} coins`, coupon?.code);
      if (added) {
        toast.success(`${added} coins added. You can call now!`);
        setCoupon(null);
        onClose();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed.");
    } finally {
      setBuying(null);
    }
  };

  if (!reason || typeof document === "undefined") return null;

  const heading = HEADINGS[reason];
  const videoRate = summary?.videoRatePerMinute ?? 20;
  const audioRate = summary?.audioRatePerMinute ?? 10;
  const packs = summary?.packs ?? [299, 499, 999];
  const popular = packs[Math.floor(packs.length / 2)];

  return createPortal((
    <div className="fixed inset-0 z-[10070] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-calls-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-t-3xl bg-card p-6 shadow-2xl sm:rounded-3xl"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25">
          <Coins className="h-6 w-6" />
        </span>
        <h2 id="upgrade-calls-title" className="mt-4 pr-10 text-xl font-bold text-foreground">{heading.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{heading.text(summary)}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          {summary && <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-foreground"><Coins className="h-3.5 w-3.5" /> Your talk time</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-foreground"><Video className="h-3.5 w-3.5" /> ~{Math.floor(summary.balance / videoRate)} min video</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-foreground"><Phone className="h-3.5 w-3.5" /> ~{Math.floor(summary.balance / audioRate)} min audio</span>
          </>}
        </div>

        <div className="mt-4"><CouponField coupon={coupon} onChange={setCoupon} /></div>
        <div className="mt-3 space-y-3">
          {packs.map((coins) => (
            <button
              key={coins}
              type="button"
              onClick={() => void buy(coins)}
              disabled={buying !== null}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border p-4 text-left transition hover:border-rose-400 hover:shadow-md disabled:opacity-60",
                coins === popular ? "border-rose-400 bg-rose-50/60 dark:bg-rose-500/10" : "border-border",
              )}
            >
              <span>
                <span className="flex items-center gap-2 text-lg font-bold text-foreground">
                  ₹{couponPrice(coins, coupon)}
                  {coupon && <span className="text-sm font-semibold text-muted-foreground line-through">₹{coins}</span>}
                  {coins === popular && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Popular</span>}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {coins} coins · ~{Math.floor(coins / videoRate)} min video or ~{Math.floor(coins / audioRate)} min audio
                </span>
              </span>
              {buying === coins ? <Loader2 className="h-5 w-5 animate-spin text-rose-500" /> : <span className="rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 text-sm font-bold text-white">Buy</span>}
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] leading-5 text-muted-foreground">
          Every started minute is charged (1:01 counts as 2 minutes).
          {summary && summary.freeCallsRemaining > 0 ? ` You still have ${summary.freeCallsRemaining} free calls this month.` : ""}
        </p>
        <Button variant="ghost" className="mt-2 w-full" onClick={onClose}>Not now</Button>
      </div>
    </div>
  ), document.body);
}
