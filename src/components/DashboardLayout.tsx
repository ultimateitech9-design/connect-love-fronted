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
 UserRoundSearch,
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
import { BrandLogo } from "@/components/BrandLogo";
import { logoutManagement } from "@/app/actions/managementAuth";

const nav = [
 { to: "/finance", label: "Overview", icon: LayoutDashboard },
 { to: "/finance/subscriptions", label: "Subscriptions", icon: CreditCard },
 { to: "/finance/user-360", label: "User 360", icon: UserRoundSearch },
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
 <div className="flex min-h-screen flex-col bg-background lg:flex-row">
 <aside className="flex w-full shrink-0 flex-col border-b border-sidebar-border bg-sidebar lg:w-64 lg:border-b-0 lg:border-r">
 <div className="flex items-center gap-2 px-4 py-4 lg:px-6 lg:py-6">
 <BrandLogo className="size-9" />
 <div>
 <div className="font-semibold leading-tight">
 <span className="text-foreground">Connect</span>
 <span className="text-[#ff0000]">Love</span>
 </div>
 <div className="text-xs text-muted-foreground">Finance</div>
 </div>
 </div>
 <nav className="flex flex-1 gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
 {nav.map((item) => {
 const Icon = item.icon;
 const active = pathname === item.to;
 return (
 <button
 key={item.to}
 onClick={() => router.push(item.to)}
 className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition-all lg:w-full lg:whitespace-normal lg:gap-3 ${
 active
 ? "bg-gradient-to-r from-primary/20 to-primary/5 text-white font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[32px] before:w-[4px] before:rounded-r-full before:bg-primary"
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
 className={`relative mt-1 flex w-full shrink-0 items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition-all ${
 pathname === "/finance/profile"
 ? "bg-gradient-to-r from-pink-400/20 to-pink-400/5 text-white font-medium before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[32px] before:w-[4px] before:rounded-r-full before:bg-pink-400"
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
 <DropdownMenuContent className="ml-2 w-56" align="start" side="bottom">
 <DropdownMenuItem onClick={() => router.push("/finance/profile")} className="cursor-pointer">
 <User className="mr-2 size-4" />
 <span>View Profile</span>
 </DropdownMenuItem>
 <DropdownMenuItem onClick={async () => { await logoutManagement(); window.location.href = "/management"; }} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
 <LogOut className="mr-2 size-4" />
 <span>Logout</span>
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </nav>
 </aside>

 <main className="min-w-0 flex-1">
 <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-border bg-card/60 px-4 py-2 backdrop-blur sm:px-6 lg:flex-nowrap lg:px-8">
 <div className="relative min-w-[12rem] flex-1 lg:max-w-80">
 <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input
 placeholder="Search transactions, users…"
 className="w-full h-[40px] pl-9 pr-3 rounded-lg bg-muted text-sm outline-none focus:ring-2 focus:ring-ring"
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

 <div className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
 <div className="mb-8">
 <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ fontFamily: "var(--font-display)" }}>{title}</h1>
 {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
 </div>
 {children}
 </div>
 </main>
 </div>
 );
}
