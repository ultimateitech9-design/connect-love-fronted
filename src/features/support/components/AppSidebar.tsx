"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Ticket,
  BarChart3,
  Flag,
  Headphones,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Heart,
  User,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/features/support/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/support", icon: LayoutDashboard },
  { title: "Ticket Management", url: "/support/tickets", icon: Ticket },
  { title: "Support Analytics", url: "/support/analytics", icon: BarChart3 },
  { title: "Reports & Complaints", url: "/support/reports", icon: Flag },
  { title: "Customer Support", url: "/support/customer-support", icon: Headphones },
  { title: "Trust & Safety", url: "/support/trust-safety", icon: ShieldCheck },
  { title: "High Priority", url: "/support/high-priority", icon: AlertTriangle },
  { title: "Performance Report", url: "/support/performance", icon: TrendingUp },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname() || "";
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/support" className="flex items-center gap-2 px-2 py-3">
          <Heart className="h-5 w-5 text-pink-500" fill="currentColor" />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold">
                <span className="text-white">Connect</span>
                <span className="text-red-500">Love</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Support Dashboard
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active =
                  item.url === "/support" ? pathname === "/support" : pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active}
                      className={`transition-colors ${
                        active 
                          ? "bg-[#3b1a2f] text-white hover:bg-[#4a233b] hover:text-white font-medium" 
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Link href={item.url} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => setProfileOpen(!profileOpen)} 
                  className="flex items-center gap-2 text-pink-300 hover:text-pink-200"
                >
                  <User className="h-4 w-4" />
                  {!collapsed && <span>My Profile</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              {profileOpen && !collapsed && (
                <div className="pl-9 pt-1 pb-2 flex flex-col items-start gap-1">
                  <button className="text-sm text-muted-foreground hover:text-white flex items-center gap-2 transition-colors">
                    <LogOut className="h-3.5 w-3.5" /> Logout
                  </button>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
