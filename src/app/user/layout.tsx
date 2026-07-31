"use client";

import { usePathname } from "next/navigation";
import { OnboardingGuard } from "@/components/OnboardingGuard";
import UserProviders from "./UserProviders";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname === "/user/onboarding";
  const isMessages = pathname.startsWith("/user/messages");
  const shellClassName = isMessages
    ? "h-[calc(100dvh-4rem)] overflow-hidden text-slate-800 selection:bg-rose-500/30 dark:bg-background dark:text-foreground transition-colors"
    : "min-h-screen overflow-x-hidden text-slate-800 selection:bg-rose-500/30 dark:bg-background dark:text-foreground transition-colors";
  const mainClassName = isOnboarding
    ? ""
    : isMessages
      ? "mx-auto h-full w-full max-w-[1440px] overflow-hidden p-0 sm:px-6 sm:py-3 md:px-8 md:py-4"
      : "mx-auto w-full max-w-[1440px] px-2 py-3 pb-24 min-[380px]:px-3 sm:px-6 sm:py-7 md:pb-7 lg:px-8";

  return (
    <OnboardingGuard>
      <UserProviders showNav={!isOnboarding} enablePresence={!isMessages}>
        <div
          className={shellClassName}
          style={{
            background: "var(--background-gradient, linear-gradient(135deg, #fff5f7 0%, #fdf2f8 30%, #fff0f3 60%, #fef9ff 100%))",
          }}
        >
          <main className={mainClassName}>
            {children}
          </main>
        </div>
      </UserProviders>
    </OnboardingGuard>
  );
}
