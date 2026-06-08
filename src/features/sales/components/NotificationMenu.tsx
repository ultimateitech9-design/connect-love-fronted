"use client";

import { Bell, Heart, Gift, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/features/sales/components/ui/dropdown-menu";

const notifications = [
  {
    id: 1,
    title: "New Subscription",
    desc: "John just subscribed to the Platinum Plan.",
    time: "2 mins ago",
    icon: Heart,
    color: "text-brand-rose",
  },
  {
    id: 2,
    title: "Campaign Success",
    desc: "Valentine's Week Offer reached 5,000 views.",
    time: "1 hour ago",
    icon: Gift,
    color: "text-brand-coral",
  },
  {
    id: 3,
    title: "New Message",
    desc: "Sarah sent a message via support.",
    time: "3 hours ago",
    icon: MessageCircle,
    color: "text-blue-400",
  },
];

export function NotificationMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative grid h-10 w-10 place-items-center rounded-full bg-secondary/50 text-foreground hover:bg-secondary outline-none">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-rose" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2">
        <DropdownMenuLabel className="font-semibold text-lg py-2 px-2">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((n) => (
          <DropdownMenuItem key={n.id} className="flex gap-4 p-3 cursor-pointer items-start">
            <div className={`mt-1 flex-shrink-0 ${n.color}`}>
              <n.icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium text-sm text-foreground">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.desc}</span>
              <span className="text-[10px] text-muted-foreground/70">{n.time}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
