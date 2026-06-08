'use client';

import { useEffect, useState } from "react";
import { X, Star, Heart, Zap, Globe, EyeOff, ShieldCheck, MessageCircle, Eye, Award, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "@/lib/api";

interface Feature { icon: LucideIcon; label: string; muted?: boolean }
interface PlanCardProps {
 tag: string; title: string; subtitle: string; price: string;
 features: Feature[]; cta: string; ctaVariant: "ghost" | "primary" | "dark";
 featured?: boolean; onSelect: () => void; selected?: boolean;
}

const planDetails = [
 {
 tag: "FREE PLAN", title: "Basic Access", subtitle: "The essential dating experience", price: "Free",
 features: [
 { icon: Heart, label: "50 daily likes limit" }, { icon: Globe, label: "Basic discovery filters" },
 { icon: Eye, label: "Standard profile appearance" }, { icon: X, label: "No profile boosts", muted: true },
 ],
 cta: "Current Plan", ctaVariant: "ghost" as const,
 },
 {
 tag: "PREMIUM MATCH", title: "Elevate Your Match", subtitle: "Speed up your connection time", featured: true, price: "$9.99",
 features: [
 { icon: Star, label: "Unlimited daily likes" }, { icon: Zap, label: "1 Profile Boost per month" },
 { icon: Heart, label: "5 Super Likes per week" }, { icon: Globe, label: "Passport: Match anywhere" },
 { icon: EyeOff, label: "Hide your ads completely" },
 ],
 cta: "Upgrade to Premium", ctaVariant: "primary" as const,
 },
 {
 tag: "ULTIMATE", title: "The Ultimate Connection", subtitle: "VIP status and priority visibility", price: "$29.99",
 features: [
 { icon: Star, label: "Priority Likes" }, { icon: MessageCircle, label: "Message before matching" },
 { icon: Eye, label: "See who likes you" }, { icon: Award, label: "Exclusive VIP profile badge" },
 ],
 cta: "Get Ultimate", ctaVariant: "dark" as const,
 },
];

export default function PaymentsPage() {
 const [plans, setPlans] = useState<{ name: string; price: string; status: string }[]>([]);
 const [loading, setLoading] = useState(true);
 const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
 const [error, setError] = useState("");

 const fetchPlans = async () => {
 setLoading(true);
 setError("");
 try {
 const res = await api.payments();
 setPlans(res.plans);
 } catch {
 setError("Payments data load nahi hua.");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchPlans(); }, []);

 const handleSelect = (planName: string, cta: string) => {
 if (cta === "Current Plan") return;
 setSelectedPlan(planName);
 };

 return (
 <div className="max-w-[76.389vw] mx-auto">
 <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
 <div className="text-center flex-1">
 <h1 className="text-4xl font-bold text-primary tracking-tight">Choose Your Experience</h1>
 <p className="text-sm text-secondary mt-3 mx-auto leading-relaxed">
 Elevate your dating journey with tools designed for meaningful connections.
 </p>
 </div>
 
 </div>

 {error && (
 <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm">⚠️ {error}</div>
 )}

 {/* Live price from backend */}
 {!loading && plans.length > 0 && (
 <div className="mb-4 flex justify-center gap-4 flex-wrap text-xs text-muted-foreground">
 {plans.map((p) => (
 <span key={p.name} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border">
 <span className="font-semibold text-foreground">{p.name}</span>
 <span>—</span>
 <span className="text-primary font-bold">{p.price}/mo</span>
 </span>
 ))}
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 items-stretch">
 {planDetails.map((plan) => (
 <PlanCard
 key={plan.title}
 {...plan}
 selected={selectedPlan === plan.title}
 onSelect={() => handleSelect(plan.title, plan.cta)}
 />
 ))}
 </div>

 <div className="rounded-2xl bg-card border border-border p-6">
 <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-center">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <ShieldCheck className="h-[1.389vw] w-[1.389vw] text-secondary" />
 <h3 className="font-semibold text-foreground">Safe Browsing Guarantee</h3>
 </div>
 <p className="text-xs text-muted-foreground leading-relaxed">
 Our administrative team utilizes advanced real-time moderation and AI-driven oversight to ensure every profile is verified and genuine.
 </p>
 </div>
 <div className="grid grid-cols-2 gap-4 text-center">
 {[
 { value: "24/7", label: "Live Support", tone: "primary" },
 { value: "100%", label: "Encrypted", tone: "secondary" },
 { value: "98%", label: "Trust Rating", tone: "primary" },
 { value: "Zero", label: "Bot Tolerance", tone: "secondary" },
 ].map((t) => (
 <div
 key={t.label}
 className="rounded-xl p-2"
 >
 <p className={`text-xl font-bold ${t.tone === "primary" ? "text-primary" : "text-secondary"}`}>{t.value}</p>
 <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">{t.label}</p>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 );
}

function PlanCard({ tag, title, subtitle, price, features, cta, ctaVariant, featured, onSelect, selected }: PlanCardProps & { price: string }) {
 return (
 <div className={
 "relative rounded-2xl bg-card border p-6 flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg " +
 (selected ? "border-primary border-2 shadow-[var(--shadow-brand)] scale-[1.02]" :
 featured ? "border-primary border-2 shadow-[var(--shadow-brand)]" : "border-border hover:border-primary/40")
 }>
 {featured && !selected && (
 <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg rounded-tr-2xl">
 ★ POPULAR
 </div>
 )}
 {selected && (
 <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg rounded-tr-2xl flex items-center gap-1">
 <Check className="h-[0.833vw] w-[0.833vw]" /> SELECTED
 </div>
 )}
 <p className={`font-mono text-[10px] font-semibold uppercase tracking-[0.14em] mb-3 ${featured || selected ? "text-primary" : "text-muted-foreground"}`}>{tag}</p>
 <h3 className="text-xl font-bold text-foreground">{title}</h3>
 <p className="text-xs text-secondary mt-1 mb-5">{subtitle}</p>
 <div className="mb-5">
 <span className={`text-3xl font-bold ${featured || selected ? "text-primary" : "text-foreground"}`}>{price}</span>
 <span className="text-sm text-muted-foreground">/month</span>
 </div>
 <ul className="space-y-3 mb-6 flex-1">
 {features.map((f) => (
 <li key={f.label} className={`flex items-center gap-3 text-sm ${f.muted ? "text-muted-foreground line-through" : "text-foreground"}`}>
 <f.icon className={`h-[1.111vw] w-[1.111vw] shrink-0 ${f.muted ? "text-muted-foreground" : featured || selected ? "text-primary" : "text-secondary"}`} />
 {f.label}
 </li>
 ))}
 </ul>
 <button
 onClick={onSelect}
 className={
 "w-full h-[3.056vw] rounded-lg font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] " +
 (ctaVariant === "primary"
 ? "bg-primary text-primary-foreground hover:opacity-95"
 : ctaVariant === "dark"
 ? "bg-slate-700 text-white hover:bg-slate-800"
 : "bg-secondary/10 text-secondary hover:bg-secondary/20")
 }
 >
 {cta}
 </button>
 </div>
 );
}
