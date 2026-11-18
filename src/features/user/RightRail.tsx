"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Zap } from "lucide-react";
import { BoostDialog } from "@/features/boost/BoostDialog";
import { getToken } from "@/lib/auth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMatches } from "@/hooks/useMatches";
import { getCachedAvatarUrl } from "@/lib/avatarCache";
import { calculateProfileCompletion } from "@/lib/profileCompletion";
import { matchFriends, onlineMatchFriends } from './matchFriends';
import { skipToken, useQuery } from '@tanstack/react-query';
import boostStyles from './BoostButton.module.css';

export function RightRail() {
  const [boostOpen, setBoostOpen] = useState(false);
  const [completion, setCompletion] = useState(85);
  const [avatarUrl, setAvatarUrl] = useState("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop");
  const token = getToken() || "";
  let viewerId = '';
  try { const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); viewerId = String(payload.sub || payload.userId || ''); } catch {}
  const { data: onlineIds = [] } = useQuery<string[]>({
    // Presence is pushed by GlobalPresence; this observer must never fetch.
    queryKey: ['online-friends', viewerId], queryFn: skipToken, enabled: false, initialData: [],
  });
  const { data: currentUser } = useCurrentUser(token);
  const { matches: activeMatches } = useMatches(token, "active", { all: true });
  const recentMatches = useMemo(() => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return matchFriends(activeMatches, String(payload.sub || payload.userId || ''));
    } catch { return []; }
  }, [activeMatches, token]);
  const onlineFriends = onlineMatchFriends(recentMatches, onlineIds);

  useEffect(() => {
    if (currentUser) {
      setCompletion(calculateProfileCompletion(currentUser));
      const latestPhoto = currentUser.photos?.[0] || currentUser.avatarUrl || getCachedAvatarUrl();
      if (latestPhoto) setAvatarUrl(latestPhoto);
    }
  }, [currentUser]);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Profile Completion */}
      <div className="rounded-2xl bg-card p-5 shadow-lg border-border border">
        <div className="flex items-center gap-3">
          <Link href="/user/profile" className="group flex min-w-0 flex-1 items-center gap-3">
            <Avatar className="h-[48px] w-[48px] shrink-0 group-hover:ring-2 ring-rose-500 transition-all" style={{ border: "2px solid rgba(236,72,153,0.3)" }}>
              <AvatarImage src={avatarUrl} alt="Your profile photo" />
              <AvatarFallback
                className="text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899)" }}
              >
                You
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground transition-colors group-hover:text-rose-700">Your Profile</p>
              <p className="text-sm font-medium text-rose-700">{completion}% Complete</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setBoostOpen(true)}
            className={boostStyles.button + " grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-amber-300 bg-card text-amber-500 shadow-md transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"}
            aria-label="Boost your profile"
            title="Boost your profile"
          >
            <Zap className={boostStyles.icon + " h-5 w-5"} strokeWidth={2.5} fill="currentColor" />
          </button>
        </div>
        <Progress value={completion} className="mt-4 h-[8px]" />
      </div>
      <BoostDialog open={boostOpen} onClose={() => setBoostOpen(false)} />

      {/* Recent Matches */}
      <div className="rounded-2xl bg-card p-5 shadow-lg flex flex-col border-border border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Matches</h3>
          <Link
            href="/user/matches"
            className="text-sm font-medium text-rose-700 hover:text-rose-800 hover:underline"
          >
            See all
          </Link>
        </div>
        <ul aria-label="Recent matches" tabIndex={0} className="mt-4 max-h-[284px] space-y-4 overflow-y-auto overscroll-contain pr-2 [scrollbar-width:thin]">
          {recentMatches.length > 0 ? recentMatches.map((m) => (
            <li key={m.id} className="flex h-11 items-center gap-3">
              <div className="relative">
                <Avatar className="h-[44px] w-[44px]" style={{ border: "2px solid rgba(236,72,153,0.2)" }}>
                  <AvatarImage src={m.photo} alt={`${m.name} profile photo`} />
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
                <Link href={`/user/messages?id=${m.id}`} className="text-xs font-medium text-rose-700 hover:underline block mt-0.5">
                  Message
                </Link>
              </div>
            </li>
          )) : (
            <p className="text-sm text-muted-foreground mt-2">No recent matches yet.</p>
          )}
        </ul>
      </div>

      {onlineFriends.length > 0 && <section aria-label="Online friends" className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div><h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" />Online friends</h3><p className="mt-0.5 text-xs text-muted-foreground">Your friends online right now</p></div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">{onlineFriends.length}</span>
        </div>
        <ul className="grid grid-cols-3 gap-x-3 gap-y-5 p-4">
          {onlineFriends.slice(0, 6).map(friend => <li key={friend.userId} className="min-w-0">
            <Link href={'/user/messages?id=' + friend.id} title={'Message ' + friend.name} className="group flex flex-col items-center gap-2 rounded-xl p-1 text-center transition hover:bg-emerald-500/5 focus-visible:outline-2 focus-visible:outline-emerald-500">
              <span className="relative">
                <Avatar className="h-14 w-14 border-2 border-emerald-200 transition group-hover:border-emerald-400">
                  <AvatarImage src={friend.photo} alt="" />
                  <AvatarFallback className="bg-rose-500/10 text-sm font-bold text-rose-500">{friend.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500"><span className="sr-only">Online</span></span>
              </span>
              <span className="w-full truncate text-xs font-semibold text-foreground">{friend.name}</span>
            </Link>
          </li>)}
        </ul>
        <div className="flex justify-end border-t border-border px-4 py-3">
          <Link href="/user/messages" className="inline-flex min-h-8 items-center justify-center rounded-md bg-gradient-to-r from-rose-500 to-pink-600 px-3 py-1.5 text-[10px] font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500">
            View people online
          </Link>
        </div>
      </section>}

        {/* Keep plan options accessible for free and paid members alike. */}
        <div
          className="mt-6 rounded-xl p-4 text-center"
          style={{
            background: "linear-gradient(135deg, #fff0f3, #fce7f3)",
            border: "1px solid rgba(236,72,153,0.25)",
          }}
        >
          <Sparkles className="h-[24px] w-[24px] text-rose-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-1">Stand out with Premium</h4>
          <p className="mt-1 text-xs text-rose-700/90 dark:text-rose-300/90 mb-3">
            See who liked you and get more matches.
          </p>
          <Link href="/user/premium" className="flex h-9 w-full items-center justify-center rounded-lg text-xs font-semibold text-white transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500" style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899)" }}>
            Upgrade Now
          </Link>
        </div>
    </div>
  );
}
