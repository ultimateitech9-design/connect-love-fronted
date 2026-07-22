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
          <div className="text-center max-w-3xl mx-auto mb-9">
            <h3 className="text-3xl font-bold text-slate-900 font-display">Choose your plan</h3>
            <p className="mt-2 text-sm text-slate-500">Start free. Upgrade anytime. Cancel whenever.</p>
          </div>

          <div className="grid items-stretch gap-6 md:grid-cols-3 md:gap-4 lg:gap-5 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const isFree = plan.tier === "free";
              const isGold = plan.tier === "gold";
              const isDiamond = plan.tier === "diamond";

              return (
                <article
                  key={plan.name}
                  className={`pricing-card group relative isolate flex min-h-[520px] flex-col overflow-visible rounded-[28px] p-[2px] transition duration-500 hover:-translate-y-1.5 sm:min-h-[540px] ${
                    isFree
                      ? "bg-gradient-to-br from-white via-stone-200 to-white shadow-[0_18px_48px_rgba(71,58,42,0.16)]"
                      : isGold
                        ? "z-10 bg-gradient-to-br from-[#f9dc99] via-[#8a6127] to-[#f6d17c] shadow-[0_20px_56px_rgba(120,79,20,0.34)] md:-translate-y-2 md:hover:-translate-y-3"
                        : "pricing-diamond-shell bg-[conic-gradient(from_210deg,#d9caff,#7144d5,#c8b8ff,#5f38b8,#eee9ff,#7144d5,#d9caff)] shadow-[0_20px_58px_rgba(105,60,220,0.48)]"
                  }`}
                >
                  {plan.popular && (
                    <div className="pricing-badge-glow absolute -top-4 left-1/2 z-30 flex h-9 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#ffe6a7] bg-gradient-to-b from-[#f7d58a] via-[#c89346] to-[#9b692a] px-5 text-[10px] font-black tracking-[0.16em] text-[#17120a] shadow-[0_8px_24px_rgba(225,170,77,0.4)] sm:text-[11px]">
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                      MOST POPULAR
                      <Star className="h-3 w-3 fill-current" aria-hidden="true" />
                    </div>
                  )}

                  <div
                    className={`relative flex h-full flex-1 flex-col overflow-hidden rounded-[26px] border ${
                      isFree
                        ? "pricing-free-card border-white/90 bg-[linear-gradient(145deg,#fffdf9_0%,#f5f0e9_48%,#fffdfa_100%)] text-slate-950"
                        : isGold
                          ? "border-[#8e682e] bg-[linear-gradient(145deg,#171716_0%,#090909_54%,#1b1813_100%)] text-white"
                          : "border-violet-100/70 bg-[linear-gradient(145deg,#241140_0%,#100823_50%,#1d1244_100%)] text-white shadow-[inset_0_0_0_2px_rgba(166,132,255,.24),inset_0_0_28px_rgba(131,82,231,.18)]"
                    }`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 opacity-70 ${
                        isFree
                          ? "bg-[radial-gradient(circle_at_82%_8%,rgba(255,255,255,1),transparent_26%),linear-gradient(120deg,transparent_15%,rgba(255,255,255,.9)_28%,transparent_42%)]"
                          : isGold
                            ? "bg-[radial-gradient(circle_at_82%_3%,rgba(255,211,124,.15),transparent_30%),repeating-linear-gradient(155deg,transparent_0,transparent_8px,rgba(255,220,147,.025)_9px)]"
                            : "bg-[radial-gradient(circle_at_80%_10%,rgba(194,160,255,.38),transparent_32%),radial-gradient(circle_at_5%_82%,rgba(123,77,210,.25),transparent_28%),linear-gradient(125deg,transparent_12%,rgba(255,255,255,.08)_25%,transparent_40%)]"
                      }`}
                      aria-hidden="true"
                    />

                    <div
                      className={`pointer-events-none absolute inset-[7px] z-[4] rounded-[21px] border ${
                        isFree
                          ? "border-white/80 shadow-[inset_0_0_0_1px_rgba(214,205,193,.46),inset_0_0_24px_rgba(255,255,255,.68)]"
                          : isGold
                            ? "border-[#d5a952]/35 shadow-[inset_0_0_0_1px_rgba(255,221,145,.09),inset_0_0_24px_rgba(217,164,66,.08)]"
                            : "border-violet-100/55 shadow-[inset_0_0_0_1px_rgba(168,128,255,.42),inset_0_0_24px_rgba(168,128,255,.2)]"
                      }`}
                      aria-hidden="true"
                    />

                    {isFree && <div className="pricing-free-silk pointer-events-none absolute inset-0 z-[3]" aria-hidden="true" />}

                    <div
                      className={`pricing-card-shine pointer-events-none absolute -top-1/4 z-20 h-[150%] w-20 -skew-x-[18deg] bg-gradient-to-r from-transparent via-white to-transparent ${isFree ? "opacity-30" : isGold ? "opacity-[0.09]" : "opacity-[0.16]"}`}
                      aria-hidden="true"
                    />

                    {isDiamond && (
                      <>
                        <DiamondFacetBackground />
                        <DiamondCrystalFrame />
                        <div className="pricing-gem-float pointer-events-none absolute -right-1 top-8 z-10 h-28 w-36 opacity-100" aria-hidden="true">
                        <div className="absolute inset-2 scale-125 rounded-full bg-violet-300/35 blur-2xl" />
                        <DiamondArtwork />
                        </div>
                        <span className="pricing-shard-glint pointer-events-none absolute right-[31%] top-[31%] z-10 h-3 w-5 rotate-[-14deg] bg-gradient-to-br from-white via-violet-200 to-violet-600 [clip-path:polygon(0_45%,100%_0,70%_100%)]" aria-hidden="true" />
                        <span className="pricing-shard-glint pointer-events-none absolute right-[20%] top-[30%] z-10 h-2.5 w-4 rotate-[18deg] bg-gradient-to-br from-white via-violet-200 to-violet-600 [animation-delay:.7s] [clip-path:polygon(0_45%,100%_0,70%_100%)]" aria-hidden="true" />
                        <span className="pricing-shard-glint pointer-events-none absolute right-[12%] top-[34%] z-10 h-2 w-3.5 rotate-[-8deg] bg-gradient-to-br from-white via-violet-200 to-violet-700 [animation-delay:1.2s] [clip-path:polygon(0_40%,100%_0,68%_100%)]" aria-hidden="true" />
                      </>
                    )}

                    <header className={`relative p-6 ${isDiamond ? "min-h-[190px]" : "min-h-[176px]"} ${isGold ? "pt-8" : ""} ${isFree ? "pricing-free-header" : ""}`}>
                      <div className="flex items-center justify-between gap-4">
                        <p className={`text-sm font-black uppercase tracking-[0.13em] ${isFree ? "text-stone-500" : isGold ? "text-[#f2cf7d]" : "text-violet-50"}`}>
                          <span className="inline-flex items-center gap-2">
                            {plan.name}
                            {isDiamond && <Gem className="h-4 w-4 fill-violet-200/50 text-violet-100 drop-shadow-[0_0_7px_rgba(220,200,255,.9)]" aria-hidden="true" />}
                          </span>
                        </p>
                        {isGold && (
                          <span className="grid h-10 w-10 place-items-center rounded-full border border-[#9e7538] bg-black/50 text-[#f0c76c] shadow-[inset_0_0_18px_rgba(224,175,78,.15)]">
                            <Gem className="h-5 w-5 fill-[#c18a34]/20" aria-hidden="true" />
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap items-end gap-x-2 gap-y-1">
                        <span
                          aria-label={`${plan.price} ${plan.period}`}
                          className={`inline-flex shrink-0 items-baseline whitespace-nowrap text-[2.65rem] font-black leading-none tabular-nums ${isGold ? "bg-gradient-to-b from-[#ffe6a2] to-[#b77a27] bg-clip-text text-transparent" : isDiamond ? "text-violet-100" : "pricing-free-price text-slate-950"}`}
                        >
                          <span className="tracking-[-0.04em]" aria-hidden="true">₹</span>
                          <span className="ml-[0.06em] tracking-[-0.03em]" aria-hidden="true">
                            {plan.price.replace("₹", "")}
                          </span>
                        </span>
                        <span className={`mb-1 text-sm font-medium ${isFree ? "text-stone-500" : isGold ? "text-[#d5b26b]" : "text-violet-200"}`}>
                          /{plan.period}
                        </span>
                      </div>
                      <p className={`mt-3 text-sm ${isFree ? "text-stone-500" : isGold ? "text-[#c4a56a]" : "text-violet-200/90"}`}>
                        {plan.description}
                      </p>
                    </header>

                    <div className={`relative z-[6] mx-2 mb-2 flex flex-1 flex-col rounded-[22px] border p-5 sm:p-6 ${isFree ? "pricing-free-body border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,.78),rgba(248,245,240,.94))] shadow-[inset_0_1px_0_rgba(255,255,255,.98)]" : isGold ? "border-[#705326]/80 bg-[linear-gradient(180deg,rgba(27,27,28,.96),rgba(15,15,16,.98))] shadow-[inset_0_1px_0_rgba(255,222,153,.09)]" : "border-violet-300/20 bg-[linear-gradient(180deg,rgba(29,17,65,.84),rgba(12,7,34,.9))] shadow-[inset_0_1px_0_rgba(255,255,255,.08)]"}`}>
                      <ul className="mb-6">
                        {plan.features.map((feature) => (
                          <li key={feature} className={`flex min-h-10 items-center gap-3 border-b text-[13px] last:border-b-0 ${isFree ? "border-stone-300/45 text-slate-700" : isGold ? "border-white/[0.06] text-stone-200" : "border-violet-200/10 text-violet-50"}`}>
                            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${isFree ? "border-stone-300 text-stone-500" : isGold ? "border-[#a97c38] text-[#e6bd66]" : "border-violet-400 text-violet-300"}`}>
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
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
                        className={`mt-auto h-12 w-full rounded-full border text-sm font-black shadow-lg transition duration-300 hover:scale-[1.025] hover:brightness-110 active:scale-[0.985] ${
                          isFree
                            ? "border-slate-800 bg-gradient-to-b from-[#292929] to-[#090909] text-white shadow-black/20"
                            : isGold
                              ? "border-[#ffe0a0] bg-gradient-to-r from-[#b77a2e] via-[#f4d28a] to-[#b77a2e] text-[#171108] shadow-[#d9a850]/25"
                            : "border-violet-100/90 bg-[linear-gradient(100deg,#6f49bd_0%,#c9b2f7_48%,#8d68d9_100%)] text-[#1d1035] shadow-[0_8px_24px_rgba(147,101,229,.42),inset_0_1px_0_rgba(255,255,255,.72)]"
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

        <style jsx global>{`
          @keyframes pricing-card-shine {
            0%, 54% { transform: translateX(-260%) skewX(-18deg); }
            76%, 100% { transform: translateX(640%) skewX(-18deg); }
          }
          @keyframes pricing-gem-float {
            0%, 100% { transform: translateY(0) rotate(-2deg); filter: brightness(1); }
            50% { transform: translateY(-7px) rotate(2deg); filter: brightness(1.2); }
          }
          @keyframes pricing-badge-glow {
            0%, 100% { box-shadow: 0 8px 24px rgba(225,170,77,.32); }
            50% { box-shadow: 0 8px 32px rgba(255,205,110,.68); }
          }
          @keyframes pricing-diamond-border {
            0%, 100% { filter: brightness(1) saturate(1); }
            50% { filter: brightness(1.2) saturate(1.16); }
          }
          @keyframes pricing-facet-drift {
            0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: .72; }
            50% { transform: translate3d(-3px,4px,0) scale(1.015); opacity: .9; }
          }
          @keyframes pricing-shard-glint {
            0%, 100% { filter: brightness(.85); transform: translateY(0) rotate(var(--shard-rotation, 0deg)); }
            50% { filter: brightness(1.7) drop-shadow(0 0 6px rgba(221,205,255,.9)); transform: translateY(-3px) rotate(var(--shard-rotation, 0deg)); }
          }
          .pricing-card-shine { animation: pricing-card-shine 5.8s ease-in-out infinite; }
          .pricing-gem-float { animation: pricing-gem-float 3.8s ease-in-out infinite; }
          .pricing-badge-glow { animation: pricing-badge-glow 2.8s ease-in-out infinite; }
          .pricing-diamond-shell { animation: pricing-diamond-border 3.4s ease-in-out infinite; }
          .pricing-diamond-facets { animation: pricing-facet-drift 8s ease-in-out infinite; }
          .pricing-shard-glint { animation: pricing-shard-glint 2.6s ease-in-out infinite; }
          .pricing-free-silk {
            opacity: .72;
            background:
              radial-gradient(ellipse at 108% -8%, rgba(255,255,255,.98) 0 23%, transparent 48%),
              linear-gradient(124deg, transparent 6%, rgba(255,255,255,.88) 21%, rgba(221,211,199,.2) 22%, transparent 37%),
              linear-gradient(140deg, transparent 18%, rgba(255,255,255,.74) 31%, transparent 49%);
            mask-image: linear-gradient(to bottom, #000 0 43%, transparent 62%);
          }
          .dark .marketing-home #features .pricing-free-card .pricing-free-header p,
          .dark .marketing-home #features .pricing-free-card .pricing-free-header span {
            color: #57534e;
          }
          .dark .marketing-home #features .pricing-free-card,
          .dark .marketing-home #features .pricing-free-card .pricing-free-price,
          .dark .marketing-home #features .pricing-free-card .pricing-free-price span {
            color: #0f172a;
          }
          .dark .marketing-home #features .pricing-free-card .pricing-free-body,
          .dark .marketing-home #features .pricing-free-card .pricing-free-body li {
            color: #334155;
          }
          .dark .marketing-home #features .pricing-free-card .pricing-free-body {
            background: linear-gradient(180deg, rgba(255,255,255,.78), rgba(248,245,240,.94));
            border-color: rgba(255,255,255,.9);
          }
          @media (prefers-reduced-motion: reduce) {
            .pricing-card-shine, .pricing-gem-float, .pricing-badge-glow, .pricing-diamond-shell, .pricing-diamond-facets, .pricing-shard-glint { animation: none !important; }
          }
        `}</style>

      </div>
    </section>
  );
}

function DiamondArtwork() {
  return (
    <svg viewBox="0 0 180 130" className="relative h-full w-full drop-shadow-[0_0_18px_rgba(215,193,255,1)]" role="presentation">
      <defs>
        <linearGradient id="diamond-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.38" stopColor="#d7c5ff" />
          <stop offset="1" stopColor="#7651d8" />
        </linearGradient>
        <linearGradient id="diamond-low" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d1baff" />
          <stop offset="0.48" stopColor="#9671ed" />
          <stop offset="1" stopColor="#4b248d" />
        </linearGradient>
        <radialGradient id="diamond-flare">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset=".3" stopColor="#e9ddff" stopOpacity=".82" />
          <stop offset="1" stopColor="#a777ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M22 38 49 10h80l29 28-68 77Z" fill="url(#diamond-low)" stroke="#f2ebff" strokeWidth="2.2" />
      <path d="m22 38 27-28 20 28Zm47 0 21-28 20 28Zm41 0 19-28 29 28Z" fill="url(#diamond-top)" />
      <path d="M22 38h47l21 77Zm47 0h41l-20 77Zm41 0h48l-68 77Z" fill="none" stroke="#e1d1ff" strokeOpacity=".76" strokeWidth="1.6" />
      <path d="M49 10 69 38 90 10l20 28 19-28" fill="none" stroke="#fff" strokeOpacity=".78" strokeWidth="1.5" />
      <path d="M32 35 57 15m68 1 22 20M49 38l41 77m20-77-20 77" stroke="#fff" strokeLinecap="round" strokeOpacity=".56" strokeWidth="1.4" />
      <ellipse cx="91" cy="114" rx="42" ry="5" fill="url(#diamond-flare)" opacity=".82" />
      <circle cx="45" cy="20" r="13" fill="url(#diamond-flare)" />
      <path d="M45 6v28M31 20h28" stroke="#fff" strokeLinecap="round" strokeOpacity=".8" />
    </svg>
  );
}

function DiamondFacetBackground() {
  return (
    <svg className="pricing-diamond-facets pointer-events-none absolute inset-0 h-full w-full opacity-75" viewBox="0 0 360 540" preserveAspectRatio="none" role="presentation">
      <g fill="none" stroke="#b18bf5" strokeOpacity=".12" strokeWidth="1">
        <path d="M208 0 360 0 304 91 360 150 267 191 360 260" />
        <path d="M360 150 304 91 252 128 267 191 186 238 245 306 360 260" />
        <path d="M186 238 109 289 181 345 119 421 205 470 168 540" />
        <path d="M245 306 360 260 322 382 360 467 250 445 168 540" />
      </g>
      <g opacity=".22">
        <path d="m208 0 152 0-56 91Z" fill="#9c69ef" />
        <path d="m304 91 56 59-93 41Z" fill="#6f45c5" />
        <path d="m267 191 93 69-115 46Z" fill="#8d5cde" />
        <path d="m245 306 77 76-117 88Z" fill="#5c37ad" />
        <path d="m322 382 38 85-110-22Z" fill="#a779ed" />
        <path d="m205 470 45-25-82 95Z" fill="#7146c9" />
      </g>
      <path d="M0 485 92 401 119 421 75 540H0Z" fill="#7445cb" opacity=".16" />
      <path d="M0 118 53 84 87 166 0 206Z" fill="#9a70e1" opacity=".08" />
    </svg>
  );
}

function DiamondCrystalFrame() {
  return (
    <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full" viewBox="0 0 360 540" preserveAspectRatio="none" role="presentation">
      <defs>
        <linearGradient id="crystal-edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".92" />
          <stop offset=".35" stopColor="#c9b4ff" stopOpacity=".52" />
          <stop offset=".7" stopColor="#7244d1" stopOpacity=".72" />
          <stop offset="1" stopColor="#f2ebff" stopOpacity=".9" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="url(#crystal-edge)" strokeWidth="2.2">
        <path d="M28 5 7 27v486l22 22h302l22-22V27L331 5Z" />
        <path d="M31 11 14 31v476l18 19h296l18-19V31l-18-20Z" opacity=".55" />
      </g>
      <g opacity=".58">
        <path d="M7 27 28 5h42L42 18Z" fill="#eee8ff" />
        <path d="m290 5 41 0 22 22-38-10Z" fill="#9b72ee" />
        <path d="m7 453 16 35-16 25Z" fill="#ad83ff" />
        <path d="m353 431-18 49 18 33Z" fill="#d7c5ff" />
        <path d="m29 535 45-15 35 15Z" fill="#8c60e6" />
        <path d="m251 535 38-16 42 16Z" fill="#d5c2ff" />
      </g>
    </svg>
  );
}
