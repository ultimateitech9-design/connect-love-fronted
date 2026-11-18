"use client";

import { useCallback, useEffect, useState } from "react";
import { Coins, Loader2, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Video } from "lucide-react";
import { toast } from "sonner";
import { API_ORIGIN } from "@/config/runtime";
import { getToken } from "@/lib/auth";
import { PresenceDot, useOnlineIds } from "@/features/presence/presence";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCall } from "@/features/calls/CallProvider";

type Filter = "all" | "missed" | "outgoing" | "incoming";

type CallItem = {
  id: string;
  callType: "audio" | "video";
  mode: "match" | "direct";
  direction: "incoming" | "outgoing";
  outcome: "answered" | "ongoing" | "ringing" | "missed" | "no_answer" | "declined";
  createdAt: string;
  durationSeconds: number | null;
  conversationId: string | null;
  isFreeTrial: boolean;
  coinsCharged: number | null;
  otherUser: { id: string; name: string; photo: string | null } | null;
};

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "missed", label: "Missed" },
  { id: "outgoing", label: "Outgoing" },
  { id: "incoming", label: "Incoming" },
];

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes ? `${minutes}m ${String(rest).padStart(2, "0")}s` : `${rest}s`;
}

function formatWhen(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (date.toDateString() === today.toDateString()) return `Today, ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString([], { day: "numeric", month: "short", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" })}, ${time}`;
}

function outcomeText(call: CallItem) {
  switch (call.outcome) {
    case "answered": return call.durationSeconds !== null ? formatDuration(call.durationSeconds) : "Answered";
    case "ongoing": return "In progress";
    case "ringing": return "Ringing";
    case "missed": return "Missed";
    case "declined": return "Declined";
    default: return "No answer";
  }
}

export default function CallsPage() {
  const { startCall, startDirectCall, ready, inCall } = useCall();
  const [filter, setFilter] = useState<Filter>("all");
  const [items, setItems] = useState<CallItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const onlineIds = useOnlineIds(items.map((item) => item.otherUser?.id));

  const fetchPage = useCallback(async (selected: Filter, before?: string) => {
    const params = new URLSearchParams({ filter: selected });
    if (before) params.set("before", before);
    const response = await fetch(`${API_ORIGIN}/video-calls/history?${params}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Call history could not be loaded.");
    return response.json() as Promise<{ items: CallItem[]; nextCursor: string | null }>;
  }, []);

  // Opening Calls clears the missed-call dot and bell items.
  useEffect(() => {
    fetch(`${API_ORIGIN}/video-calls/missed/seen`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` } })
      .then(() => window.dispatchEvent(new Event("connect-love-calls-changed")))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    fetchPage(filter)
      .then((page) => {
        if (cancelled) return;
        setItems(page.items);
        setNextCursor(page.nextCursor);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchPage, filter]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchPage(filter, nextCursor);
      setItems((current) => [...current, ...page.items]);
      setNextCursor(page.nextCursor);
    } catch {
      toast.error("More calls could not be loaded.");
    } finally {
      setLoadingMore(false);
    }
  };

  const callBack = async (call: CallItem, callType: "audio" | "video") => {
    if (!call.otherUser) return;
    const otherUser = { id: call.otherUser.id, name: call.otherUser.name, photo: call.otherUser.photo };
    // Matched users call free through their conversation; others use a paid direct call.
    const { error: callError, upgrade } = call.conversationId
      ? await startCall({ conversationId: call.conversationId, otherUser, callType })
      : await startDirectCall({ otherUser, callType });
    if (callError && !upgrade) toast.error(callError);
  };

  return (
    <div className="mx-auto max-w-2xl pb-16">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Calls</h1>
          <p className="text-sm text-muted-foreground">Your voice and video calls with matches and people from Discover.</p>
        </div>
      </div>

      <div role="tablist" aria-label="Filter calls" className="mb-4 flex gap-2 overflow-x-auto">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={filter === option.id}
            onClick={() => setFilter(option.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold transition",
              filter === option.id ? "bg-rose-600 text-white shadow-md shadow-rose-500/20" : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading calls…</div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Call history could not be loaded. Please try again.</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center">
            <Phone className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 font-semibold text-foreground">{filter === "missed" ? "No missed calls" : "No calls yet"}</p>
            <p className="mt-1 text-sm text-muted-foreground">Calls you make or receive will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((call) => {
              const missed = call.outcome === "missed";
              const DirectionIcon = missed ? PhoneMissed : call.direction === "incoming" ? PhoneIncoming : PhoneOutgoing;
              const TypeIcon = call.callType === "video" ? Video : Phone;
              const online = Boolean(call.otherUser && onlineIds.has(String(call.otherUser.id)));
              return (
                <li key={call.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="relative shrink-0">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={call.otherUser?.photo || undefined} alt={call.otherUser?.name || "User"} />
                      <AvatarFallback>{call.otherUser?.name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
                    </Avatar>
                    {call.otherUser && <PresenceDot online={online} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex min-w-0 items-center gap-2">
                      <span className={cn("truncate font-semibold", missed ? "text-rose-600" : "text-foreground")}>{call.otherUser?.name || "Deleted user"}</span>
                      {online && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
                      <DirectionIcon className={cn("h-3.5 w-3.5", missed ? "text-rose-500" : "")} aria-label={call.direction} />
                      <TypeIcon className="h-3.5 w-3.5" aria-label={call.callType} />
                      <span className={missed ? "font-semibold text-rose-600" : ""}>{outcomeText(call)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatWhen(call.createdAt)}</span>
                    </p>
                    {(call.mode === "direct" || (call.coinsCharged ?? 0) > 0) && (
                      <p className="mt-1 flex flex-wrap gap-1.5">
                        {call.mode === "direct" && <span className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-300">From Discover</span>}
                        {call.direction === "outgoing" && call.mode === "direct" && call.isFreeTrial && call.outcome === "answered" && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">Free call</span>
                        )}
                        {(call.coinsCharged ?? 0) > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                            <Coins className="h-3 w-3" /> {call.coinsCharged} coins
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  {call.otherUser && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => void callBack(call, "audio")}
                        disabled={!ready || inCall}
                        className="grid h-9 w-9 place-items-center rounded-full text-emerald-600 hover:bg-emerald-500/10 disabled:opacity-40"
                        aria-label={`Voice call ${call.otherUser.name}`}
                        title="Voice call"
                      >
                        <Phone className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void callBack(call, "video")}
                        disabled={!ready || inCall}
                        className="grid h-9 w-9 place-items-center rounded-full text-violet-600 hover:bg-violet-500/10 disabled:opacity-40"
                        aria-label={`Video call ${call.otherUser.name}`}
                        title="Video call"
                      >
                        <Video className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {nextCursor && !loading && (
        <div className="mt-4 text-center">
          <button type="button" onClick={() => void loadMore()} disabled={loadingMore} className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted disabled:opacity-60">
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />} Load more
          </button>
        </div>
      )}
    </div>
  );
}
