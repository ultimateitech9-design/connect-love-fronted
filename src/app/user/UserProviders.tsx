"use client";

import { TopNav } from "@/features/user/TopNav";
import { NotificationProvider } from "@/features/user/NotificationContext";
import { SettingsProvider } from "@/features/user/SettingsContext";
import dynamic from "next/dynamic";

const GlobalPresence = dynamic(() => import("@/components/GlobalPresence").then((mod) => mod.GlobalPresence), {
  ssr: false,
});

export default function UserProviders({ children, showNav, enablePresence = true }: { children: React.ReactNode; showNav: boolean; enablePresence?: boolean }) {
  return (
    <SettingsProvider>
      <NotificationProvider>
        {enablePresence ? <GlobalPresence /> : null}
        {showNav ? <TopNav /> : null}
        {children}
      </NotificationProvider>
    </SettingsProvider>
  );
}
