"use client";

import { useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

/**
 * Online status for any profiles on screen. Components register the user ids
 * they show; one socket request (set up by CallProvider) checks them all every
 * 20 seconds. People who hide their online status always read as offline.
 */
type Fetcher = (ids: string[]) => Promise<string[]>;

const wanted = new Map<string, number>();
const listeners = new Set<() => void>();
let online: ReadonlySet<string> = new Set();
let fetcher: Fetcher | null = null;
let refreshTimer: number | null = null;
let intervalTimer: number | null = null;

function notify() {
  listeners.forEach((listener) => listener());
}

async function refresh() {
  refreshTimer = null;
  if (!fetcher || wanted.size === 0) return;
  try {
    const ids = await fetcher([...wanted.keys()]);
    online = new Set(ids);
    notify();
  } catch {
    // Keep the last known state; the next tick retries.
  }
}

function scheduleRefresh(delay = 250) {
  if (typeof window === "undefined" || refreshTimer !== null) return;
  refreshTimer = window.setTimeout(() => void refresh(), delay);
}

/** Called by CallProvider once its socket is connected (null on disconnect). */
export function setPresenceFetcher(next: Fetcher | null) {
  fetcher = next;
  if (typeof window === "undefined") return;
  if (intervalTimer !== null) window.clearInterval(intervalTimer);
  intervalTimer = null;
  if (!next) {
    online = new Set();
    notify();
    return;
  }
  intervalTimer = window.setInterval(() => void refresh(), 20_000);
  scheduleRefresh(0);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => online;
const getServerSnapshot = () => online;

/** Set of online user ids among `ids` (others are offline). */
export function useOnlineIds(ids: Array<string | number | null | undefined>): ReadonlySet<string> {
  const key = [...new Set(ids.filter((id) => id !== null && id !== undefined && id !== "").map(String))].sort().join(",");
  useEffect(() => {
    if (!key) return;
    const list = key.split(",");
    let added = false;
    for (const id of list) {
      const count = wanted.get(id) ?? 0;
      if (count === 0) added = true;
      wanted.set(id, count + 1);
    }
    if (added) scheduleRefresh();
    return () => {
      for (const id of list) {
        const count = (wanted.get(id) ?? 1) - 1;
        if (count <= 0) wanted.delete(id);
        else wanted.set(id, count);
      }
    };
  }, [key]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Green when online, red when offline. Place inside a `relative` box (avatar corner) or inline. */
export function PresenceDot({ online: isOnline, className, inline = false }: { online: boolean; className?: string; inline?: boolean }) {
  return (
    <span
      role="img"
      aria-label={isOnline ? "Online" : "Offline"}
      title={isOnline ? "Online" : "Offline"}
      className={cn(
        "rounded-full border-2 border-white dark:border-slate-900",
        isOnline ? "bg-emerald-500" : "bg-rose-500",
        inline ? "inline-block h-2.5 w-2.5 shrink-0" : "absolute bottom-0 right-0 h-3.5 w-3.5",
        className,
      )}
    />
  );
}

/** Dot plus "Online"/"Offline" for one user, e.g. next to a name on a profile card. */
export function OnlineStatus({ userId, className, showLabel = true }: { userId: string | number | null | undefined; className?: string; showLabel?: boolean }) {
  const online = useOnlineIds([userId]).has(String(userId));
  if (userId === null || userId === undefined || userId === "") return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", className)}>
      <PresenceDot online={online} inline />
      {showLabel && <span>{online ? "Online" : "Offline"}</span>}
    </span>
  );
}

/** Corner dot on an avatar for one user; the parent must be `relative`. */
export function AvatarPresence({ userId, className }: { userId: string | number | null | undefined; className?: string }) {
  const online = useOnlineIds([userId]).has(String(userId));
  if (userId === null || userId === undefined || userId === "") return null;
  return <PresenceDot online={online} className={className} />;
}
