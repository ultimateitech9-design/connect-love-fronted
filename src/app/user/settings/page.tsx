"use client";

import { useState } from "react";
import {
 Eye, MapPin, Image, Bell, Heart, ShieldCheck,
 Lock, Trash2, UserX, Download, ChevronRight,
 Moon, Globe, Smartphone,
} from "lucide-react";

import { useSettings, UserSettings } from "@/features/user/SettingsContext";
import { getToken, clearToken } from "@/lib/auth";

interface Toggle {
 id: keyof UserSettings;
 label: string;
 desc: string;
 icon: React.ComponentType<{ className?: string }>;
}

const privacyToggles: Toggle[] = [
 { id: "showOnlineStatus", label: "Show online status", desc: "Let matches see when you're active.", icon: Eye },
 { id: "showDistance", label: "Show distance", desc: "Display approximate distance on your profile.", icon: MapPin },
 { id: "photosVisibleToNonMatches", label: "Photos visible to non-matches", desc: "Otherwise blurred until you match.", icon: Image },
 { id: "onlyShowVerifiedProfiles", label: "Only show verified profiles", desc: "Hide unverified accounts from discovery.", icon: ShieldCheck },
];

const notifToggles: Toggle[] = [
 { id: "notifyMessages", label: "Message notifications", desc: "Push notifications for new messages.", icon: Bell },
 { id: "notifyMatches", label: "Match notifications", desc: "Be notified when someone matches with you.", icon: Heart },
 { id: "notifyPush", label: "Push notifications", desc: "Receive alerts on your mobile device.", icon: Smartphone },
];

const appToggles: Toggle[] = [
 { id: "language", label: "Language: English", desc: "Change your app display language.", icon: Globe },
];

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
 return (
 <button
 role="switch"
 aria-checked={checked}
 onClick={onChange}
 className={`relative inline-flex h-[1.667vw] w-[3.056vw] shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
 checked
 ? "bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30"
 : "bg-slate-200"
 }`}
 >
 <span
 className={`inline-block h-[1.111vw] w-[1.111vw] transform rounded-full bg-white shadow-md transition-transform ${
 checked ? "translate-x-6" : "translate-x-1"
 }`}
 />
 </button>
 );
}

function ToggleRow({ toggle, checked, onChange }: { toggle: Toggle, checked: boolean, onChange: (v: boolean) => void }) {
 const Icon = toggle.icon;
 return (
 <div className="flex items-center justify-between rounded-2xl bg-card px-5 py-4 shadow-sm border border-border transition-all hover:border-primary/50 group">
 <div className="flex items-center gap-4">
 <div className={`flex h-[2.778vw] w-[2.778vw] shrink-0 items-center justify-center rounded-xl transition-colors ${
 checked
 ? "bg-primary text-primary-foreground"
 : "bg-muted text-muted-foreground"
 }`}>
 <Icon className="h-[1.25vw] w-[1.25vw]" />
 </div>
 <div>
 <p className="text-sm font-semibold text-foreground">{toggle.label}</p>
 <p className="text-xs text-muted-foreground mt-0.5">{toggle.desc}</p>
 </div>
 </div>
 <ToggleSwitch checked={checked} onChange={() => onChange(!checked)} />
 </div>
 );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
 return (
 <section className="mb-6">
 <div className="mb-3 px-1">
 <h2 className="text-lg font-bold text-foreground">{title}</h2>
 {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
 </div>
 <div className="space-y-2">{children}</div>
 </section>
 );
}

function DangerRow({ label, desc, icon: Icon, danger = false, onClick }: { label: string; desc: string; icon: React.ComponentType<{ className?: string }>; danger?: boolean; onClick?: () => void }) {
 return (
 <button
 onClick={onClick}
 className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 shadow-sm border transition-all text-left group ${
 danger
 ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-200 dark:hover:border-rose-800"
 : "bg-card border-border hover:shadow-md"
 }`}
 >
 <div className="flex items-center gap-3">
 <div className={`flex h-[2.222vw] w-[2.222vw] items-center justify-center rounded-lg ${
 danger ? "bg-rose-100 dark:bg-rose-900/50" : "bg-muted"
 }`}>
 <Icon className={`h-[1.111vw] w-[1.111vw] ${danger ? "text-rose-500" : "text-muted-foreground"}`} />
 </div>
 <div>
 <p className={`text-sm font-semibold ${danger ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
 {label}
 </p>
 <p className={`text-xs ${danger ? "text-rose-500/80 dark:text-rose-400/80" : "text-muted-foreground"}`}>{desc}</p>
 </div>
 </div>
 <ChevronRight className={`h-[1.111vw] w-[1.111vw] ${danger ? "text-rose-300 dark:text-rose-700" : "text-muted-foreground"}`} />
 </button>
 );
}

export default function SettingsPage() {
 const { settings, updateSetting } = useSettings();

 const handleDeleteAccount = async () => {
   if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
   try {
     const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
     const res = await fetch(`${API}/users/me`, {
       method: "DELETE",
       headers: { Authorization: `Bearer ${getToken()}` },
     });
     if (res.ok) {
       clearToken();
       window.location.href = "/";
     } else {
       alert("Failed to delete account. Please try again later.");
     }
   } catch (error) {
     console.error("Error deleting account", error);
   }
 };

 return (
 <div className="mx-auto space-y-8 pb-16">
 {/* Header */}
 <div
 className="rounded-3xl p-7 relative overflow-hidden bg-card border-border border"
 >
 {/* decorative circles */}
 <div className="absolute -right-6 -top-6 h-[8.889vw] w-[8.889vw] rounded-full bg-rose-500/10 pointer-events-none" />
 <div className="absolute right-16 -bottom-4 h-[5.556vw] w-[5.556vw] rounded-full bg-pink-400/10 pointer-events-none" />

 <div className="relative">
 <div className="flex items-center gap-3 mb-2">
 <div className="flex h-[2.778vw] w-[2.778vw] items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30">
 <Lock className="h-[1.111vw] w-[1.111vw] text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-foreground">Settings &amp; Privacy</h1>
 <p className="text-sm text-muted-foreground">You decide what&apos;s shared and when.</p>
 </div>
 </div>
 </div>
 </div>

 {/* Privacy & Visibility */}
 <SectionCard title="Privacy & Visibility" subtitle="Control what others see on your profile.">
 {privacyToggles.map((t) => <ToggleRow key={t.id} toggle={t} checked={!!settings[t.id]} onChange={(v) => updateSetting(t.id, v)} />)}
 </SectionCard>

 {/* Notifications */}
 <SectionCard title="Notifications" subtitle="Choose when and how we contact you.">
 {notifToggles.map((t) => <ToggleRow key={t.id} toggle={t} checked={!!settings[t.id]} onChange={(v) => updateSetting(t.id, v)} />)}
 </SectionCard>

 {/* App Preferences */}
 <SectionCard title="App Preferences" subtitle="Customize your app experience.">
 {appToggles.map((t) => <ToggleRow key={t.id} toggle={t} checked={!!settings[t.id]} onChange={(v) => updateSetting(t.id, v)} />)}
 </SectionCard>

 {/* Account */}
 <SectionCard title="Account" subtitle="Manage your account data and access.">
 <DangerRow
 label="Download my data"
 desc="Get a copy of your ConnectLove data."
 icon={Download}
 onClick={() => alert("Data archive will be sent to your email.")}
 />
 <DangerRow
 label="Deactivate account"
 desc="Temporarily pause your profile from discovery."
 icon={UserX}
 onClick={() => alert("Account deactivated.")}
 />
 <DangerRow
 label="Delete account"
 desc="Permanently remove your account and all data."
 icon={Trash2}
 danger={true}
 onClick={handleDeleteAccount}
 />
 </SectionCard>

 {/* Footer note */}
 <p className="text-center text-xs text-muted-foreground pb-2">
 ConnectLove &bull; Privacy Policy &bull; Terms of Service
 </p>
 </div>
 );
}
