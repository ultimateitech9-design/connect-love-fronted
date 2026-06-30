import type { Metadata } from "next";
import Providers from "./Providers";
import { SidebarProvider, SidebarTrigger } from "@/features/support/components/ui/sidebar";
import { AppSidebar } from "@/features/support/components/AppSidebar";
import { Bell, Search, User } from "lucide-react";
import { Input } from "@/features/support/components/ui/input";
import { NotificationBell } from "@/features/support/components/NotificationBell";
import Link from "next/link";

export const metadata: Metadata = {
  title: "connectLove — Support Dashboard",
  description: "Internal support console for the connectLove dating app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dark theme-support min-h-full flex flex-col antialiased">
        <Providers>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />
              <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur">
                  <SidebarTrigger />
                  <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets, users, reports…"
                      className="h-9 w-80 pl-8 bg-muted/40 border-border/60"
                    />
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <NotificationBell />
                    <Link href="/support/profile" aria-label="Support profile" className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted/20 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
                      <User className="h-4 w-4" />
                    </Link>
                  </div>
                </header>
                <main className="flex-1 p-4 sm:p-6">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </Providers>
    </div>
  );
}
