'use client';

import { useEffect, useState } from "react";
import {
 Shield, Mail, Phone, Clock, Globe, Key, CheckCircle2,
 AlertCircle, Monitor, Smartphone,
} from "lucide-react";
import { api } from "@/lib/api";

type SuperAdminData = Awaited<ReturnType<typeof api.superAdmin>>["superAdmin"];

export default function SuperAdminPage() {
 const [data, setData] = useState<SuperAdminData | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

 const fetchData = async () => {
 setLoading(true);
 setError("");
 try {
 const res = await api.superAdmin();
 setData(res.superAdmin);
 } catch {
 setError("Failed to load Super Admin data from backend. Is the backend server running?");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => { fetchData(); }, []);

 if (loading) return <LoadingSkeleton />;

 if (error) return (
 <div className="flex flex-col items-center justify-center h-[17.778vw] gap-4">
 <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 flex items-center gap-3 text-sm">
 <AlertCircle className="h-[1.389vw] w-[1.389vw] shrink-0" /> {error}
 </div>
 
 </div>
 );

 if (!data) return null;
 const { profile } = data;

 return (
 <div className="max-w-[88.889vw] pb-20">

 {/* ── Header ── */}
 <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
 <div>
 <h1 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h1>
 <p className="text-sm text-muted-foreground mt-1">Your account details, recent activity, and security settings</p>
 </div>
 
 </div>

 {/* ── Profile Card + Access Level ── */}
 <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-6 mb-6">

 {/* Profile Card */}
 <div className="rounded-2xl bg-card border border-border shadow-sm p-6 flex flex-col items-center text-center gap-3 min-w-[16.667vw]">
 <div className="h-[5.556vw] w-[5.556vw] rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-2xl font-bold shadow-lg">
 {profile.initials}
 </div>
 <div>
 <p className="text-xl font-bold text-foreground">{profile.name}</p>
 <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
 <Shield className="h-[0.833vw] w-[0.833vw]" /> {profile.role}
 </span>
 </div>
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider">
 <span className="h-[0.417vw] w-[0.417vw] rounded-full bg-emerald-500 animate-pulse" /> {profile.status}
 </span>
 <div className="w-full border-t border-border pt-3 space-y-2 text-left text-sm">
 <ProfileRow icon={Mail} label={profile.email} />
 <ProfileRow icon={Phone} label={profile.phone} />
 <ProfileRow icon={Clock} label={`Last login: ${profile.lastLogin}`} />
 <ProfileRow icon={Globe} label={profile.timezone} />
 <ProfileRow icon={Key} label={`ID: ${profile.id}`} />
 <div className="flex items-center gap-2 pt-1">
 <CheckCircle2 className="h-[1.111vw] w-[1.111vw] text-emerald-500 shrink-0" />
 <span className="text-xs text-foreground font-medium">
 2FA {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
 </span>
 </div>
 <div className="text-xs text-muted-foreground">
 <span className="font-semibold text-foreground">Session: </span>{profile.sessionTimeout}
 </div>
 <div className="text-xs text-muted-foreground">
 <span className="font-semibold text-foreground">Joined: </span>{profile.joinedAt}
 </div>
 </div>
 </div>

 {/* Right side: Profile Settings Form & Login Sessions */}
 <div className="space-y-6 min-w-[0vw]">
 {/* Profile Information */}
 <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
 <div className="px-6 py-4 border-b border-border">
 <h2 className="font-semibold text-foreground">Profile Information</h2>
 </div>
 <div className="p-6 space-y-4">
 <div className="flex items-center gap-4 mb-6">
 <div className="h-[4.444vw] w-[4.444vw] rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xl font-bold shadow-lg shrink-0">
 {profile.initials}
 </div>
 <button className="px-4 py-2 text-sm font-medium border border-border bg-background rounded-lg hover:bg-muted transition-colors">
 Change Photo
 </button>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Name</label>
 <input defaultValue={profile.name} className="w-full h-[2.778vw] px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-all" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Email</label>
 <input defaultValue={profile.email} className="w-full h-[2.778vw] px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-all" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Change Password</label>
 <input type="password" placeholder="••••••••" className="w-full h-[2.778vw] px-3 rounded-lg border border-border bg-background text-sm outline-none focus:border-primary transition-all" />
 </div>
 <div>
 <label className="block text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wider">Designation / Role</label>
 <input defaultValue={profile.role} readOnly className="w-full h-[2.778vw] px-3 rounded-lg border border-border bg-muted text-muted-foreground text-sm cursor-not-allowed" />
 </div>
 </div>
 <div className="pt-2">
 <button className="h-[2.778vw] px-6 rounded-lg text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-brand)" }}>
 Save Changes
 </button>
 </div>
 </div>
 </div>

 {/* Login Sessions */}
 <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
 <div className="px-6 py-4 border-b border-border">
 <h2 className="font-semibold text-foreground">Login Sessions</h2>
 </div>
 <div className="p-6 space-y-4">
 <div className="flex items-center justify-between p-4 rounded-xl border border-primary/30 bg-primary/5">
 <div>
 <p className="font-medium text-foreground text-sm flex items-center gap-2">
 <Monitor className="h-[1.111vw] w-[1.111vw] text-primary" /> Current Session
 </p>
 <p className="text-xs text-muted-foreground mt-0.5">Windows • Chrome • {profile.ipWhitelist[0]}</p>
 </div>
 <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider shrink-0">Active Now</span>
 </div>
 <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
 <div>
 <p className="font-medium text-foreground text-sm flex items-center gap-2">
 <Smartphone className="h-[1.111vw] w-[1.111vw] text-muted-foreground" /> iPhone 13 Pro
 </p>
 <p className="text-xs text-muted-foreground mt-0.5">iOS • Safari • 192.168.1.42</p>
 </div>
 <p className="text-xs text-muted-foreground font-medium shrink-0">Last active: 2 hours ago</p>
 </div>
 <div className="pt-2">
 <button className="h-[2.778vw] px-6 rounded-lg border border-rose-200 text-rose-600 bg-rose-50 text-sm font-semibold hover:bg-rose-100 hover:border-rose-300 transition-colors">
 Logout from All Devices
 </button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}

function ProfileRow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
 return (
 <div className="flex items-center gap-2 text-xs">
 <Icon className="h-[0.972vw] w-[0.972vw] text-muted-foreground shrink-0" />
 <span className="text-foreground truncate">{label}</span>
 </div>
 );
}

function LoadingSkeleton() {
 return (
 <div className="max-w-[88.889vw] space-y-6 animate-pulse">
 <div className="h-[2.222vw] w-[17.778vw] bg-muted rounded-lg" />
 <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
 <div className="h-[26.667vw] bg-muted rounded-2xl" />
 <div className="space-y-4">
 <div className="h-[7.778vw] bg-muted rounded-2xl" />
 <div className="grid grid-cols-5 gap-2">
 {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-[5.556vw] bg-muted rounded-xl" />)}
 </div>
 </div>
 </div>
 <div className="h-[13.333vw] bg-muted rounded-2xl" />
 <div className="h-[17.778vw] bg-muted rounded-2xl" />
 </div>
 );
}
