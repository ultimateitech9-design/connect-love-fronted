import type { Metadata } from "next";
import "./marketing.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export const metadata: Metadata = {
 title: "Super Admin Dashboard",
 description: "ConnectLove marketing performance at a glance.",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <div className="theme-marketing dark">
 <SidebarProvider>
 <div className="min-h-screen flex w-full overflow-x-hidden bg-background">
 <AppSidebar />
 <div className="min-w-0 flex-1 flex flex-col">
 <header className="min-h-14 flex items-center gap-3 border-b border-border bg-card/50 backdrop-blur px-3 sm:px-4 sticky top-0 z-10">
 <SidebarTrigger />
 <div className="flex-1" />
 <div className="flex items-center gap-4 text-sm text-muted-foreground">
 <a href="/marketing/notifications" className="relative p-2 rounded-full hover:bg-card border border-transparent hover:border-border transition-colors">
 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
 <span className="absolute top-1.5 right-1.5 w-[8px] h-[8px] rounded-full bg-pink-500"></span>
 </a>
 <div className="flex items-center gap-2">
 <div className="h-[32px] w-[32px] rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
 M
 </div>
 </div>
 </div>
 </header>
 <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
 </div>
 </div>
 </SidebarProvider>
 </div>
 );
}
