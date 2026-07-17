import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/SessionProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { TranslationProvider } from "@/features/i18n/TranslationProvider";
import "../styles.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Connect Love — Find the spark that feels like home",
  description:
    "Connect Love is a premium, verified dating platform built for intentional connection. AI-powered matching, end-to-end encryption, and a safe community of 500K+ singles.",
  keywords: ["dating app", "online dating", "soulmate", "relationships", "matches"],
  icons: {
    icon: [{ url: "/connect-love-logo.png", type: "image/png" }],
    shortcut: "/connect-love-logo.png",
    apple: "/connect-love-logo.png",
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
    <html lang="en" className={`${sans.variable} ${display.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('connect-love-theme')||'light';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <QueryProvider>
          <TranslationProvider>
            <SessionProvider>
              {children}
            </SessionProvider>
          </TranslationProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
