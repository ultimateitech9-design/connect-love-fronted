"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Crown,
  TrendingUp,
  Users,
  Megaphone,
  LineChart,
  Repeat,
  User,
  UserRoundSearch,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandLogo } from "@/components/BrandLogo";
import { logoutManagement } from "@/app/actions/managementAuth";

const nav = [
  { href: "/sales", label: "Overview", icon: LayoutDashboard },
  { href: "/sales/plans", label: "Plans", icon: Crown },
  { href: "/sales/user-360", label: "User 360", icon: UserRoundSearch },
  { href: "/sales/conversions", label: "Conversions", icon: TrendingUp },
  { href: "/sales/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/sales/trends", label: "Trends", icon: LineChart },
  { href: "/sales/retention", label: "Retention", icon: Repeat },
];

export function Sidebar() {
  const pathname = usePathname();
  const userName = "My Profile"; // Simulated user name from login
  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar p-6 text-sidebar-foreground lg:flex">
      <Link href="/sales" className="mb-6 flex items-center gap-2 border-b border-sidebar-border pb-6">
        <BrandLogo className="h-10 w-10" />
        <div>
          <div className="font-display text-lg font-bold leading-none">
            <span className="text-slate-900">Connect</span><span className="text-red-500">Love</span>
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Sales Dashboard</div>
        </div>
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-pink-100 text-pink-700 shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-pink-600" : ""}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-sidebar-border pt-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
              <User className="h-4 w-4 text-sidebar-foreground/70 group-hover:text-sidebar-foreground" />
              <div className="flex-1">
                <span className="font-medium text-pink-500">{userName}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56">
            <DropdownMenuItem onClick={async () => { await logoutManagement(); window.location.href = "/management"; }} className="text-red-500 cursor-pointer focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
