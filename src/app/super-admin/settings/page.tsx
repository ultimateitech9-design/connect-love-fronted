'use client';

import { useEffect, useState } from "react";
import { Wrench, UserPlus, Heart, Crown, FileText, Shield, Code, ScrollText, Save } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { api } from "@/lib/api";

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

 const handleLinkClick = (_action: string) => {};

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

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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
 <div className="flex-1 min-w-[0vw]">
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

 <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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
