'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserRoundSearch,
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
  LogOut,
  Menu,
  Pin,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutManagement } from "@/app/actions/managementAuth";
import { BrandLogo } from "@/components/BrandLogo";

const nav = [
  { to: "/super-admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/super-admin/users", label: "User Management", icon: Users },
  { to: "/super-admin/user-360", label: "User 360", icon: UserRoundSearch },
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
  const [sidebarPinned, setSidebarPinned] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sidebarOpen = sidebarPinned || sidebarHovered;

  // Pre-warm all pages on mount for instant navigation
  useEffect(() => {
    nav.forEach((item) => router.prefetch(item.to));
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSidebarPinned(window.localStorage.getItem("super_admin_sidebar_pinned") === "true");
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMouseEnter = useCallback((to: string) => {
    router.prefetch(to);
  }, [router]);

  const handleLogout = async () => {
    await logoutManagement();
    router.push("/management/super-admin");
  };

  const toggleSidebarPinned = () => {
    setSidebarPinned((current) => {
      const next = !current;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("super_admin_sidebar_pinned", String(next));
      }
      return next;
    });
  };

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background font-[Inter,ui-sans-serif,system-ui]">
      <aside
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        className={cn(
          "hidden lg:flex shrink-0 flex-col bg-sidebar border-r border-sidebar-border shadow-sm transition-all duration-300 ease-out",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className={cn("px-5 pt-6 pb-5 flex items-center gap-3", sidebarOpen ? "justify-start" : "justify-center")}>
          <BrandLogo className="h-10 w-10" />
          <div className={cn("flex flex-col min-w-[0px] transition-all duration-200", sidebarOpen ? "opacity-100" : "w-0 overflow-hidden opacity-0")}>
            <h1 className="font-extrabold text-xl leading-none tracking-tight truncate">
              <span className="text-slate-950">Connect</span><span className="text-rose-500">Love</span>
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
                  "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer relative group",
                  sidebarOpen ? "justify-start hover:translate-x-1.5" : "justify-center",
                  active
                    ? "bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-100 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:rounded-r-full before:bg-primary"
                    : item.to === "#logout"
                    ? "text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                    : "text-sidebar-foreground hover:text-rose-600 hover:bg-rose-50/80",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={cn("whitespace-nowrap transition-all duration-200", sidebarOpen ? "opacity-100" : "w-0 overflow-hidden opacity-0")}>{item.label}</span>
                <ChevronRight
                  className={cn(
                    "ml-auto h-4 w-4 transition-all duration-300 shrink-0",
                    !sidebarOpen
                      ? "hidden"
                      : active
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  )}
                />
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 p-3 border-t border-sidebar-border">
          <button
            type="button"
            onClick={toggleSidebarPinned}
            title={sidebarPinned ? "Unfix sidebar" : "Fix sidebar open"}
            className={cn(
              "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-rose-50 hover:text-rose-600",
              sidebarOpen ? "justify-start gap-3" : "justify-center"
            )}
          >
            <Pin className={cn("h-4 w-4 shrink-0", sidebarPinned && "fill-rose-500 text-rose-500")} />
            <span className={cn("whitespace-nowrap transition-all duration-200", sidebarOpen ? "opacity-100" : "w-0 overflow-hidden opacity-0")}>{sidebarPinned ? "Sidebar fixed" : "Fix sidebar"}</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600",
              sidebarOpen ? "justify-start gap-3" : "justify-center"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn("whitespace-nowrap transition-all duration-200", sidebarOpen ? "opacity-100" : "w-0 overflow-hidden opacity-0")}>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-[0px]">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-3 border-b border-border bg-white/85 px-3 shadow-sm backdrop-blur-xl sm:h-16 sm:px-6 sm:gap-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-foreground shadow-sm transition hover:bg-rose-50 hover:text-rose-600 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <BrandLogo className="h-8 w-8" />
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-slate-950">Connect<span className="text-rose-500">Love</span></p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Super Admin</p>
            </div>
          </div>
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
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="relative flex h-full w-[82vw] max-w-[320px] flex-col border-r border-sidebar-border bg-sidebar shadow-2xl">
              <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <BrandLogo className="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-slate-950">Connect<span className="text-rose-500">Love</span></p>
                    <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Super Admin Panel</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {nav.map((item) => {
                  const active = pathname === item.to;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.to}
                      onClick={() => router.push(item.to)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors",
                        active ? "bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-100" : "text-sidebar-foreground hover:bg-rose-50 hover:text-rose-600"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>
                      {active && <ChevronRight className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </nav>
              <div className="border-t border-sidebar-border p-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Logout
                </button>
              </div>
            </aside>
          </div>
        )}
        <main className="mx-auto w-full max-w-7xl flex-1 overflow-x-hidden px-4 py-5 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
