"use client";

import { useState } from "react";
import { Loader2, Phone, Video } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCall } from "./CallProvider";

type Props = {
  profile: { id: string; name: string; photo?: string | null; photos?: string[] };
  className?: string;
};

/** Audio and video call buttons for a Discover profile (paid direct call, no match needed). */
export function DirectCallButtons({ profile, className }: Props) {
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

  const buttonClass = "grid h-11 w-11 place-items-center rounded-full border-2 border-border bg-card shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:h-[48px] sm:w-[48px]";

  return (
    <div className={cn("flex items-center gap-3 sm:gap-4", className)}>
      <button
        type="button"
        onClick={() => void call("audio")}
        disabled={!ready || inCall || starting !== null}
        className={cn(buttonClass, "text-emerald-500 hover:border-emerald-300")}
        aria-label={`Voice call ${profile.name}`}
        title="Voice call"
      >
        {starting === "audio" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Phone className="h-5 w-5" strokeWidth={2.5} />}
      </button>
      <button
        type="button"
        onClick={() => void call("video")}
        disabled={!ready || inCall || starting !== null}
        className={cn(buttonClass, "text-violet-500 hover:border-violet-300")}
        aria-label={`Video call ${profile.name}`}
        title="Video call"
      >
        {starting === "video" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Video className="h-5 w-5" strokeWidth={2.5} />}
      </button>
    </div>
  );
}
