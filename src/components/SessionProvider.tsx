"use client";

import { useEffect } from "react";
import { getToken } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

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
