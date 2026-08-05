"use client";

import { useState } from "react";
import { Check, Gem, Star, Lock, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { directFetch } from "@/lib/api";
import { DiamondArtwork, DiamondCrystalFrame, DiamondFacetBackground } from "@/features/home/FeaturesSection";

declare global {
 interface Window {
  Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: (response: any) => void) => void };
 }
}

function loadRazorpayCheckout() {
 if (window.Razorpay) return Promise.resolve(true);
 return new Promise<boolean>((resolve) => {
  const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
  if (existing) {
   existing.addEventListener("load", () => resolve(true), { once: true });
   existing.addEventListener("error", () => resolve(false), { once: true });
   return;
  }
  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
 });
}

interface Plan {
 id: string;
 name: string;
 tagline: string;
 price: number;
 period: string;
 popular: boolean;
 buttonLabel: string;
 tier: "free" | "gold" | "diamond";
 features: string[];
}

const plans: Plan[] = [
 {
 id: "basic",
 name: "Free",
 tagline: "Start your journey",
 price: 0,
 period: "forever",
 popular: false,
 tier: "free",
 buttonLabel: "Get Started Free",
 features: ["5 matches per day", "Basic messaging", "Profile creation", "Safety tools"],
 },
 {
 id: "premium",
 name: "Gold",
 tagline: "Most popular choice",
 price: 199,
 period: "per month",
 popular: true,
 tier: "gold",
 buttonLabel: "Buy Gold",
 features: ["Unlimited matches", "Priority visibility", "Video dates", "AI icebreakers", "Read receipts", "Advanced filters"],
 },
 {
 id: "elite",
 name: "Diamond",
 tagline: "The ultimate experience",
 price: 399,
 period: "per month",
 popular: false,
 tier: "diamond",
 buttonLabel: "Buy Diamond",
 features: ["Everything in Gold", "Global search", "Verified badge", "Dedicated support", "Profile boost daily", "Exclusive events"],
 },
];

export default function PremiumPage() {
 const [selected, setSelected] = useState<string | null>(null);

 const handleChoose = async (plan: Plan) => {
 if (plan.id === "basic") {
 toast.success("You're already on the Basic plan — explore and enjoy!");
 return;
 }
 setSelected(plan.id);
 try {
  const loaded = await loadRazorpayCheckout();
  if (!loaded || !window.Razorpay) throw new Error("Payment checkout could not be loaded.");
  const order = await directFetch<{
   keyId: string; orderId: string; amount: number; currency: string; planName: string;
   customer: { name: string; email: string };
  }>("/payments/razorpay/order", { method: "POST", body: JSON.stringify({ plan: plan.id }) });
  const checkout = new window.Razorpay({
   key: order.keyId,
   amount: order.amount,
   currency: order.currency,
   name: "ConnectLove",
   description: `${order.planName} - 30 days`,
   order_id: order.orderId,
   prefill: { name: order.customer.name, email: order.customer.email },
   theme: { color: plan.id === "elite" ? "#7c3aed" : "#2563eb" },
   modal: { confirm_close: true },
   handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
    try {
     await directFetch("/payments/razorpay/verify", { method: "POST", body: JSON.stringify(response) });
     toast.success(`${plan.name} activated for 30 days!`);
     window.setTimeout(() => window.location.reload(), 900);
    } catch {
     toast.error("Payment received, but verification is pending. Please contact support if the plan does not activate.");
    } finally {
     setSelected(null);
    }
   },
  });
  checkout.on("payment.failed", () => {
   setSelected(null);
   toast.error("Payment failed. No payment has been confirmed by ConnectLove.");
  });
  checkout.open();
 } catch (error) {
  setSelected(null);
  toast.error(error instanceof Error ? error.message : "Unable to start payment.");
 }
 };

 return (
 <div className="pb-8 -mx-6 -mt-6 px-6 pt-6 rounded-none transition-colors"
 style={{ background: "var(--background-gradient, linear-gradient(135deg,#fff5f7 0%,#fdf2f8 40%,#f5f3ff 100%))", minHeight: "calc(100vh - 4rem)" }}
 >
 {/* ── Hero ─────────────────────────────────────────────────────────────── */}
 <div className="pt-12 pb-10 text-center px-4 relative">
 {/* Decorative hearts */}
 <div className="pointer-events-none absolute left-[8%] top-8 text-4xl opacity-70 rotate-[-15deg]">🩷</div>
 <div className="pointer-events-none absolute right-[8%] top-10 text-5xl opacity-60 rotate-[10deg]">🩷</div>
 <div className="pointer-events-none absolute left-[20%] bottom-0 text-3xl opacity-50 rotate-[5deg]">🩷</div>
 <div className="pointer-events-none absolute right-[22%] bottom-2 text-2xl opacity-40 rotate-[-8deg]">🩷</div>

 {/* Badge */}
 <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase mb-5"
 style={{ background: "rgba(244,63,94,0.1)", color: "#f43f5e", border: "1px solid rgba(244,63,94,0.2)" }}
 >
 <span>🩷</span> Choose Your Plan
 </div>

 <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
 Find Your{" "}
 <span className="text-rose-500" style={{ fontStyle: "italic" }}>Perfect</span>{" "}
 Match
 </h1>
 <p className="mt-3 text-slate-500 dark:text-slate-400 text-base mx-auto">
 Upgrade your experience and connect with amazing people
 </p>
 </div>

 {/* ── Plans Grid ───────────────────────────────────────────────────────── */}
 <div className="mx-auto px-4">
 <div className="mx-auto grid max-w-6xl items-stretch gap-6 md:grid-cols-3 md:gap-4 lg:gap-5">
 {plans.map((plan) => {
  const isFree = plan.tier === "free";
  const isGold = plan.tier === "gold";
  const isDiamond = plan.tier === "diamond";
  return (
   <article
    key={plan.id}
    className={`relative isolate flex min-h-[520px] flex-col rounded-[28px] p-[2px] transition duration-500 hover:-translate-y-1.5 ${
     isFree
      ? "bg-gradient-to-br from-white via-stone-200 to-white shadow-[0_18px_48px_rgba(71,58,42,0.16)]"
      : isGold
       ? "z-10 bg-gradient-to-br from-[#f9dc99] via-[#8a6127] to-[#f6d17c] shadow-[0_20px_56px_rgba(120,79,20,0.34)] md:-translate-y-2"
       : "premium-diamond-shell overflow-visible bg-[conic-gradient(from_210deg,#eee9ff,#7549dc,#c8b8ff,#5f38b8,#eee9ff,#7144d5,#d9caff)] shadow-[0_20px_58px_rgba(105,60,220,0.55)]"
    }`}
   >
    {plan.popular && (
     <div className="absolute -top-4 left-1/2 z-30 flex h-9 -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-[#ffe6a7] bg-gradient-to-b from-[#f7d58a] via-[#c89346] to-[#9b692a] px-5 text-[10px] font-black tracking-[0.16em] text-[#17120a] shadow-lg">
      <Star className="h-3 w-3 fill-current" /> MOST POPULAR <Star className="h-3 w-3 fill-current" />
     </div>
    )}
    <div className={`relative flex h-full flex-1 flex-col overflow-hidden rounded-[26px] border ${
     isFree
      ? "border-white/90 bg-[linear-gradient(145deg,#fffdf9_0%,#f5f0e9_48%,#fffdfa_100%)] text-slate-950"
      : isGold
       ? "border-[#8e682e] bg-[linear-gradient(145deg,#171716_0%,#090909_54%,#1b1813_100%)] text-white"
       : "border-violet-100/70 bg-[linear-gradient(145deg,#291448_0%,#100823_50%,#1d1244_100%)] text-white shadow-[inset_0_0_0_2px_rgba(166,132,255,.3),inset_0_0_30px_rgba(131,82,231,.2)]"
    }`}>
     <div className={`pointer-events-none absolute inset-0 ${isGold ? "bg-[radial-gradient(circle_at_82%_3%,rgba(255,211,124,.16),transparent_30%)]" : isDiamond ? "bg-[radial-gradient(circle_at_80%_10%,rgba(194,160,255,.42),transparent_34%),linear-gradient(125deg,transparent_12%,rgba(255,255,255,.08)_25%,transparent_40%)]" : "bg-[linear-gradient(124deg,transparent_8%,rgba(255,255,255,.9)_27%,transparent_43%)]"}`} />
     {isDiamond && <>
      <DiamondFacetBackground />
      <DiamondCrystalFrame />
      <div className="premium-gem-float pointer-events-none absolute -right-1 top-7 z-10 h-32 w-40" aria-hidden="true">
       <div className="absolute inset-2 scale-125 rounded-full bg-violet-300/35 blur-2xl" />
       <DiamondArtwork />
      </div>
      <span className="premium-shard pointer-events-none absolute right-[31%] top-[31%] z-10 h-3 w-5 rotate-[-14deg] bg-gradient-to-br from-white via-violet-200 to-violet-600 [clip-path:polygon(0_45%,100%_0,70%_100%)]" />
      <span className="premium-shard pointer-events-none absolute right-[20%] top-[30%] z-10 h-2.5 w-4 rotate-[18deg] bg-gradient-to-br from-white via-violet-200 to-violet-600 [animation-delay:.7s] [clip-path:polygon(0_45%,100%_0,70%_100%)]" />
      <span className="premium-shard pointer-events-none absolute right-[12%] top-[34%] z-10 h-2 w-3.5 rotate-[-8deg] bg-gradient-to-br from-white via-violet-200 to-violet-700 [animation-delay:1.2s] [clip-path:polygon(0_40%,100%_0,68%_100%)]" />
     </>}
     {isDiamond && <div className="pointer-events-none absolute inset-[7px] z-[4] rounded-[21px] border border-violet-100/55 shadow-[inset_0_0_0_1px_rgba(168,128,255,.42),inset_0_0_24px_rgba(168,128,255,.2)]" />}
     <header className={`relative z-10 p-6 ${isDiamond ? "min-h-[190px]" : "min-h-[182px]"} ${isGold ? "pt-8" : ""}`}>
      <div className="flex items-center justify-between gap-4">
       <p className={`text-sm font-black uppercase tracking-[0.13em] ${isFree ? "text-stone-500" : isGold ? "text-[#f2cf7d]" : "text-violet-50"}`}>
        <span className="inline-flex items-center gap-2">{plan.name}{isDiamond && <Gem className="h-4 w-4 fill-violet-200/50" />}</span>
       </p>
       {isGold && <span className="grid h-10 w-10 place-items-center rounded-full border border-[#9e7538] bg-black/50 text-[#f0c76c]"><Gem className="h-5 w-5" /></span>}
      </div>
      <div className="mt-5 flex items-end gap-2">
       <span className={`text-[2.65rem] font-black leading-none ${isGold ? "bg-gradient-to-b from-[#ffe6a2] to-[#b77a27] bg-clip-text text-transparent" : isDiamond ? "text-violet-100" : "text-slate-950"}`}>₹{plan.price}</span>
       <span className={`mb-1 text-sm ${isFree ? "text-stone-500" : isGold ? "text-[#d5b26b]" : "text-violet-200"}`}>/{plan.period}</span>
      </div>
      <p className={`mt-3 text-sm ${isFree ? "text-stone-500" : isGold ? "text-[#c4a56a]" : "text-violet-200/90"}`}>{plan.tagline}</p>
     </header>
     <div className={`relative z-10 mx-2 mb-2 flex flex-1 flex-col rounded-[22px] border p-5 ${isFree ? "border-white/90 bg-white/75" : isGold ? "border-[#705326]/80 bg-black/35" : "border-violet-300/20 bg-[#160c35]/80"}`}>
      <ul className="mb-6">
       {plan.features.map((feature) => (
        <li key={feature} className={`flex min-h-10 items-center gap-3 border-b text-[13px] last:border-b-0 ${isFree ? "border-stone-300/45 text-slate-700" : isGold ? "border-white/[0.06] text-stone-200" : "border-violet-200/10 text-violet-50"}`}>
         <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${isFree ? "border-stone-300 text-stone-500" : isGold ? "border-[#a97c38] text-[#e6bd66]" : "border-violet-400 text-violet-300"}`}><Check className="h-3.5 w-3.5" /></span>
         {feature}
        </li>
       ))}
      </ul>
      <button
       type="button"
       onClick={() => handleChoose(plan)}
       disabled={selected !== null}
       className={`mt-auto h-12 w-full rounded-full border text-sm font-black shadow-lg transition hover:scale-[1.025] disabled:cursor-wait disabled:opacity-70 ${isFree ? "border-slate-800 bg-gradient-to-b from-[#292929] to-[#090909] text-white" : isGold ? "border-[#ffe0a0] bg-gradient-to-r from-[#b77a2e] via-[#f4d28a] to-[#b77a2e] text-[#171108]" : "border-violet-100/90 bg-[linear-gradient(100deg,#6f49bd_0%,#c9b2f7_48%,#8d68d9_100%)] text-[#1d1035]"}`}
      >
       {selected === plan.id ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Opening payment...</span> : plan.buttonLabel}
      </button>
     </div>
    </div>
   </article>
  );
 })}
 </div>

 {/* ── Footer trust badges ──────────────────────────────────────────────── */}
 <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
 <span className="flex items-center gap-1.5">
 <Lock className="h-[16px] w-[16px] text-slate-400" /> Secure Payment
 </span>
 <span className="text-slate-200">•</span>
 <span className="flex items-center gap-1.5">
 <Shield className="h-[16px] w-[16px] text-slate-400" /> Cancel Anytime
 </span>
 <span className="text-slate-200">•</span>
 <span>100% Safe &amp; Private</span>
 </div>
 <style jsx global>{`
  @keyframes premium-diamond-border {
   0%, 100% { filter: brightness(1) saturate(1); }
   50% { filter: brightness(1.18) saturate(1.15); }
  }
  @keyframes premium-gem-float {
   0%, 100% { transform: translateY(0) rotate(-2deg); filter: brightness(1); }
   50% { transform: translateY(-7px) rotate(2deg); filter: brightness(1.18); }
  }
  @keyframes premium-facet-drift {
   0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: .72; }
   50% { transform: translate3d(-3px,4px,0) scale(1.015); opacity: .9; }
  }
  @keyframes premium-shard-glint {
   0%, 100% { filter: brightness(.85); transform: translateY(0); }
   50% { filter: brightness(1.7) drop-shadow(0 0 6px rgba(221,205,255,.9)); transform: translateY(-3px); }
  }
  .premium-diamond-shell { animation: premium-diamond-border 3.4s ease-in-out infinite; }
  .premium-gem-float { animation: premium-gem-float 3.8s ease-in-out infinite; }
  .premium-diamond-shell .pricing-diamond-facets { animation: premium-facet-drift 8s ease-in-out infinite; }
  .premium-shard { animation: premium-shard-glint 2.6s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
   .premium-diamond-shell, .premium-gem-float, .premium-diamond-shell .pricing-diamond-facets, .premium-shard { animation: none !important; }
  }
 `}</style>
 </div>
 </div>
 );
}
