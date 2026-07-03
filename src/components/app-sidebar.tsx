"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Megaphone, Users, Bell, FileBarChart, User, LogOut, ChevronUp, UserRoundSearch, Target, CalendarDays, FlaskConical, ListChecks } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import {
 Sidebar,
 SidebarContent,
 SidebarGroup,
 SidebarGroupContent,
 SidebarGroupLabel,
 SidebarHeader,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
 { title: "Dashboard", url: "/marketing", icon: LayoutDashboard },
 { title: "Campaign Management", url: "/marketing/campaigns", icon: Megaphone },
 { title: "User Acquisition", url: "/marketing/acquisition", icon: Users },
 { title: "Audience Segments", url: "/marketing/segments", icon: Target },
 { title: "Funnel", url: "/marketing/funnel", icon: ListChecks },
 { title: "Content Calendar", url: "/marketing/calendar", icon: CalendarDays },
 { title: "Experiments", url: "/marketing/experiments", icon: FlaskConical },
 { title: "User 360", url: "/marketing/user-360", icon: UserRoundSearch },
 { title: "Notifications", url: "/marketing/notifications", icon: Bell },
 { title: "Reports", url: "/marketing/reports", icon: FileBarChart },
];

export function AppSidebar() {
 const currentPath = usePathname();

 return (
 <Sidebar collapsible="icon" className="border-r-sidebar-border/50">
 <SidebarHeader className="border-b border-sidebar-border pb-4 pt-4">
 <div className="flex items-center gap-3 px-2">
 <BrandLogo className="h-8 w-8" />
 <div className="flex min-w-0 flex-col">
 <span className="truncate text-lg font-bold tracking-tight">
 <span className="text-slate-950">Connect</span><span className="text-red-500">Love</span>
 </span>
 <span className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">Marketing Dashboard</span>
 </div>
 </div>
 </SidebarHeader>
 <SidebarContent className="pt-4 flex flex-col justify-between">
 <SidebarGroup>
 <SidebarGroupContent>
 <SidebarMenu className="gap-2">
 {items.map((item) => {
 const isActive = currentPath === item.url || (currentPath.startsWith(item.url) && item.url !== "/marketing");
 return (
 <SidebarMenuItem key={item.title}>
 <SidebarMenuButton
 asChild
 isActive={isActive}
 className={`h-[44px] rounded-xl transition-all ${isActive ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary hover:bg-primary/15 hover:text-primary before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[32px] before:w-[4px] before:rounded-r-full before:bg-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary'}`}
 >
 <Link href={item.url} className="flex min-w-0 items-center gap-3 px-2">
 <item.icon className="h-[20px] w-[20px]" />
 <span className="truncate text-sm font-medium">{item.title}</span>
 </Link>
 </SidebarMenuButton>
 </SidebarMenuItem>
 );
 })}

 {/* My Profile Dropdown Item */}
 <SidebarMenuItem>
 <DropdownMenu>
 <DropdownMenuTrigger asChild>
 <SidebarMenuButton
 className={`h-[44px] rounded-xl transition-all w-full flex justify-between items-center px-2 cursor-pointer ${currentPath === '/marketing/profile' ? 'bg-gradient-to-r from-primary/15 to-primary/5 text-primary before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[32px] before:w-[4px] before:rounded-r-full before:bg-primary' : 'text-primary hover:bg-primary/10 hover:text-primary'}`}
 >
 <div className="flex items-center gap-3">
 <User className="h-[20px] w-[20px]" />
 <span className="text-sm font-medium">My Profile</span>
 </div>
 <ChevronUp className="h-[16px] w-[16px] opacity-50" />
 </SidebarMenuButton>
 </DropdownMenuTrigger>
 <DropdownMenuContent side="bottom" align="start" className="w-56 bg-card border-border/50">
 <DropdownMenuItem asChild className="cursor-pointer gap-2 focus:bg-primary/10 focus:text-primary">
 <Link href="/marketing/profile">
 <User className="h-[16px] w-[16px]" />
 View Profile
 </Link>
 </DropdownMenuItem>
 <DropdownMenuItem className="cursor-pointer gap-2 text-red-500 focus:bg-red-500/10 focus:text-red-500">
 <LogOut className="h-[16px] w-[16px]" />
 Logout
 </DropdownMenuItem>
 </DropdownMenuContent>
 </DropdownMenu>
 </SidebarMenuItem>
 </SidebarMenu>
 </SidebarGroupContent>
 </SidebarGroup>
 </SidebarContent>
 </Sidebar>
 );
}
