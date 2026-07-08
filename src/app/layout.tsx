import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/SessionProvider";
import { QueryProvider } from "@/components/QueryProvider";
import "../styles.css";

export const metadata: Metadata = {
 title: "Connect Love — Find the spark that feels like home",
 description:
 "Connect Love is a premium, verified dating platform built for intentional connection. AI-powered matching, end-to-end encryption, and a safe community of 500K+ singles.",
 keywords: ["dating app", "online dating", "soulmate", "relationships", "matches"],
 icons: {
 icon: "/site-icon.svg",
 shortcut: "/site-icon.svg",
 apple: "/site-icon.svg",
 },
 openGraph: {
 title: "Connect Love — Find the spark that feels like home",
 description: "A premium sanctuary for modern connection. Verified profiles, AI compatibility, and genuine love.",
 type: "website",
 siteName: "Connect Love",
 },
 twitter: {
 card: "summary_large_image",
 title: "Connect Love",
 description: "Find the spark that feels like home.",
 },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
 return (
 <html lang="en" data-scroll-behavior="smooth">
 <body>
 <QueryProvider>
 <SessionProvider>
 {children}
 </SessionProvider>
 </QueryProvider>
 <Toaster />
 </body>
 </html>
 );
}
