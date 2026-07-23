"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
 LayoutDashboard, Users, Flag, BarChart3, CreditCard, Megaphone,
 Receipt, LifeBuoy, ShieldCheck, LogOut, UserRoundSearch, Menu, X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

const items = [
 { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
 { to: "/admin/users", label: "Users", icon: Users },
 { to: "/admin/user-360", label: "User 360", icon: UserRoundSearch },
 { to: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
 { to: "/admin/reports", label: "Reports", icon: Flag },
 { to: "/admin/verification", label: "Verification", icon: ShieldCheck },
 { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
 { to: "/admin/payments", label: "Payments", icon: Receipt },
 { to: "/admin/tickets", label: "Support", icon: LifeBuoy },
 { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
 const pathname = usePathname();
 const [open, setOpen] = useState(false);

 useEffect(() => setOpen(false), [pathname]);
 useEffect(() => {
  if (!open) return;
  const previous = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => { document.body.style.overflow = previous; };
 }, [open]);

 const navigation = (
  <>
   <nav className="flex-1 space-y-1 overflow-y-auto p-3">
    {items.map((it) => {
     const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
     const Icon = it.icon;
     return (
      <Link key={it.to} href={it.to} className={cn(
       "group flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-all duration-200",
       active ? "bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-100" : "text-slate-500 hover:bg-rose-50 hover:text-rose-600",
      )}>
       <Icon className={cn("h-4 w-4 shrink-0", active ? "text-rose-600" : "text-slate-400 group-hover:text-rose-500")} />
       {it.label}
      </Link>
     );
    })}
   </nav>
   <div className="border-t border-slate-100 p-3">
    <Link href="/" className="group flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600">
     <LogOut className="h-4 w-4" /> Exit admin
    </Link>
   </div>
  </>
 );

 return (
 <>
  <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white/90 px-4 backdrop-blur-xl lg:hidden">
   <div className="flex items-center gap-2.5">
    <BrandLogo className="h-9 w-9 shadow-md shadow-rose-500/20" />
    <div><p className="text-sm font-bold leading-none text-slate-900">ConnectLove</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-rose-500">Admin</p></div>
   </div>
   <button type="button" onClick={() => setOpen(true)} aria-label="Open admin menu" aria-expanded={open} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 hover:bg-rose-50 hover:text-rose-600">
    <Menu className="h-6 w-6" />
   </button>
  </header>

  <button type="button" aria-label="Close admin menu" onClick={() => setOpen(false)} className={cn("fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm transition-opacity lg:hidden", open ? "opacity-100" : "pointer-events-none opacity-0")} />
  <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-[min(82vw,19rem)] flex-col border-r border-slate-100 bg-white shadow-2xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:w-64 lg:shrink-0 lg:translate-x-0 lg:bg-white/60 lg:shadow-none lg:backdrop-blur-xl", open ? "translate-x-0" : "-translate-x-full")}>
   <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100 px-5">
    <BrandLogo className="h-8 w-8 shadow-md shadow-rose-500/20" />
    <div className="min-w-0 flex-1"><p className="text-sm font-bold leading-none text-slate-900">ConnectLove</p><p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-rose-500">Admin</p></div>
    <button type="button" onClick={() => setOpen(false)} aria-label="Close admin menu" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 lg:hidden"><X className="h-5 w-5" /></button>
   </div>
   {navigation}
  </aside>
 </>
 );
}
