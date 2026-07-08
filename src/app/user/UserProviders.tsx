"use client";

import { TopNav } from "@/features/user/TopNav";
import { NotificationProvider } from "@/features/user/NotificationContext";
import { SettingsProvider } from "@/features/user/SettingsContext";
import { GlobalPresence } from "@/components/GlobalPresence";

export default function UserProviders({ children, showNav }: { children: React.ReactNode; showNav: boolean }) {
  return (
    <SettingsProvider>
      <NotificationProvider>
        <GlobalPresence />
        {showNav ? <TopNav /> : null}
        {children}
      </NotificationProvider>
    </SettingsProvider>
  );
}
