"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/features/home/Navbar";
import { HeroSection } from "@/features/home/HeroSection";
import { AboutSection } from "@/features/home/AboutSection";
import { FeaturesSection } from "@/features/home/FeaturesSection";
import { HomeSeoContent } from "@/features/home/HomeSeoContent";
import { SafetySection } from "@/features/home/SafetySection";
import { Footer } from "@/features/home/Footer";
import { ShieldX, X } from "lucide-react";

function AuthBanner() {
  const [authBanner, setAuthBanner] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("reason") === "unauthenticated") {
      setAuthBanner(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  return (
      authBanner ? (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex w-[calc(100vw-2rem)] max-w-xl items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3.5 text-white shadow-2xl shadow-slate-900/40"
        >
          <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-rose-500/20">
            <ShieldX className="h-[16px] w-[16px] text-rose-400" />
          </div>
          <div className="flex-1 min-w-[0px]">
            <p className="text-sm font-semibold">Not logged in</p>
            <p className="text-xs text-white/60">Please sign in to access your dashboard.</p>
          </div>
          <button
            onClick={() => setAuthBanner(false)}
            className="shrink-0 rounded-full p-1 hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-[16px] w-[16px] text-white/60" />
          </button>
        </div>
      ) : null
  );
}

function SignupIntent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("signup") === "1") {
      window.location.href = "/register";
    }
  }, [searchParams]);

  return null;
}

export default function HomePage() {
  return (
  <div className="marketing-home min-h-screen bg-white text-slate-900 transition-colors dark:bg-[#090910] dark:text-slate-100">
  {/* ── Unauthenticated banner ───────────────────────────────────────── */}
  <Suspense fallback={null}>
    <AuthBanner />
    <SignupIntent />
  </Suspense>

 <Navbar
 onLoginClick={() => { window.location.href = "/login"; }}
 onSignupClick={() => { window.location.href = "/register"; }}
 />

 <main>
 <HeroSection onSignupClick={() => { window.location.href = "/register"; }} />
 <AboutSection />
 <FeaturesSection />
 <HomeSeoContent />
 <SafetySection />
 </main>

 <Footer />

 </div>
 );
}
