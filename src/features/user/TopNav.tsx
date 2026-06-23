"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Settings, LogOut, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { logout, getToken } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { useMatches } from "@/hooks/useMatches";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

const navItems = [
 { to: "/user/discover", label: "Discover" },
 { to: "/user/matches", label: "Matches" },
 { to: "/user/messages", label: "Messages" },
 { to: "/user/profile", label: "Profile" },
];

const notifIcon = {
 match: "💕",
 message: "💬",
 profile: "✏️",
};

const notifColor = {
 match: "bg-rose-50 border-rose-200",
 message: "bg-pink-50 border-pink-200",
 profile: "bg-purple-50 border-purple-200",
};

export function TopNav() {
 const pathname = usePathname();
 const token = getToken() || "";

 const [notifOpen, setNotifOpen] = useState(false);
 const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
 const [userName, setUserName] = useState<string>("You");

 const notifRef = useRef<HTMLDivElement>(null);

 const { matches: activeMatches } = useMatches(token, "active");
 const { matches: receivedMatches } = useMatches(token, "received");

 const unreadMessagesCount = activeMatches.reduce((sum: number, m: any) => sum + (m.unreadCount || 0), 0);
 const newMatchesCount = receivedMatches.length;
 const totalUnread = unreadMessagesCount + newMatchesCount;

 const realNotifications = [
   ...receivedMatches.map((m: any) => ({
     id: `match-${m.id}`,
     type: "match" as const,
     title: "New Match Request! 💕",
     body: "Someone liked your profile. Check it out!",
     time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
     link: "/user/matches"
   })),
   ...activeMatches.filter((m: any) => m.unreadCount > 0).map((m: any) => ({
     id: `msg-${m.id}`,
     type: "message" as const,
     title: `New Message (${m.unreadCount})`,
     body: m.lastMessage || "You have unread messages.",
     time: new Date(m.lastMessageTime || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
     link: `/user/messages?id=${m.id}`
   }))
 ];

 // Fetch user avatar for the nav
 useEffect(() => {
 const AVATAR_KEY = "cl_avatar_url";
 const cached = localStorage.getItem(AVATAR_KEY);
 if (cached) setAvatarUrl(cached);

 if (!token) return;
 fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
 .then((r) => (r.ok ? r.json() : null))
 .then((data) => {
 if (data?.name) setUserName(data.name);
 const latestPhoto = data?.photos?.[0] || data?.avatarUrl;
 if (latestPhoto) {
 setAvatarUrl(latestPhoto);
 localStorage.setItem(AVATAR_KEY, latestPhoto);
 }
 })
 .catch(() => {});
 }, [token]);

 // Close notif panel when clicking outside
 useEffect(() => {
 const handler = (e: MouseEvent) => {
 if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
 setNotifOpen(false);
 }
 };
 if (notifOpen) document.addEventListener("mousedown", handler);
 return () => document.removeEventListener("mousedown", handler);
 }, [notifOpen]);

 const handleLogout = () => logout("/");

 return (
  <>
  <header
    className="sticky top-0 z-30 border-b bg-white/85 dark:bg-black/85 backdrop-blur-md"
    style={{
      borderColor: "rgba(236, 72, 153, 0.15)",
      boxShadow: "0 2px 20px rgba(236, 72, 153, 0.08)",
    }}
  >
 <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
 {/* Logo */}
 <Link href="/user/discover" className="flex items-center gap-2.5 group">
 <BrandLogo className="h-9 w-9 shadow-lg shadow-rose-500/30" priority />
        <span className="hidden text-xl font-bold tracking-tight text-foreground sm:inline">
          Connect<span className="text-rose-500">Love</span>
        </span>
      </Link>

 {/* Nav links */}
 <nav className="hidden items-center gap-10 md:flex">
 {navItems.map((i) => {
 const active = pathname.startsWith(i.to);
 const isMessages = i.label === "Messages";
 const isMatches = i.label === "Matches";

 const hasIndicator = (isMessages && unreadMessagesCount > 0) || (isMatches && newMatchesCount > 0);
 const isBold = hasIndicator;

 return (
 <Link
 key={i.to}
 href={i.to}
 className={cn(
              "relative text-sm transition-colors flex items-center gap-1.5",
              isBold ? "font-bold text-rose-600" : "font-semibold",
              active && !isBold ? "text-rose-500" : "",
              !active && !isBold ? "text-muted-foreground hover:text-rose-400" : ""
            )}
 >
 {i.label}
 {hasIndicator && <span className="h-2 w-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse" />}
 {active && (
 <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] rounded-full bg-gradient-to-r from-rose-500 to-pink-500" />
 )}
 </Link>
 );
 })}
 </nav>

 {/* Right icons */}
 <div className="flex items-center gap-3">
 {/* Notification Bell */}
 <div className="relative" ref={notifRef}>
 <button
 id="notif-btn"
 onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-[36px] w-[36px] items-center justify-center rounded-full transition-all hover:bg-rose-50 dark:hover:bg-rose-950/30 text-muted-foreground hover:text-rose-500"
            aria-label="Notifications"
 >
 <Bell className="h-[20px] w-[20px]" />
 {totalUnread > 0 && (
 <span className="absolute -top-0.5 -right-0.5 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
 {totalUnread > 9 ? "9+" : totalUnread}
 </span>
 )}
 </button>

 {/* Notification Panel */}
 {notifOpen && (
          <div
            className="fixed left-4 right-4 top-20 rounded-2xl border shadow-2xl overflow-hidden z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-90"
            style={{
              borderColor: "rgba(236, 72, 153, 0.2)",
              boxShadow: "0 20px 60px rgba(236, 72, 153, 0.15), 0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
 {/* Panel header */}
 <div
 className="flex items-center justify-between px-5 py-4 border-b"
 style={{ borderColor: "rgba(236, 72, 153, 0.12)", background: "linear-gradient(135deg, #fff5f7, #fdf2f8)" }}
 >
 <div className="flex items-center gap-2">
 <Bell className="h-[16px] w-[16px] text-rose-500" />
 <h3 className="font-semibold text-slate-800">Notifications</h3>
 {realNotifications.length > 0 && (
 <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600">
 {realNotifications.length}
 </span>
 )}
 </div>
 </div>

 {/* Notification list */}
 <div className="max-h-[min(60dvh,360px)] overflow-y-auto overscroll-contain">
 {realNotifications.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
 <div className="mb-3 flex h-[48px] w-[48px] items-center justify-center rounded-full bg-rose-50">
 <Bell className="h-[20px] w-[20px] text-rose-300" />
 </div>
 <p className="text-sm font-medium text-slate-600">All caught up!</p>
 <p className="text-xs text-slate-400 mt-1">No new matches or messages.</p>
 </div>
 ) : (
 <ul className="divide-y" style={{ borderColor: "rgba(236, 72, 153, 0.08)" }}>
 {realNotifications.map((n) => (
 <li
 key={n.id}
 className="flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-rose-50/50 bg-rose-50/30"
 >
 <Link href={n.link} className="flex flex-1 items-start gap-3" onClick={() => setNotifOpen(false)}>
 <div className={cn("mt-0.5 flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full border text-base", notifColor[n.type as keyof typeof notifColor])}>
 {notifIcon[n.type as keyof typeof notifIcon]}
 </div>
 <div className="min-w-[0px] flex-1">
 <div className="flex items-start justify-between gap-2">
 <p className="text-sm font-semibold text-slate-800 leading-tight">{n.title}</p>
 <span className="mt-1 h-[8px] w-[8px] shrink-0 rounded-full bg-rose-500" />
 </div>
 <p className="mt-1 text-xs text-slate-600 leading-snug line-clamp-2">{n.body}</p>
 <p className="mt-1.5 text-[10px] font-medium text-slate-400">{n.time}</p>
 </div>
 </Link>
 </li>
 ))}
 </ul>
 )}
 </div>
 </div>
 )}
 </div>

 {/* Profile menu */}
 <div className="ml-1 flex h-8 items-center border-l border-border pl-2 sm:ml-2 sm:pl-4">
 <Link
 href="/user/profile"
 className="flex items-center gap-2 rounded-full py-1 pl-1 sm:pr-3 hover:bg-muted/60 transition-colors"
 >
 <Avatar className="h-[32px] w-[32px] ring-2 ring-white shadow-sm">
 {avatarUrl ? <AvatarImage src={avatarUrl} alt="User" className="object-cover" /> : <AvatarFallback className="bg-rose-100 text-rose-600"><UserRound className="h-4 w-4" /></AvatarFallback>}
 </Avatar>
 <span className="hidden text-sm font-medium sm:inline">{userName}</span>
 </Link>
 <Link
 href="/user/settings"
 className="ml-1 p-2 text-muted-foreground hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
 title="Settings"
 >
 <Settings className="h-[18px] w-[18px]" />
 </Link>
 <button
 onClick={handleLogout}
 className="ml-1 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
 title="Logout"
 >
 <LogOut className="h-[18px] w-[18px]" />
 </button>
 </div>
 </div>
 </div>
 </header>
 <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-rose-100 bg-white/95 px-2 pt-2 shadow-[0_-8px_24px_rgba(236,72,153,0.08)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 md:hidden" aria-label="User navigation">
 {navItems.map((item) => {
 const active = pathname.startsWith(item.to);
 return (
 <Link key={item.to} href={item.to} className={cn("relative flex min-h-12 items-center justify-center rounded-xl px-1 text-xs font-semibold", active ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40" : "text-muted-foreground")}>
 {item.label}
 {((item.label === "Messages" && unreadMessagesCount > 0) || (item.label === "Matches" && newMatchesCount > 0)) && <span className="absolute right-[18%] top-2 h-2 w-2 rounded-full bg-rose-500" />}
 </Link>
 );
 })}
 </nav>
 </>
 );
}
