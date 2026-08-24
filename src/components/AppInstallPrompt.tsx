"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { APP_INSTALL_PROMPT_PENDING_KEY } from "@/lib/appInstallPrompt";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.connectlove";
const PROMPT_DELAY_MS = 10_000;

export function AppInstallPrompt() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const shouldShowOnDiscover = pathname === "/user/discover";

  const closePrompt = () => {
    setIsOpen(false);
    try {
      sessionStorage.removeItem(APP_INSTALL_PROMPT_PENDING_KEY);
    } catch {
      // The prompt can still be closed if browser storage is unavailable.
    }
  };

  useEffect(() => {
    if (!shouldShowOnDiscover) {
      setIsOpen(false);
      return;
    }

    try {
      if (sessionStorage.getItem(APP_INSTALL_PROMPT_PENDING_KEY) !== "true") return;
      const timer = window.setTimeout(() => setIsOpen(true), PROMPT_DELAY_MS);
      return () => window.clearTimeout(timer);
    } catch {
      // Without the registration marker, do not show the prompt.
    }
  }, [shouldShowOnDiscover]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePrompt();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !shouldShowOnDiscover) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-3 backdrop-blur-[3px] sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePrompt();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-install-title"
        aria-describedby="app-install-description"
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/50 bg-white p-6 text-center shadow-2xl dark:border-white/10 dark:bg-[#15151f] sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 size-44 rounded-full bg-rose-200/60 blur-3xl dark:bg-rose-500/20" />
        <button type="button" onClick={closePrompt} aria-label="Close app install prompt" className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white">
          <X className="size-5" aria-hidden="true" />
        </button>

        <div className="relative mx-auto mb-5 grid size-20 place-items-center rounded-3xl bg-gradient-to-br from-rose-50 to-pink-100 shadow-sm ring-1 ring-rose-100 dark:from-rose-500/15 dark:to-pink-500/10 dark:ring-rose-400/20">
          <Image src="/connect-love-logo.png" alt="ConnectLove app" width={64} height={64} className="size-16 rounded-2xl object-contain" priority />
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">ConnectLove Mobile App</p>
        <h2 id="app-install-title" className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-3xl">Find your connection on the go</h2>
        <p id="app-install-description" className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">
          Install the ConnectLove app for a faster, smoother experience and stay connected wherever you are.
        </p>
        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={closePrompt} className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2">
          <Download className="size-5" aria-hidden="true" />
          Install from Google Play
        </a>
        <button type="button" onClick={closePrompt} className="mt-3 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:text-slate-400 dark:hover:text-white">
          Continue on website
        </button>
      </section>
    </div>
  );
}
