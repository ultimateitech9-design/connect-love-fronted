import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/components/SessionProvider";
import { RouteQueryProvider } from "@/components/RouteQueryProvider";
import { TranslationProvider } from "@/features/i18n/TranslationProvider";
import { DeferredAuthPrompt } from "@/components/DeferredAuthPrompt";
import { RouteChatbot } from "@/components/RouteChatbot";
import {
  createPublicMetadata,
  HOME_DESCRIPTION,
  HOME_KEYWORDS,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import "../styles.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const homeMetadata = createPublicMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  keywords: HOME_KEYWORDS,
});

export const metadata: Metadata = {
  ...homeMetadata,
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  manifest: "/manifest.webmanifest",
  verification: {
    google: "ECsiPPiMEGXoirGoc8st98_imhhgCH4OzFIVhuMSnhI",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", type: "image/x-icon", sizes: "any" },
      { url: "/favicon.png?v=3", type: "image/png", sizes: "96x96" },
      { url: "/connect-love-logo.png?v=3", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: [{ url: "/apple-touch-icon.png?v=3", type: "image/png", sizes: "180x180" }],
    other: [
      {
        rel: "mask-icon",
        url: "/connect-love-icon.svg",
        color: "#e11d48",
      },
    ],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      alternateName: "ConnectLove",
      description: HOME_DESCRIPTION,
      inLanguage: "en-IN",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/connect-love-logo.png`,
      email: "info@connectlove.in",
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer support",
          email: "support@connectlove.in",
          availableLanguage: ["English", "Hindi"],
        },
      ],
      sameAs: [
        "https://www.instagram.com/connectloveofficial/",
        "https://www.facebook.com/connectloveofficial/",
        "https://www.linkedin.com/company/connect-love-official/",
        "https://www.youtube.com/@ConnectLove-Official",
      ],
    },
    {
      "@type": "Service",
      "@id": `${SITE_URL}/#dating-service`,
      name: "ConnectLove Online Dating and Matchmaking",
      serviceType: "Online dating and matchmaking platform",
      provider: { "@id": `${SITE_URL}/#organization` },
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      audience: {
        "@type": "Audience",
        audienceType: "Adults aged 18 and older seeking meaningful relationships",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} scroll-smooth`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
        />
        <Script id="connectlove-google-analytics" strategy="afterInteractive">
          {`window.setTimeout(function () {
  var analyticsScript = document.createElement('script');
  analyticsScript.async = true;
  analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-LSFFV3G704';
  document.head.appendChild(analyticsScript);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'G-LSFFV3G704');
}, 5000);`}
        </Script>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('connect-love-theme')||'light';document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <RouteQueryProvider>
          <TranslationProvider>
            <SessionProvider>
              {children}
              <DeferredAuthPrompt />
              <RouteChatbot />
            </SessionProvider>
          </TranslationProvider>
        </RouteQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
