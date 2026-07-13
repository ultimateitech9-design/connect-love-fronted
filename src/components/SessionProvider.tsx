"use client";
import { API_ORIGIN } from "@/config/runtime";

import { useEffect } from "react";
import { getToken } from "@/lib/auth";

const API_BASE = API_ORIGIN;

/**
 * SessionProvider historically handled JWT session lifecycle.
 * It is now a simplified wrapper since we use localStorage and want persistent sessions.
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
 useEffect(() => {
 const sendActivity = () => {
 const token = getToken();
 if (!token || document.visibilityState === "hidden") return;
 fetch(`${API_BASE}/auth/activity`, {
 method: "POST",
 headers: { Authorization: `Bearer ${token}` },
 }).catch(() => undefined);
 };

 const initialTimer = window.setTimeout(sendActivity, 8000);
 const interval = window.setInterval(sendActivity, 60_000);
 document.addEventListener("visibilitychange", sendActivity);
 return () => {
 window.clearTimeout(initialTimer);
 window.clearInterval(interval);
 document.removeEventListener("visibilitychange", sendActivity);
 };
 }, []);

 return <>{children}</>;
}
