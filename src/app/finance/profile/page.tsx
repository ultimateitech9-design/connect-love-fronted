"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { LogOut, Save, User } from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
 const [name, setName] = useState("");
 const [email, setEmail] = useState("admin@connectlove.com");
 const [password, setPassword] = useState("");
 const [role, setRole] = useState("Finance Manager");

 return (
 <DashboardLayout title="My Profile" subtitle="Manage your ConnectLove Finance administrator account.">
 <div className="">
 <div className="rounded-2xl bg-card border border-border p-6 md:p-8">
 <div className="flex items-center gap-4 mb-8">
 <div className="size-16 rounded-full grid place-items-center text-white text-2xl font-semibold shadow-[0_10px_30px_-10px_rgba(244,114,182,0.5)]" style={{ background: "linear-gradient(135deg, #f472b6, #f9a8d4)" }}>
 {name ? name.charAt(0).toUpperCase() : <User className="size-8" />}
 </div>
 <div>
 <h2 className="text-xl font-semibold">{name || "Finance Manager"}</h2>
 </div>
 </div>

 <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <label className="block">
 <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</span>
 <input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 className="h-[44px] px-4 rounded-lg bg-muted text-sm outline-none focus:ring-2 focus:ring-ring w-full transition-shadow"
 />
 </label>

 <label className="block">
 <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</span>
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="h-[44px] px-4 rounded-lg bg-muted text-sm outline-none focus:ring-2 focus:ring-ring w-full transition-shadow"
 />
 </label>

 <label className="block">
 <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</span>
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="h-[44px] px-4 rounded-lg bg-muted text-sm outline-none focus:ring-2 focus:ring-ring w-full transition-shadow"
 placeholder="••••••••"
 />
 </label>

 <label className="block">
 <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Role</span>
 <input
 type="text"
 value={role}
 onChange={(e) => setRole(e.target.value)}
 className="h-[44px] px-4 rounded-lg bg-muted text-sm outline-none focus:ring-2 focus:ring-ring w-full transition-shadow"
 />
 </label>
 </div>

 <div className="border-t border-border pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
 <button
 type="button"
 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[44px] px-6 rounded-lg text-destructive font-medium bg-destructive/10 hover:bg-destructive/20 transition-colors"
 onClick={() => alert("Logged out!")}
 >
 <LogOut className="size-4" />
 Logout Account
 </button>

 <button
 type="submit"
 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-[44px] px-8 rounded-lg text-white font-medium shadow-[0_10px_30px_-10px_rgba(244,114,182,0.5)] transition-transform active:scale-95 hover:opacity-90"
 style={{ background: "linear-gradient(135deg, #f472b6, #f9a8d4)" }}
 >
 <Save className="size-4" />
 Save Changes
 </button>
 </div>
 </form>
 </div>
 </div>
 </DashboardLayout>
 );
}
