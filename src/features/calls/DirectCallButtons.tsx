"use client";

import { useState } from "react";
import { Loader2, Phone, Video } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCall } from "./CallProvider";

type Props = {
  profile: { id: string; name: string; photo?: string | null; photos?: string[] };
  className?: string;
  /** Small glass buttons drawn over the profile photo. */
  overlay?: boolean;
};

/** Audio and video call buttons for a Discover profile (paid direct call, no match needed). */
export function DirectCallButtons({ profile, className, overlay = false }: Props) {
  const { startDirectCall, ready, inCall } = useCall();
  const [starting, setStarting] = useState<"audio" | "video" | null>(null);

  const call = async (callType: "audio" | "video") => {
    if (starting) return;
    setStarting(callType);
    try {
      const { error, upgrade } = await startDirectCall({
        otherUser: { id: String(profile.id), name: profile.name, photo: profile.photos?.[0] || profile.photo || null },
        callType,
      });
      // The upgrade popup already explains a missing allowance.
      if (error && !upgrade) toast.error(error);
    } finally {
      setStarting(null);
    }
  };

  // Over the photo the card handles taps and drags itself, so keep them here.
  const keep = overlay ? { onPointerDown: (event: React.PointerEvent) => event.stopPropagation(), onMouseDown: (event: React.MouseEvent) => event.stopPropagation(), onTouchStart: (event: React.TouchEvent) => event.stopPropagation() } : {};
  const iconClass = overlay ? "h-4 w-4" : "h-5 w-5";
  const buttonClass = overlay
    ? "grid h-9 w-9 place-items-center rounded-full border border-white/25 bg-black/45 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
    : "grid h-11 w-11 place-items-center rounded-full border-2 border-border bg-card shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:h-[48px] sm:w-[48px]";

  return (
    <div className={cn("flex items-center", overlay ? "gap-2" : "gap-3 sm:gap-4", className)} {...keep}>
      <button
        type="button"
        onClick={(event) => { event.stopPropagation(); void call("audio"); }}
        disabled={!ready || inCall || starting !== null}
        className={cn(buttonClass, !overlay && "text-emerald-500 hover:border-emerald-300")}
        aria-label={`Voice call ${profile.name}`}
        title="Voice call"
      >
        {starting === "audio" ? <Loader2 className={cn(iconClass, "animate-spin")} /> : <Phone className={iconClass} strokeWidth={2.5} />}
      </button>
      <button
        type="button"
        onClick={(event) => { event.stopPropagation(); void call("video"); }}
        disabled={!ready || inCall || starting !== null}
        className={cn(buttonClass, !overlay && "text-violet-500 hover:border-violet-300")}
        aria-label={`Video call ${profile.name}`}
        title="Video call"
      >
        {starting === "video" ? <Loader2 className={cn(iconClass, "animate-spin")} /> : <Video className={iconClass} strokeWidth={2.5} />}
      </button>
    </div>
  );
}
