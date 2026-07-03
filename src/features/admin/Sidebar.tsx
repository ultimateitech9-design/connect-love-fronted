"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
 LayoutDashboard, Users, Flag, BarChart3, CreditCard,
 Receipt, LifeBuoy, ShieldCheck, LogOut, UserRoundSearch,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const items = [
 { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
 { to: "/admin/users", label: "Users", icon: Users },
 { to: "/admin/user-360", label: "User 360", icon: UserRoundSearch },
 { to: "/admin/reports", label: "Reports", icon: Flag },
 { to: "/admin/verification", label: "Verification", icon: ShieldCheck },
 { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
 { to: "/admin/payments", label: "Payments", icon: Receipt },
 { to: "/admin/tickets", label: "Support", icon: LifeBuoy },
 { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
 const pathname = usePathname();
 return (
 <aside className="sticky top-0 z-20 flex w-full flex-col overflow-hidden border-b border-slate-100 bg-white/80 backdrop-blur-xl lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:bg-white/40">
 <div className="flex h-[58px] shrink-0 items-center gap-2 border-b border-slate-100 px-4 lg:h-[64px] lg:px-5">
 <BrandLogo className="h-8 w-8 shadow-md shadow-rose-500/20" />
 <div>
 <p className="text-sm font-bold leading-none text-slate-900">ConnectLove</p>
 <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-rose-500">Admin</p>
 </div>
 </div>
 <nav className="flex gap-2 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:gap-0 lg:space-y-1 lg:overflow-y-auto lg:overflow-x-visible">
 {items.map((it) => {
 const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
 const Icon = it.icon;
 return (
 <Link
 key={it.to}
 href={it.to}
 className={cn(
 "group flex h-10 w-full shrink-0 items-center gap-2 overflow-hidden rounded-2xl px-3 text-sm font-semibold transition-all duration-200 lg:shrink lg:gap-3",
 active
 ? "bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-100"
 : "text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm hover:ring-1 hover:ring-rose-100",
 )}
 >
 <Icon className={cn("h-[16px] w-[16px] shrink-0 transition-colors", active ? "text-rose-600" : "text-slate-400 group-hover:text-rose-500")} />
 {it.label}
 </Link>
 );
 })}
 </nav>
 <div className="hidden border-t border-slate-100 p-3 lg:block">
 <Link href="/" className="group flex h-10 items-center gap-3 overflow-hidden rounded-2xl px-3 text-sm font-semibold text-slate-500 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 hover:shadow-sm hover:ring-1 hover:ring-rose-100">
 <LogOut className="h-[16px] w-[16px]" /> Exit admin
 </Link>
 </div>
 </aside>
 );
}
