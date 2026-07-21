import type { Metadata } from "next";
import Providers from "./Providers";
import { SidebarProvider, SidebarTrigger } from "@/features/support/components/ui/sidebar";
import { AppSidebar } from "@/features/support/components/AppSidebar";
import { Mail, Search, User } from "lucide-react";
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
            <div className="flex min-h-screen w-full overflow-x-hidden">
              <AppSidebar />
              <div className="flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/70 px-4 backdrop-blur">
                  <SidebarTrigger />
                  <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets, users, reports…"
                      className="h-9 w-[min(20rem,42vw)] pl-8 bg-muted/40 border-border/60"
                    />
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <div className="hidden items-center gap-2 xl:flex" aria-label="ConnectLove contact emails">
                      <a
                        href="mailto:info@connectlove.in"
                        className="flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 text-xs text-muted-foreground transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-white"
                      >
                        <Mail className="h-3.5 w-3.5 text-rose-400" />
                        <span><strong className="font-semibold text-foreground">Info</strong> · info@connectlove.in</span>
                      </a>
                      <a
                        href="mailto:support@connectlove.in"
                        className="flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 text-xs text-muted-foreground transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-white"
                      >
                        <Mail className="h-3.5 w-3.5 text-rose-400" />
                        <span><strong className="font-semibold text-foreground">Support</strong> · support@connectlove.in</span>
                      </a>
                    </div>
                    <div className="flex items-center gap-1 xl:hidden" aria-label="ConnectLove contact emails">
                      <a href="mailto:info@connectlove.in" title="Info: info@connectlove.in" aria-label="Email info@connectlove.in" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/20 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400">
                        <span className="text-[10px] font-bold">INFO</span>
                      </a>
                      <a href="mailto:support@connectlove.in" title="Support: support@connectlove.in" aria-label="Email support@connectlove.in" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/20 text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400">
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>
                    <NotificationBell />
                    <Link href="/support/profile" aria-label="Support profile" className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-muted/20 hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
                      <User className="h-4 w-4" />
                    </Link>
                  </div>
                </header>
                <main className="min-w-0 flex-1 p-4 sm:p-6">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </Providers>
    </div>
  );
}
