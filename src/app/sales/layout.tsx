import type { Metadata } from "next";
import { Sidebar } from "@/features/sales/components/Sidebar";
import { NotificationMenu } from "@/features/sales/components/NotificationMenu";
import { Search, User } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sales Dashboard",
  description: "Sales Dashboard built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full antialiased dark theme-sales bg-background text-foreground">
        <div className="min-h-screen overflow-x-hidden bg-background">
          <Sidebar />
          <div className="lg:pl-64">
            <nav className="flex gap-2 overflow-x-auto border-b border-border bg-sidebar px-3 py-3 lg:hidden" aria-label="Sales navigation">
              {[['Overview','/sales'],['Plans','/sales/plans'],['User 360','/sales/user-360'],['Conversions','/sales/conversions'],['Campaigns','/sales/campaigns'],['Trends','/sales/trends'],['Retention','/sales/retention']].map(([label, href]) => <Link key={href} href={href} className="shrink-0 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-sidebar-foreground">{label}</Link>)}
            </nav>
            <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-2 backdrop-blur-md sm:px-6 lg:px-10">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative w-full max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="h-10 w-full rounded-full border border-border bg-secondary/40 pl-9 pr-4 text-sm outline-none transition focus:border-primary focus:bg-card"
                    placeholder="Search subscribers, plans, campaigns…"
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <NotificationMenu />
                <div
                  className="grid h-10 w-10 place-items-center rounded-full font-semibold text-white"
                  style={{ background: "var(--gradient-love)" }}
                >
                  <User className="h-5 w-5" />
                </div>
              </div>
            </header>
            <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-10 lg:py-10">
              {children}
            </main>
          </div>
        </div>
    </div>
  );
}
