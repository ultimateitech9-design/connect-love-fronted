"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, clearToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5002";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
 const [loading, setLoading] = useState(true);
 const router = useRouter();
 const pathname = usePathname();

 useEffect(() => {
 let cancelled = false;
 setLoading(true);

 const token = getToken();
 if (!token) {
 clearToken();
 router.replace("/?reason=unauthenticated");
 return;
 }

 fetch(`${API_URL}/users/me`, {
 headers: { Authorization: `Bearer ${token}` }
 })
 .then(res => {
 if (!res.ok) throw new Error("Failed to fetch user");
 return res.json();
 })
 .then(user => {
 if (cancelled) return;

 // New users must complete onboarding before entering the user app.
 if (!user.onboardingCompleted && pathname !== "/user/onboarding") {
 setLoading(false);
 router.replace("/user/onboarding");
 return;
 }

 if (user.onboardingCompleted && pathname === "/user/onboarding") {
 setLoading(false);
 router.replace("/user/profile");
 return;
 }

 setLoading(false);
 })
 .catch(() => {
 if (cancelled) return;
 clearToken();
 router.replace("/");
 });

 return () => {
 cancelled = true;
 };
 }, [pathname, router]);

 if (loading) {
 return (
 <div className="flex h-screen w-full items-center justify-center bg-background">
 <div className="h-[2.222vw] w-[2.222vw] animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
 </div>
 );
 }

 return <>{children}</>;
}
