"use client";

import { TopNav } from "@/features/user/TopNav";
import { usePathname } from "next/navigation";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import { NotificationProvider } from "@/features/user/NotificationContext";
import { SettingsProvider } from "@/features/user/SettingsContext";
import { GlobalPresence } from "@/components/GlobalPresence";

export default function UserLayout({ children }: { children: React.ReactNode }) {
 const pathname = usePathname();
 const isOnboarding = pathname === "/user/onboarding";

 return (
 <SettingsProvider>
 <OnboardingGuard>
 <NotificationProvider>
 <GlobalPresence />
 {/* Light pinkish-white gradient background */}
 <div
 className="min-h-screen overflow-x-hidden text-slate-800 selection:bg-rose-500/30 dark:bg-background dark:text-foreground transition-colors"
 style={{
 background: "var(--background-gradient, linear-gradient(135deg, #fff5f7 0%, #fdf2f8 30%, #fff0f3 60%, #fef9ff 100%))",
 }}
 >
 {!isOnboarding && <TopNav />}
 <main className={isOnboarding ? "" : "mx-auto w-full max-w-[1440px] px-3 py-4 pb-24 sm:px-6 sm:py-7 md:pb-7 lg:px-8"}>
 {children}
 </main>
 </div>
 </NotificationProvider>
 </OnboardingGuard>
 </SettingsProvider>
 );
}
