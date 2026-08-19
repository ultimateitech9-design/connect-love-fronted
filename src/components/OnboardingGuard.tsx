"use client";
import { API_ORIGIN } from "@/config/runtime";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearOnboardingRequired, getToken, clearToken, isOnboardingRequired } from "@/lib/auth";

const API_URL = API_ORIGIN;

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
 const [loading, setLoading] = useState(true);
 const router = useRouter();
 const pathname = usePathname();

 useEffect(() => {
 let cancelled = false;

 const token = getToken();
 if (!token) {
 setLoading(true);
 clearToken();
 router.replace("/?reason=unauthenticated");
 return;
 }

 const mustCheckBeforeRender = isOnboardingRequired() || pathname === "/user/onboarding";
 setLoading(mustCheckBeforeRender);

 const verifyUser = () => fetch(`${API_URL}/users/me`, {
 headers: { Authorization: `Bearer ${token}` }
 })
 .then(res => {
 if (!res.ok) {
  const error = new Error("Failed to fetch user") as Error & { status?: number };
  error.status = res.status;
  throw error;
 }
 return res.json();
 })
 .then(user => {
 if (cancelled) return;

 const mustCompleteOnboarding = isOnboardingRequired() && !user.onboardingCompleted;
 const isDirectKyc = pathname === "/user/onboarding"
   && new URLSearchParams(window.location.search).get("step") === "video-kyc";

 // New signup sessions must complete onboarding before entering the user app.
 if (mustCompleteOnboarding && pathname !== "/user/onboarding") {
 setLoading(false);
 router.replace("/user/onboarding");
 return;
 }

 if (user.onboardingCompleted && pathname === "/user/onboarding" && (!isDirectKyc || user.kycMatched === true)) {
 clearOnboardingRequired();
 setLoading(false);
 router.replace(isDirectKyc ? "/user/profile" : "/user/discover");
 return;
 }

 setLoading(false);
 })
 .catch((error: Error & { status?: number }) => {
 if (cancelled) return;
 if (error.status === 401 || error.status === 403) {
  clearToken();
  router.replace("/");
  return;
 }
 setLoading(false);
 });

 const timer = mustCheckBeforeRender ? null : window.setTimeout(verifyUser, 7000);
 if (mustCheckBeforeRender) verifyUser();

 return () => {
 cancelled = true;
 if (timer) window.clearTimeout(timer);
 };
 }, [pathname, router]);

 if (loading) {
 return (
 <div className="flex min-h-dvh w-full items-center justify-center bg-background">
 <div className="h-[32px] w-[32px] animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
 </div>
 );
 }

 return <>{children}</>;
}
