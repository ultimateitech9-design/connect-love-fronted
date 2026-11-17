"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { API_ORIGIN } from "@/config/runtime";
import { getToken } from "@/lib/auth";

/** Header shortcut to the wallet showing the spendable coin balance. */
export function WalletChip() {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      const token = getToken();
      if (!token) return;
      fetch(`${API_ORIGIN}/users/me`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
        .then((res) => (res.ok ? res.json() : null))
        .then((me) => {
          if (cancelled || !me) return;
          const user = me.user ?? me;
          setBalance(Number(user.coinBalance ?? 0) + Number(user.earnedCoinBalance ?? 0));
        })
        .catch(() => undefined);
    };
    load();
    // Refresh after purchases, after calls (coins change per minute) and on return to the tab.
    window.addEventListener("connect-love-wallet-changed", load);
    window.addEventListener("focus", load);
    const timer = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.removeEventListener("connect-love-wallet-changed", load);
      window.removeEventListener("focus", load);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <Link
      href="/user/wallet"
      className="flex h-8 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 sm:h-9 sm:px-3"
      aria-label={`Wallet: ${balance ?? 0} coins`}
      title="Wallet"
    >
      <Coins className="h-4 w-4" />
      <span className="tabular-nums">{balance ?? "—"}</span>
    </Link>
  );
}
