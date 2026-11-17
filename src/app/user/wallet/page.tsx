"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Banknote, Coins, Loader2, Phone, Video, Wallet } from "lucide-react";
import { toast } from "sonner";
import { API_ORIGIN } from "@/config/runtime";
import { getToken } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { buyCoins } from "@/features/wallet/buyCoins";

type Summary = {
  videoRatePerMinute: number;
  audioRatePerMinute: number;
  freeCallsPerMonth: number;
  freeCallsRemaining: number;
  packs: number[];
};

type Entry = { id: string; type: string; status: string; label: string | null; coins: number; wallet: "coins" | "earnings"; createdAt: string };

const TYPE_NAMES: Record<string, string> = {
  recharge: "Coins bought",
  admin_credit: "Coins from ConnectLove",
  gift: "Gift",
  call: "Call",
  theme: "Chat theme",
  withdrawal: "Withdrawal",
};

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_ORIGIN}${path}`, { headers: { Authorization: `Bearer ${getToken()}` }, cache: "no-store" });
  if (!response.ok) throw new Error("Wallet could not be loaded.");
  return response.json();
}

export default function WalletPage() {
  const [coins, setCoins] = useState<number | null>(null);
  const [earnings, setEarnings] = useState<number | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [buying, setBuying] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [me, nextSummary, history] = await Promise.all([
        get<{ coinBalance?: number; earnedCoinBalance?: number; user?: { coinBalance?: number; earnedCoinBalance?: number } }>("/users/me"),
        get<Summary>("/direct-calls/summary"),
        get<Entry[]>("/wallet/transactions"),
      ]);
      setCoins(Number(me.coinBalance ?? me.user?.coinBalance ?? 0));
      setEarnings(Number(me.earnedCoinBalance ?? me.user?.earnedCoinBalance ?? 0));
      setSummary(nextSummary);
      setEntries(history);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Wallet could not be loaded.");
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const buy = async (pack: number) => {
    if (buying) return;
    setBuying(pack);
    try {
      const added = await buyCoins(pack);
      if (added) {
        toast.success(`${added} coins added to your wallet.`);
        await load();
      }
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Payment failed.");
    } finally {
      setBuying(null);
    }
  };

  const videoRate = summary?.videoRatePerMinute ?? 20;
  const audioRate = summary?.audioRatePerMinute ?? 10;
  const packs = summary?.packs ?? [299, 499, 999];
  const popular = packs[Math.floor(packs.length / 2)];

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground"><Wallet className="h-6 w-6 text-rose-500" /> Wallet</h1>
        <p className="text-sm text-muted-foreground">Buy coins for calls and gifts, and withdraw what you earn.</p>
      </div>

      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-3xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Coins className="h-4 w-4 text-amber-500" /> Coins for calls & gifts</p>
          <p className="mt-2 text-3xl font-black text-foreground">{coins ?? "—"}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            ≈ {coins !== null ? Math.floor((coins + (earnings ?? 0)) / videoRate) : "—"} min video or {coins !== null ? Math.floor((coins + (earnings ?? 0)) / audioRate) : "—"} min audio
            {summary ? ` · ${summary.freeCallsRemaining} of ${summary.freeCallsPerMonth} free calls left this month` : ""}
          </p>
        </section>
        <section className="rounded-3xl border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Banknote className="h-4 w-4 text-emerald-500" /> Earnings (withdrawable)</p>
          <p className="mt-2 text-3xl font-black text-foreground">{earnings ?? "—"}</p>
          <Link href="/user/withdraw" className="mt-2 inline-flex rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500">Withdraw</Link>
        </section>
      </div>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-lg font-bold text-foreground">Coin plans</h2>
        <p className="text-sm text-muted-foreground">
          Use coins for calls and gifts. Calls use <span className="inline-flex items-center gap-1"><Video className="h-3.5 w-3.5" /> {videoRate} coins/min</span> or <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {audioRate} coins/min</span>.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {packs.map((pack) => (
            <div key={pack} className={cn("relative flex flex-col rounded-2xl border p-4", pack === popular ? "border-rose-400 bg-rose-50/60 dark:bg-rose-500/10" : "border-border")}>
              {pack === popular && <span className="absolute -top-2.5 left-4 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Popular</span>}
              <p className="text-2xl font-black text-foreground">₹{pack}</p>
              <p className="text-sm font-semibold text-foreground">{pack} coins</p>
              <p className="mt-1 text-xs text-muted-foreground">~{Math.floor(pack / videoRate)} min video or ~{Math.floor(pack / audioRate)} min audio</p>
              <button type="button" disabled={buying !== null} onClick={() => void buy(pack)} className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                {buying === pack && <Loader2 className="h-4 w-4 animate-spin" />} Buy
              </button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Every started minute of a call is charged (1:01 counts as 2 minutes).</p>
      </section>

      <section className="rounded-3xl border border-border bg-card p-5">
        <h2 className="mb-3 text-lg font-bold text-foreground">History</h2>
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No wallet activity yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {entries.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 py-3">
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full", entry.coins >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {entry.coins >= 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{TYPE_NAMES[entry.type] ?? entry.type}{entry.label ? ` · ${entry.label}` : ""}</span>
                  <span className="block text-xs text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleString([], { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                    {" · "}{entry.wallet === "earnings" ? "Earnings" : "Coins"}
                    {entry.status !== "completed" ? ` · ${entry.status === "pending" ? "Pending" : "Rejected"}` : ""}
                  </span>
                </span>
                <span className={cn("shrink-0 text-sm font-bold tabular-nums", entry.coins >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {entry.coins >= 0 ? "+" : ""}{entry.coins}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
