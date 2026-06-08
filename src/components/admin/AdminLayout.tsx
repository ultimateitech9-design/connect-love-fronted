'use client';

import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import {
 LayoutDashboard,
 Users,
 ShieldCheck,
 CreditCard,
 Flag,
 Bell,
 Lock,
 Settings,
 KeyRound,
 ScrollText,
 LogOut,
 HelpCircle,
 User,
 User2,
 ChevronUp,
 Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
 { to: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
 { to: "/super-admin/users", label: "User Management", icon: Users },
 { to: "/super-admin/verification", label: "Verification", icon: ShieldCheck },
 { to: "/super-admin/payments", label: "Payments", icon: CreditCard },
 { to: "/super-admin/reports", label: "Reports", icon: Flag },
 { to: "/super-admin/notifications", label: "Notifications", icon: Bell },
 { to: "/super-admin/security", label: "Security", icon: Lock },
 { to: "/super-admin/settings", label: "Settings", icon: Settings },
 { to: "/super-admin/roles", label: "Roles & Permissions", icon: KeyRound },
 { to: "/super-admin/logs", label: "System Logs", icon: ScrollText },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname() ?? "/";
 const router = useRouter();
 const [profileOpen, setProfileOpen] = useState(false);
 const profileRef = useRef<HTMLDivElement>(null);

 // Pre-warm all pages on mount for instant navigation
 useEffect(() => {
 nav.forEach((item) => router.prefetch(item.to));
 }, [router]);

 const handleMouseEnter = useCallback((to: string) => {
 router.prefetch(to);
 }, [router]);

 // Close dropdown when clicking outside
 useEffect(() => {
 function handleClickOutside(e: MouseEvent) {
 if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
 setProfileOpen(false);
 }
 }
 if (profileOpen) {
 document.addEventListener("mousedown", handleClickOutside);
 }
 return () => document.removeEventListener("mousedown", handleClickOutside);
 }, [profileOpen]);

 const handleLogout = () => {
 setProfileOpen(false);
 };

 if (pathname === "/login") {
 return <>{children}</>;
 }

 return (
 <div className="flex min-h-screen bg-background font-[Inter,ui-sans-serif,system-ui]">
 <aside className="hidden lg:flex w-[17.778vw] flex-col bg-sidebar border-r border-sidebar-border">
 <div className="px-5 pt-6 pb-5 flex items-center gap-3">
 <Heart className="h-[1.667vw] w-[1.667vw] text-primary fill-current shrink-0" />
 <div className="flex flex-col min-w-[0vw]">
 <h1 className="font-extrabold text-xl leading-none tracking-tight truncate">
 <span className="text-white">Connect</span><span className="text-rose-500">Love</span>
 </h1>
 <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1 truncate">Super Admin Panel</p>
 </div>
 </div>
 <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
 {nav.map((item) => {
 const active = pathname === item.to;
 const Icon = item.icon;
 return (
 <button
 key={item.to}
 onClick={(e) => {
 if (item.to === "#logout") {
 e.preventDefault();
 handleLogout();
 } else {
 router.push(item.to);
 }
 }}
 onMouseEnter={() => {
 if (item.to !== "#logout") handleMouseEnter(item.to);
 }}
 className={cn(
 "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer relative",
 active
 ? "bg-gradient-to-r from-primary/40 to-primary/5 text-white shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[2.222vw] before:w-[0.417vw] before:rounded-r-full before:bg-primary"
 : item.to === "#logout"
 ? "text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
 : "text-sidebar-foreground hover:text-white hover:bg-white/5",
 )}
 >
 <Icon className="h-[1.25vw] w-[1.25vw]" />
 {item.label}
 </button>
 );
 })}
 </nav>

 {/* My Profile section */}
 <div className="relative p-3 border-t border-sidebar-border" ref={profileRef}>
 {/* Dropdown menu - appears above the button */}
 {profileOpen && (
 <div className="absolute bottom-[72px] left-3 right-3 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-50">
 <div className="px-4 py-3 border-b border-border bg-muted/40">
 <p className="text-sm font-semibold text-foreground">My Profile</p>
 <p className="text-xs text-muted-foreground">connectlove.com</p>
 </div>
 <div className="p-1.5">
 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
 >
 <LogOut className="h-[1.111vw] w-[1.111vw]" />
 Logout
 </button>
 </div>
 </div>
 )}

 {/* Profile button */}
 <button
 type="button"
 onClick={() => setProfileOpen((open) => !open)}
 className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-sidebar-accent transition-colors"
 >
 <div className="h-[2.5vw] w-[2.5vw] rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center text-xs font-semibold shrink-0">
 MP
 </div>
 <div className="min-w-[0vw] flex-1">
 <p className="text-sm font-semibold truncate text-foreground">My Profile</p>
 <p className="text-xs text-muted-foreground truncate">connectlove.com</p>
 </div>
 <ChevronUp
 className={cn(
 "h-[1.111vw] w-[1.111vw] text-muted-foreground transition-transform duration-200",
 profileOpen ? "rotate-180" : "rotate-0"
 )}
 />
 </button>
 </div>
 </aside>

 <div className="flex-1 flex flex-col min-w-[0vw]">
 <header className="h-[4.444vw] border-b border-border bg-background flex items-center justify-end px-6 gap-6 sticky top-0 z-10">
 <div className="flex items-center gap-5 text-sm">
 <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
 <HelpCircle className="h-[1.111vw] w-[1.111vw]" />
 Support
 </button>
 <span className="flex items-center gap-1.5 text-foreground">
 <span className="h-[0.556vw] w-[0.556vw] rounded-full bg-emerald-500" />
 System Status
 </span>
 <button onClick={() => router.push("/super-admin/notifications")} className="relative h-[2.5vw] w-[2.5vw] rounded-full hover:bg-muted flex items-center justify-center text-foreground transition-colors">
 <Bell className="h-[1.25vw] w-[1.25vw]" />
 <span className="absolute top-1.5 right-2 h-[0.417vw] w-[0.417vw] rounded-full bg-primary" />
 </button>
 </div>
 </header>
 <main className="flex-1 w-[90%] mx-auto py-8 overflow-x-hidden">{children}</main>
 </div>
 </div>
 );
}
