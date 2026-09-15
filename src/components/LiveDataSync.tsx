"use client";

import { useEffect } from "react";

const SYNC_INTERVAL = 15_000;

/**
 * Direct-fetch pages do not have a React Query cache to invalidate. This
 * shared fallback keeps those pages current across sessions as well. Never
 * interrupt an active form field; the next visibility/focus event catches it
 * up after the user finishes editing.
 */
export function LiveDataSync() {
  useEffect(() => {
    let timer: number | undefined;

    const refreshIfSafe = () => {
      if (document.visibilityState !== "visible" || !navigator.onLine) return;
      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement) return;
      window.location.reload();
    };

    timer = window.setInterval(refreshIfSafe, SYNC_INTERVAL);
    window.addEventListener("focus", refreshIfSafe);
    window.addEventListener("online", refreshIfSafe);
    document.addEventListener("visibilitychange", refreshIfSafe);
    return () => {
      if (timer) window.clearInterval(timer);
      window.removeEventListener("focus", refreshIfSafe);
      window.removeEventListener("online", refreshIfSafe);
      document.removeEventListener("visibilitychange", refreshIfSafe);
    };
  }, []);

  return null;
}
