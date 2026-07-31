"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Wrench } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { API_ORIGIN } from "@/config/runtime";

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [maintenanceMode, setMaintenanceMode] = useState<boolean | null>(null);
  const superAdminRoute = pathname.startsWith("/super-admin")
    || pathname === "/management/super-admin";

  useEffect(() => {
    if (superAdminRoute) return;
    let active = true;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_ORIGIN}/api/maintenance-status`, {
          cache: "no-store",
        });
        if (!response.ok) {
          if (active) setMaintenanceMode(false);
          return;
        }
        const data = await response.json();
        if (active) setMaintenanceMode(data.maintenanceMode === true);
      } catch {
        // A temporary status-check failure must not create a false outage.
        if (active) setMaintenanceMode(false);
      }
    };

    void checkStatus();
    const interval = window.setInterval(checkStatus, 5_000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void checkStatus();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [superAdminRoute]);

  if (!superAdminRoute && maintenanceMode === null) {
    return (
      <main className="grid min-h-dvh place-items-center bg-white">
        <BrandLogo className="h-14 w-14 animate-pulse shadow-lg shadow-rose-500/20" priority />
      </main>
    );
  }

  if (!superAdminRoute && maintenanceMode) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[radial-gradient(circle_at_top,rgba(244,63,94,0.14),transparent_38%),linear-gradient(135deg,#fff7fa,#f8fafc)] px-4 py-10">
        <section className="w-full max-w-lg rounded-3xl border border-rose-100 bg-white p-7 text-center shadow-2xl shadow-rose-200/40 sm:p-10">
          <BrandLogo className="mx-auto h-16 w-16 shadow-xl shadow-rose-500/20" priority />
          <div className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <Wrench className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            We&rsquo;ll be back soon
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
            ConnectLove is temporarily offline while we make important improvements. Please try again shortly.
          </p>
        </section>
      </main>
    );
  }

  return children;
}
