'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
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
  HelpCircle,
  ChevronRight,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutManagement } from "@/app/actions/managementAuth";
import { BrandLogo } from "@/components/BrandLogo";

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

  // Pre-warm all pages on mount for instant navigation
  useEffect(() => {
    nav.forEach((item) => router.prefetch(item.to));
  }, [router]);

  const handleMouseEnter = useCallback((to: string) => {
    router.prefetch(to);
  }, [router]);

  const handleLogout = async () => {
    await logoutManagement();
    router.push("/management/super-admin");
  };

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background font-[Inter,ui-sans-serif,system-ui]">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <BrandLogo className="h-10 w-10" />
          <div className="flex flex-col min-w-[0px]">
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
                  "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer relative hover:translate-x-1.5 group",
                  active
                    ? "bg-gradient-to-r from-primary/40 to-primary/5 text-white shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:rounded-r-full before:bg-primary"
                    : item.to === "#logout"
                    ? "text-rose-500 hover:bg-rose-500/10 hover:text-rose-400"
                    : "text-sidebar-foreground hover:text-white hover:bg-white/5",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
                <ChevronRight
                  className={cn(
                    "ml-auto h-4 w-4 transition-all duration-300 shrink-0",
                    active
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  )}
                />
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-[0px]">
        <nav className="flex gap-2 overflow-x-auto border-b border-sidebar-border bg-sidebar px-3 py-3 lg:hidden" aria-label="Admin navigation">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return <button key={item.to} onClick={() => router.push(item.to)} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold", active ? "bg-primary/25 text-white" : "bg-white/5 text-sidebar-foreground")}><Icon className="h-4 w-4" />{item.label}</button>;
          })}
        </nav>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-end gap-3 border-b border-border bg-background px-3 sm:h-16 sm:px-6 sm:gap-6">
          <div className="flex items-center gap-5 text-sm">
            <button onClick={() => router.push("/support")} className="hidden items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors sm:flex">
              <HelpCircle className="h-4 w-4" />
              Support
            </button>
            <span className="hidden items-center gap-1.5 text-foreground sm:flex">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              System Status
            </span>
            <button onClick={() => router.push("/super-admin/notifications")} className="relative h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
