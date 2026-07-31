'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, UserPlus, Heart, Crown, FileText, Shield, Code, ScrollText, Save, RefreshCw, Server } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { api } from "@/lib/api";
import { API_ORIGIN } from "@/config/runtime";

const iconMap: Record<string, React.ElementType> = {
 "Maintenance Mode": Wrench,
 "User Registrations": UserPlus,
 "Matching System": Heart,
 "Premium Memberships": Crown,
};

const links = [
 { label: "App Settings", icon: Wrench, action: "app-settings" },
 { label: "API Settings", icon: Code, action: "api-settings" },
 { label: "Privacy Policy", icon: Shield, action: "privacy" },
 { label: "Terms & Conditions", icon: FileText, action: "terms" },
 { label: "Audit Logs", icon: ScrollText, action: "audit" },
];

export default function SettingsPage() {
 const router = useRouter();
 const [toggles, setToggles] = useState([
 { key: "maintenanceMode", label: "Maintenance Mode", desc: "Take the app offline for upgrades.", on: false },
 { key: "userRegistrations", label: "User Registrations", desc: "Allow new signups.", on: true },
 { key: "matchingSystem", label: "Matching System", desc: "Enable smart matching engine.", on: true },
 { key: "premiumMemberships", label: "Premium Memberships", desc: "Allow new subscriptions.", on: true },
 ]);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [saved, setSaved] = useState(false);
 const [error, setError] = useState("");
 const [apiStatus, setApiStatus] = useState<"checking" | "online" | "offline">("checking");

 const fetchSettings = async () => {
 setLoading(true);
 setError("");
 try {
 const res = await api.settings();
 const s = res.settings;
 setToggles([
 { key: "maintenanceMode", label: "Maintenance Mode", desc: "Take the app offline for upgrades.", on: s.maintenanceMode },
 { key: "userRegistrations", label: "User Registrations", desc: "Allow new signups.", on: s.userRegistrations },
 { key: "matchingSystem", label: "Matching System", desc: "Enable smart matching engine.", on: s.matchingSystem },
 { key: "premiumMemberships", label: "Premium Memberships", desc: "Allow new subscriptions.", on: s.premiumMemberships },
 ]);
 } catch {
 setError("Failed to load settings from backend.");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchSettings(); }, []);

 const handleToggle = (key: string) => {
 const t = toggles.find((t) => t.key === key);
 if (key === "maintenanceMode" && !t?.on) {
 if (!window.confirm("⚠️ Enabling Maintenance Mode will take the app offline. Are you sure?")) return;
 }
 setToggles((prev) => prev.map((t) => t.key === key ? { ...t, on: !t.on } : t));
 setSaved(false);
 };

 const handleSave = async () => {
 setSaving(true);
 setError("");
 try {
 const payload = Object.fromEntries(toggles.map((t) => [t.key, t.on])) as Record<string, boolean>;
 await api.updateSettings(payload);
 setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 } catch {
 setError("Failed to save settings to backend.");
 } finally {
 setSaving(false);
 }
 };

 const checkApiStatus = async () => {
 setApiStatus("checking");
 try {
 const response = await fetch(`${API_ORIGIN}/api/health`, { cache: "no-store" });
 setApiStatus(response.ok ? "online" : "offline");
 } catch {
 setApiStatus("offline");
 }
 };

 useEffect(() => { void checkApiStatus(); }, []);

 const scrollToSection = (id: string) => {
 document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
 };

 const handleLinkClick = (action: string) => {
 if (action === "app-settings") scrollToSection("app-settings");
 else if (action === "api-settings") scrollToSection("api-settings");
 else if (action === "privacy") router.push("/privacy-policy");
 else if (action === "terms") router.push("/terms-of-service");
 else if (action === "audit") router.push("/super-admin/logs");
 };

 return (
 <div>
 <PageHeader title="Settings" description="Platform controls and configuration.">
 <div className="flex items-center gap-2">

 <button
 onClick={handleSave}
 disabled={saving || loading}
 className="flex items-center gap-2 h-10 px-4 rounded-lg text-primary-foreground text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
 style={{ background: "var(--gradient-brand)" }}
 >
 <Save className="h-4 w-4" />
 {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
 </button>
 </div>
 </PageHeader>

 {error && (
 <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 text-sm">⚠️ {error}</div>
 )}

 <div id="app-settings" className="scroll-mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
 {toggles.map((t) => {
 const Icon = iconMap[t.label] ?? Wrench;
 return (
 <button
 key={t.label}
 onClick={() => handleToggle(t.key)}
 disabled={loading}
 className={`rounded-2xl bg-card border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all text-left w-full group ${
 t.on ? "border-primary/30 hover:border-primary/60" : "border-border hover:border-border"
 } disabled:opacity-50`}
 >
 <div
 className="h-12 w-12 rounded-xl flex items-center justify-center text-primary-foreground shrink-0 transition-opacity group-hover:opacity-90"
 style={{ background: t.on ? "var(--gradient-brand)" : "var(--muted)" }}
 >
 <Icon className={`h-5 w-5 ${t.on ? "text-white" : "text-muted-foreground"}`} />
 </div>
 <div className="flex-1 min-w-[0px]">
 <p className="font-semibold text-foreground">{t.label}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
 {t.key === "maintenanceMode" && t.on && (
 <p className="text-xs text-rose-600 font-medium mt-1">⚠️ App is currently OFFLINE</p>
 )}
 </div>
 <div className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${t.on ? "bg-primary" : "bg-muted"}`}>
 <div className={`h-5 w-5 bg-white rounded-full shadow-sm transition-transform ${t.on ? "translate-x-5" : ""}`} />
 </div>
 </button>
 );
 })}
 </div>

 <section id="api-settings" className="mb-6 scroll-mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex min-w-0 items-center gap-3">
 <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
 <Server className="h-5 w-5" />
 </div>
 <div className="min-w-0">
 <h2 className="font-semibold text-foreground">API Settings</h2>
 <p className="truncate text-xs text-muted-foreground">Backend endpoint: {API_ORIGIN}</p>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${apiStatus === "online" ? "bg-emerald-50 text-emerald-700" : apiStatus === "offline" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>
 <span className={`h-2 w-2 rounded-full ${apiStatus === "online" ? "bg-emerald-500" : apiStatus === "offline" ? "bg-rose-500" : "animate-pulse bg-amber-500"}`} />
 {apiStatus === "online" ? "API Online" : apiStatus === "offline" ? "API Offline" : "Checking API"}
 </span>
 <button type="button" onClick={checkApiStatus} disabled={apiStatus === "checking"} className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted disabled:opacity-50" aria-label="Refresh API status">
 <RefreshCw className={`h-4 w-4 ${apiStatus === "checking" ? "animate-spin" : ""}`} />
 </button>
 </div>
 </div>
 </section>

 <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-5">
 {links.map((l) => {
 const Icon = l.icon;
 return (
 <button
 key={l.label}
 onClick={() => handleLinkClick(l.action)}
 className="rounded-2xl bg-card border border-border p-4 flex flex-col items-start gap-2 hover:border-primary hover:shadow-md transition-all text-left shadow-sm group"
 >
 <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
 <span className="text-sm font-medium">{l.label}</span>
 </button>
 );
 })}
 </div>
 </div>
 );
}
