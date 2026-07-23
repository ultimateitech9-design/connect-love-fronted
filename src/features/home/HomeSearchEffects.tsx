"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldX, X } from "lucide-react";

export function HomeSearchEffects() {
  const [authBanner, setAuthBanner] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("reason") === "unauthenticated") {
      setAuthBanner(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
    }

    if (searchParams.get("signup") === "1") {
      window.location.href = "/register";
    }
  }, [searchParams]);

  if (!authBanner) return null;

  return (
    <div className="fixed left-1/2 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-white shadow-2xl shadow-slate-900/40">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/20">
        <ShieldX className="h-4 w-4 text-rose-400" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Not logged in</p>
        <p className="text-xs text-white/60">Please sign in to access your dashboard.</p>
      </div>
      <button
        type="button"
        onClick={() => setAuthBanner(false)}
        className="shrink-0 rounded-full p-2 hover:bg-white/10"
        aria-label="Dismiss sign-in notice"
      >
        <X className="h-4 w-4 text-white/60" aria-hidden="true" />
      </button>
    </div>
  );
}
