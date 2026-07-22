/* eslint-disable */
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check, Crown, Zap, Heart, MessageCircle, Star, Shield, Sparkles, Video, Globe, Gem } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

const basicFeatures = [
  { icon: Heart, title: "Smart Matching", desc: "AI-powered compatibility algorithm based on personality & values", href: "/user/discover" },
  { icon: MessageCircle, title: "Basic Messaging", desc: "Text chat with up to 5 active matches per day", href: "/user/messages" },
  { icon: Star, title: "Profile Creation", desc: "Detailed profile with photos and personality badges", href: "/user/profile" },
  { icon: Shield, title: "Safety Reports", desc: "Report and block suspicious profiles instantly", href: "/user/messages" },
];

const premiumFeatures = [
  { icon: Sparkles, title: "Unlimited Matches", desc: "No daily limit — explore as many connections as you want", href: "/user/discover" },
  { icon: Crown, title: "Priority Visibility", desc: "Appear at the top of discovery queues in your area", href: "/user/premium" },
  { icon: Video, title: "Video Dates", desc: "Built-in encrypted video calling before meeting in person", href: "/user/messages" },
  { icon: Globe, title: "Global Search", desc: "Connect with singles worldwide, not just your city", href: "/user/discover" },
  { icon: Zap, title: "Instant Icebreakers", desc: "AI-generated conversation starters tailored to both profiles", href: "/user/messages" },
  { icon: Shield, title: "Verified Badge", desc: "Government ID verification — stand out as a trusted member", href: "/user/profile" },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Start your journey",
    tier: "free",
    features: ["5 matches per day", "Basic messaging", "Profile creation", "Safety tools"],
    popular: false,
  },
  {
    name: "Gold",
    price: "₹199",
    period: "per month",
    description: "Most popular choice",
    tier: "gold",
    features: ["Unlimited matches", "Priority visibility", "Video dates", "AI icebreakers", "Read receipts", "Advanced filters"],
    popular: true,
  },
  {
    name: "Diamond",
    price: "₹399",
    period: "per month",
    description: "The ultimate experience",
    tier: "diamond",
    features: ["Everything in Gold", "Global search", "Verified badge", "Dedicated support", "Profile boost daily", "Exclusive events"],
    popular: false,
  },
];

export function FeaturesSection() {
  const [tab, setTab] = useState<"basic" | "premium">("basic");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const router = useRouter();

  useEffect(() => {
    [
      "/login",
      "/user/discover",
      "/user/messages",
      "/user/profile",
      "/user/premium",
    ].forEach((route) => router.prefetch(route));
  }, [router]);

  const openFeature = (feature: { title: string; href?: string }) => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    const routes: Record<string, string> = {
      "Smart Matching": "/user/discover",
      "Basic Messaging": "/user/messages",
      "Profile Creation": "/user/profile",
      "Safety Reports": "/user/messages",
      "Unlimited Matches": "/user/discover",
      "Priority Visibility": "/user/premium",
      "Video Dates": "/user/messages",
      "Global Search": "/user/discover",
      "Instant Icebreakers": "/user/messages",
      "Verified Badge": "/user/profile",
    };
    router.push(feature.href || routes[feature.title] || "/user/messages");
  };

  return (
    <section id="features" className="bg-slate-50/70 py-16 sm:py-20 border-y border-slate-100" ref={ref}>
      <div className="mx-auto w-[90vw] max-w-7xl">
        
        {/* Header */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">Features</span>
          <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight font-display">
            Everything you need to find{" "}
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent text-glow-rose">
              your person
            </span>
          </h2>
          <p className="mt-4 text-base text-slate-500 max-w-xl mx-auto">
            From smart matching to video dates, we have every tool to help you build a genuine connection.
          </p>
        </motion.div>

        {/* Tab Toggle */}
        <div className="mt-10 flex justify-center">
          <div className="relative inline-flex rounded-full bg-white border border-slate-200/80 p-1 shadow-sm">
            <button
              onClick={() => setTab("basic")}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                tab === "basic" ? "text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "basic" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-600"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-20">Basic Features</span>
            </button>
            <button
              onClick={() => setTab("premium")}
              className={`relative z-10 px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                tab === "premium" ? "text-white" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "premium" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-600"
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-20">Premium Features</span>
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <motion.div 
          layout
          className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {(tab === "basic" ? basicFeatures : premiumFeatures).map((feature) => (
              <motion.button
                layout
                initial={false}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                type="button"
                key={feature.title}
                onClick={() => openFeature(feature)}
                className="min-h-[200px] rounded-3xl bg-white border border-slate-100 p-6 text-left shadow-sm hover-glow-card cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100/50 text-rose-500 shadow-inner">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-bold text-slate-800 text-lg leading-snug">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Pricing section */}
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 sm:mt-20"
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h3 className="text-3xl font-bold text-slate-900 font-display">Choose your plan</h3>
            <p className="mt-2 text-sm text-slate-500">Start free. Upgrade anytime. Cancel whenever.</p>
          </div>

          <div className="grid items-stretch gap-7 md:grid-cols-3 md:gap-5 lg:gap-7 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const isFree = plan.tier === "free";
              const isGold = plan.tier === "gold";
              const isDiamond = plan.tier === "diamond";

              return (
                <article
                  key={plan.name}
                  className={`group relative isolate flex min-h-[600px] flex-col overflow-visible rounded-[34px] p-[2px] transition duration-500 hover:-translate-y-2 ${
                    isFree
                      ? "bg-gradient-to-br from-white via-stone-200 to-white shadow-[0_24px_70px_rgba(71,58,42,0.16)]"
                      : isGold
                        ? "z-10 bg-gradient-to-br from-[#f9dc99] via-[#8a6127] to-[#f6d17c] shadow-[0_28px_80px_rgba(120,79,20,0.34)] md:-translate-y-3 md:hover:-translate-y-5"
                        : "bg-gradient-to-br from-violet-200 via-violet-500 to-indigo-200 shadow-[0_28px_80px_rgba(105,60,220,0.36)]"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 z-30 flex h-11 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#ffe6a7] bg-gradient-to-b from-[#f7d58a] via-[#c89346] to-[#9b692a] px-7 text-[11px] font-black tracking-[0.19em] text-[#17120a] shadow-[0_8px_28px_rgba(225,170,77,0.4)] sm:text-xs">
                      <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                      MOST POPULAR
                      <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    </div>
                  )}

                  <div
                    className={`relative flex h-full flex-1 flex-col overflow-hidden rounded-[32px] border ${
                      isFree
                        ? "border-white/90 bg-[linear-gradient(145deg,#fffdf9_0%,#f5f0e9_48%,#fffdfa_100%)] text-slate-950"
                        : isGold
                          ? "border-[#8e682e] bg-[linear-gradient(145deg,#171716_0%,#090909_54%,#1b1813_100%)] text-white"
                          : "border-violet-300/55 bg-[linear-gradient(145deg,#24113f_0%,#13092c_54%,#21134a_100%)] text-white"
                    }`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 opacity-70 ${
                        isFree
                          ? "bg-[radial-gradient(circle_at_82%_8%,rgba(255,255,255,1),transparent_26%),linear-gradient(120deg,transparent_15%,rgba(255,255,255,.9)_28%,transparent_42%)]"
                          : isGold
                            ? "bg-[radial-gradient(circle_at_82%_3%,rgba(255,211,124,.15),transparent_30%),repeating-linear-gradient(155deg,transparent_0,transparent_8px,rgba(255,220,147,.025)_9px)]"
                            : "bg-[radial-gradient(circle_at_78%_8%,rgba(178,135,255,.35),transparent_30%),linear-gradient(125deg,transparent_12%,rgba(255,255,255,.08)_25%,transparent_40%)]"
                      }`}
                      aria-hidden="true"
                    />

                    {isDiamond && (
                      <div className="pointer-events-none absolute right-4 top-12 opacity-90" aria-hidden="true">
                        <div className="absolute inset-0 scale-150 rounded-full bg-violet-400/25 blur-2xl" />
                        <Gem className="relative h-24 w-24 rotate-[-8deg] fill-violet-300/20 stroke-[1.2] text-violet-200 drop-shadow-[0_0_18px_rgba(196,165,255,.95)] lg:h-28 lg:w-28" />
                      </div>
                    )}

                    <header className={`relative min-h-[220px] p-8 ${isGold ? "pt-11" : ""}`}>
                      <div className="flex items-center justify-between gap-4">
                        <p className={`text-sm font-black uppercase tracking-[0.13em] ${isFree ? "text-stone-500" : isGold ? "text-[#f2cf7d]" : "text-violet-100"}`}>
                          {plan.name}
                        </p>
                        {isGold && (
                          <span className="grid h-12 w-12 place-items-center rounded-full border border-[#9e7538] bg-black/50 text-[#f0c76c] shadow-[inset_0_0_18px_rgba(224,175,78,.15)]">
                            <Crown className="h-6 w-6" aria-hidden="true" />
                          </span>
                        )}
                      </div>

                      <div className="mt-7 flex flex-wrap items-end gap-x-2 gap-y-1">
                        <span className={`text-5xl font-black tracking-[-0.06em] ${isGold ? "bg-gradient-to-b from-[#ffe6a2] to-[#b77a27] bg-clip-text text-transparent" : isDiamond ? "text-violet-100" : "text-slate-950"}`}>
                          {plan.price}
                        </span>
                        <span className={`mb-1 text-sm font-medium ${isFree ? "text-stone-500" : isGold ? "text-[#d5b26b]" : "text-violet-200"}`}>
                          /{plan.period}
                        </span>
                      </div>
                      <p className={`mt-4 text-sm ${isFree ? "text-stone-500" : isGold ? "text-[#c4a56a]" : "text-violet-200/90"}`}>
                        {plan.description}
                      </p>
                    </header>

                    <div className={`relative flex flex-1 flex-col border-t p-7 sm:p-8 ${isFree ? "border-white bg-white/22" : isGold ? "border-[#705326]/80 bg-white/[0.018]" : "border-violet-400/25 bg-white/[0.025]"}`}>
                      <ul className="mb-9 space-y-1">
                        {plan.features.map((feature) => (
                          <li key={feature} className={`flex min-h-12 items-center gap-4 border-b text-sm last:border-b-0 ${isFree ? "border-stone-300/45 text-slate-700" : isGold ? "border-white/[0.06] text-stone-200" : "border-violet-200/10 text-violet-50"}`}>
                            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${isFree ? "border-stone-300 text-stone-500" : isGold ? "border-[#a97c38] text-[#e6bd66]" : "border-violet-400 text-violet-300"}`}>
                              <Check className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                            </span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = isFree ? "/register" : "/user/premium";
                        }}
                        className={`mt-auto h-14 w-full rounded-full border text-sm font-black shadow-lg transition duration-300 hover:scale-[1.025] hover:brightness-110 active:scale-[0.985] ${
                          isFree
                            ? "border-slate-800 bg-gradient-to-b from-[#292929] to-[#090909] text-white shadow-black/20"
                            : isGold
                              ? "border-[#ffe0a0] bg-gradient-to-r from-[#b77a2e] via-[#f4d28a] to-[#b77a2e] text-[#171108] shadow-[#d9a850]/25"
                              : "border-violet-200/80 bg-gradient-to-r from-[#7b4dcc] via-[#d0b7ff] to-[#7250ca] text-[#1d1035] shadow-violet-500/35"
                        }`}
                      >
                        {isFree ? "Get Started Free" : `Buy ${plan.name}`}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
