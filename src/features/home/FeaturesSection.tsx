/* eslint-disable */
"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Check, Crown, Zap, Heart, MessageCircle, Star, Shield, Sparkles, Video, Globe } from "lucide-react";

const basicFeatures = [
  { icon: Heart, title: "Smart Matching", desc: "AI-powered compatibility algorithm based on personality & values", href: "/user/discover" },
  { icon: MessageCircle, title: "Basic Messaging", desc: "Text chat with up to 5 active matches per day", href: "/user/messages" },
  { icon: Star, title: "Profile Creation", desc: "Detailed profile with photos and personality badges", href: "/user/profile" },
  { icon: Shield, title: "Safety Reports", desc: "Report and block suspicious profiles instantly", href: "/#support" },
];

const premiumFeatures = [
  { icon: Sparkles, title: "Unlimited Matches", desc: "No daily limit — explore as many connections as you want" },
  { icon: Crown, title: "Priority Visibility", desc: "Appear at the top of discovery queues in your area", href: "/user/premium" },
  { icon: Video, title: "Video Dates", desc: "Built-in encrypted video calling before meeting in person", href: "/user/messages" },
  { icon: Globe, title: "Global Search", desc: "Connect with singles worldwide, not just your city", href: "/user/discover" },
  { icon: Zap, title: "Instant Icebreakers", desc: "AI-generated conversation starters tailored to both profiles", href: "/user/messages" },
  { icon: Shield, title: "Verified Badge", desc: "Government ID verification — stand out as a trusted member" },
];

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    description: "Start your journey",
    color: "from-slate-100 to-slate-50",
    border: "border-slate-200",
    btn: "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white",
    features: ["5 matches per day", "Basic messaging", "Profile creation", "Safety tools"],
    popular: false,
  },
  {
    name: "Gold",
    price: "₹199",
    period: "per month",
    description: "Most popular choice",
    color: "from-rose-500 via-pink-500 to-rose-600",
    border: "border-rose-500",
    btn: "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:brightness-110 shadow-md shadow-rose-500/20",
    features: ["Unlimited matches", "Priority visibility", "Video dates", "AI icebreakers", "Read receipts", "Advanced filters"],
    popular: true,
  },
  {
    name: "Platinum",
    price: "₹399",
    period: "per month",
    description: "The ultimate experience",
    color: "from-purple-600 to-indigo-700",
    border: "border-purple-500",
    btn: "bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:brightness-110 shadow-md shadow-purple-500/20",
    features: ["Everything in Gold", "Global search", "Verified badge", "Dedicated support", "Profile boost daily", "Exclusive events"],
    popular: false,
  },
];

export function FeaturesSection() {
  const [tab, setTab] = useState<"basic" | "premium">("basic");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const openFeature = (feature: { title: string; href?: string }) => {
    const routes: Record<string, string> = {
      "Smart Matching": "/user/discover",
      "Basic Messaging": "/user/messages",
      "Profile Creation": "/user/profile",
      "Safety Reports": "/#support",
      "Unlimited Matches": "/user/discover",
      "Priority Visibility": "/user/premium",
      "Video Dates": "/user/messages",
      "Global Search": "/user/discover",
      "Instant Icebreakers": "/user/messages",
      "Verified Badge": "/user/profile",
    };
    window.location.href = feature.href || routes[feature.title] || "/";
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

          <div className="grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative h-full rounded-[32px] overflow-hidden flex flex-col transition-all duration-300 ${
                  plan.popular
                    ? "ring-2 ring-rose-500 shadow-xl shadow-rose-500/20 z-10"
                    : "border border-slate-200/80 shadow-sm bg-white hover:border-slate-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 py-1.5 text-center text-[10px] font-extrabold tracking-widest text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 shadow-inner">
                    ✦ MOST POPULAR ✦
                  </div>
                )}
                
                {/* Plan Header */}
                <div className={`min-h-[144px] bg-gradient-to-br ${plan.color} p-7 ${plan.popular ? "pt-10" : ""} text-${plan.popular ? "white" : "slate-900"}`}>
                  <p className={`text-xs font-extrabold tracking-wider uppercase ${plan.popular ? "text-rose-100" : "text-slate-400"}`}>
                    {plan.name}
                  </p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-[2rem] font-black tracking-tight leading-none sm:text-4xl">{plan.price}</span>
                    <span className={`mb-0.5 text-xs font-semibold ${plan.popular ? "text-rose-100/85" : "text-slate-400"}`}>
                      /{plan.period}
                    </span>
                  </div>
                  <p className={`mt-2 text-xs ${plan.popular ? "text-rose-100/70" : "text-slate-400"}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Plan Body */}
                <div className="bg-white p-7 flex-1 flex flex-col justify-between">
                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-500">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = plan.name === "Free" ? "/register" : "/user/premium";
                    }}
                    className={`w-full py-3.5 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-center ${
                      plan.popular
                        ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/25 hover:brightness-110"
                        : plan.btn
                    }`}
                  >
                    {plan.name === "Free" ? "Get Started Free" : `Buy ${plan.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
