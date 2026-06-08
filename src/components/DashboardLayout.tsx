"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
 LayoutDashboard,
 CreditCard,
 Receipt,
 Undo2,
 FileBarChart,
 FileText,
 History,
 BookOpen,
 Heart,
 Bell,
 Search,
 User,
 LogOut,
 ChevronDown
} from "lucide-react";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactNode } from "react";

const nav = [
 { to: "/finance", label: "Overview", icon: LayoutDashboard },
 { to: "/finance/subscriptions", label: "Subscriptions", icon: CreditCard },
 { to: "/finance/transactions", label: "Transactions", icon: Receipt },
 { to: "/finance/refunds", label: "Refunds", icon: Undo2 },
 { to: "/finance/invoices/generate", label: "Generate Invoices", icon: FileText },
 { to: "/finance/invoices/billing", label: "Billing Records", icon: BookOpen },
 { to: "/finance/reports", label: "Reports", icon: FileBarChart },
];

export function DashboardLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
 const pathname = usePathname();
 const router = useRouter();

 return (
 <div className="min-h-screen flex bg-background">
 <aside className="w-[17.778vw] shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
 <div className="px-6 py-6 flex items-center gap-2">
 <div className="size-9 rounded-xl grid place-items-center text-primary-foreground" style={{ background: "var(--gradient-rose)" }}>
 <Heart className="size-5 fill-current" />
 </div>
 <div>
 <div className="font-semibold leading-tight">
 <span className="text-foreground">Connect</span>
 <span className="text-[#ff0000]">Love</span>
 </div>
 <div className="text-xs text-muted-foreground">Finance</div>
 </div>
 </div>
 <nav className="flex-1 px-3 space-y-1">
 {nav.map((item) => {
 const Icon = item.icon;
 const active = pathname === item.to;
 return (
 <button
 key={item.to}
 onClick={() => router.push(item.to)}
 className={`relative flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
 active
 ? "bg-gradient-to-r from-primary/20 to-primary/5 text-white font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[2.222vw] before:w-[0.278vw] before:rounded-r-full before:bg-primary"
 : "text-sidebar-foreground hover:bg-white/5 hover:text-white"
 }`}
 >
 <Icon className="size-4" />
 {item.label}
 </button>
 );
 })}
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <button
 className={`relative flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all mt-1 ${
 pathname === "/finance/profile"
 ? "bg-gradient-to-r from-pink-400/20 to-pink-400/5 text-white font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[2.222vw] before:w-[0.278vw] before:rounded-r-full before:bg-pink-400"
 : "text-pink-300 hover:bg-pink-400/10 hover:text-pink-200"
 }`}
 >
 <div className="flex items-center gap-3">
 <User className="size-4" />
 My Profile
 </div>
 <ChevronDown className="size-4 opacity-50" />
 </button>
 </DropdownMenuTrigger>
 <DropdownMenuContent className="w-[13.333vw] ml-2" align="start" side="bottom">
 <DropdownMenuItem onClick={() => router.push("/finance/profile")} className="cursor-pointer">
 <User className="mr-2 size-4" />
 <span>View Profile</span>
 </DropdownMenuItem>
 <DropdownMenuItem onClick={() => alert("Logged out!")} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
 <LogOut className="mr-2 size-4" />
 <span>Logout</span>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </nav>
 </aside>

 <main className="flex-1 min-w-[0vw]">
 <header className="h-[4.444vw] border-b border-border bg-card/60 backdrop-blur px-8 flex items-center justify-between">
 <div className="relative w-[22.222vw] ">
 <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input
 placeholder="Search transactions, users…"
 className="w-full h-[2.778vw] pl-9 pr-3 rounded-lg bg-muted text-sm outline-none focus:ring-2 focus:ring-ring"
 />
 </div>
 <div className="flex items-center gap-3">
 <button onClick={() => router.push("/finance/notifications")} className="size-10 grid place-items-center rounded-lg bg-muted hover:bg-secondary transition-colors">
 <Bell className="size-4" />
 </button>
 <div className="size-10 rounded-full grid place-items-center text-white font-medium shadow-[0_4px_14px_0_rgba(244,114,182,0.39)]" style={{ background: "linear-gradient(135deg, #f472b6, #f9a8d4)" }}>
 F
 </div>
 </div>
 </header>

 <div className="px-8 py-8">
 <div className="mb-8">
 <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
 {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
 </div>
 {children}
 </div>
 </main>
 </div>
 );
}
