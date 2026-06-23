"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { getToken } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";
const COMPLETION_FIELDS = [
 "name", "birthDate", "gender", "profession", "height", "city", "bio", "interests", "personalityWords", "hobbies",
] as const;

function calcCompletion(p: any): number {
 const filled = COMPLETION_FIELDS.filter((f) => {
 const v = p[f];
 return v && String(v).trim().length > 0;
 }).length;
 return Math.round((filled / COMPLETION_FIELDS.length) * 100);
}

type DBMatch = { id: string; senderId: string; receiverId: string; status: string };

export function RightRail() {
 const [completion, setCompletion] = useState(85);
 const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop");
 const [recentMatches, setRecentMatches] = useState<any[]>([]);

 useEffect(() => {
 const token = getToken();

 // Fetch User Profile
 if (token) {
 fetch(`${API}/users/me`, {
 headers: { Authorization: `Bearer ${token}` },
 })
 .then((res) => {
 if (res.ok) return res.json();
 return null;
 })
 .then((data) => {
 if (data) {
 setCompletion(calcCompletion(data));
        const latestPhoto = data.photos?.[0] || data.avatarUrl;
        if (latestPhoto) setAvatarUrl(latestPhoto);
 else {
 const cached = localStorage.getItem("cl_avatar_url");
 if (cached) setAvatarUrl(cached);
 }
 }
 })
 .catch(() => {});
 }

  // Fetch matches from DB
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const myId = payload.userId || payload.sub;

      fetch(`${API}/matches?filter=active`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const displayMatches = Array.from(new Map(data.map((m: any) => {
            const targetId = m.senderId === myId ? m.receiverId : m.senderId;
            return [m.id, { ...m, targetId }];
          })).values()).map((m: any) => {
            const realProfile = m.senderId === myId ? m.receiver : m.sender;
            const profile = realProfile ? {
                name: realProfile.name || "Unknown",
                photo: (realProfile.photos && realProfile.photos.length > 0) ? realProfile.photos[0] : (realProfile.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop")
              } : {};
            return {
              id: m.id,
              name: profile.name || "Unknown",
              photo: profile.photo || "",
            };
          });
          setRecentMatches(displayMatches.slice(0, 5));
        }
      })
      .catch(() => {});
    } catch(e) {}
  }
 }, []);

 return (
 <div className="flex h-full flex-col gap-4">
 {/* Profile Completion */}
 <div
 className="rounded-2xl bg-card p-5 shadow-lg border-border border"
 >
 <Link href="/user/profile" className="flex items-center gap-3 group">
 <Avatar className="h-[48px] w-[48px] group-hover:ring-2 ring-rose-500 transition-all" style={{ border: "2px solid rgba(236,72,153,0.3)" }}>
 <AvatarImage src={avatarUrl} />
 <AvatarFallback
 className="text-white text-xs font-bold"
 style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899)" }}
 >
 You
 </AvatarFallback>
 </Avatar>
 <div>
 <p className="text-base font-semibold text-foreground group-hover:text-rose-500 transition-colors">Your Profile</p>
 <p className="text-sm font-medium text-rose-500">{completion}% Complete</p>
 </div>
 </Link>
 <Progress value={completion} className="mt-4 h-[8px]" />
 </div>

 {/* Recent Matches */}
 <div
 className="flex-1 rounded-2xl bg-card p-5 shadow-lg flex flex-col border-border border"
 >
 <div className="flex items-center justify-between">
 <h3 className="text-lg font-semibold text-foreground">Recent Matches</h3>
 <Link
 href="/user/matches"
 className="text-sm font-medium text-rose-500 hover:text-rose-600 hover:underline"
 >
 See all
 </Link>
 </div>
 <ul className="mt-4 space-y-4 flex-1">
 {recentMatches.length > 0 ? recentMatches.map((m) => (
 <li key={m.id} className="flex items-center gap-3">
 <div className="relative">
 <Avatar className="h-[44px] w-[44px]" style={{ border: "2px solid rgba(236,72,153,0.2)" }}>
 <AvatarImage src={m.photo} />
 <AvatarFallback
 className="text-white text-xs font-bold"
 style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899)" }}
 >
 {m.name[0]}
 </AvatarFallback>
 </Avatar>
 </div>
 <div className="min-w-[0px] flex-1">
 <p className="truncate text-sm font-semibold text-foreground">
 {m.name}
 </p>
 <Link href={`/user/messages?id=${m.id}`} className="text-xs text-rose-500 hover:underline block mt-0.5">
 Message
 </Link>
 </div>
 </li>
 )) : (
 <p className="text-sm text-muted-foreground mt-2">No recent matches yet.</p>
 )}
 </ul>

 {/* Upgrade Ad */}
 <div
 className="mt-6 rounded-xl p-4 text-center"
 style={{
 background: "linear-gradient(135deg, #fff0f3, #fce7f3)",
 border: "1px solid rgba(236,72,153,0.25)",
 }}
 >
 <Sparkles className="h-[24px] w-[24px] text-rose-400 mx-auto mb-2" />
 <h4 className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">Stand out with Premium</h4>
 <p className="mt-1 text-xs text-rose-500/80 dark:text-rose-400/80 mb-3">
 See who liked you and get more matches.
 </p>
 <Link href="/user/premium" className="block">
 <Button
 className="w-full text-white h-[36px] text-xs rounded-lg"
 style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899)" }}
 >
 Upgrade Now
 </Button>
 </Link>
 </div>
 </div>
 </div>
 );
}
