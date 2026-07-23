import type { Metadata } from "next";

export const SITE_NAME = "Connect Love";
export const SITE_URL = "https://connectlove.in";
export const HOME_TITLE =
  "Connect Love | Best Safe Dating Site & App -Meet New Friends & People, Connect Hearts, Create Forever";
export const HOME_DESCRIPTION =
  "connectLove.in Best online Dating Site & App, whether you're searching for friendship, companionship, or your perfect life partner, ConnectLove makes the journey simple, safe, and enjoyable. With an easy-to-use interface, secure profiles, and smart matching, finding someone special has never been easier. Find girl, female, male, lesbian, gay partner for short- or long-term live-in relationship. Connect with naughty & beautiful girls /women near you & your village / town/city. Visakhapatnam, Vijayawada, Papum Pare, Guwahati, Patna, Raipur, Ponda Goa, Ahmedabad, Surat, Vadodara, Faridabad, Gurugram, Shimla, Jamshedpur, Dhanbad, Ranchi, Bangalore, Mysore, Thiruvananthapuram, Kochi, Indore, Bhopal, Gwalior, Mumbai, Pune, Nagpur, Thane, Navi Mumbai, Shillong, Aizawl, Kohima, Bhubaneswar, Cuttack, Rourkela, Ludhiana, Amritsar, Jalandhar, Patiala, Jaipur, Jodhpur, Kota, Bikaner, Gangtok, Chennai, Coimbatore, Madurai, Hyderabad, Warangal, Kanpur, Lucknow, Ghaziabad, Varanasi, Prayagraj, Gorakhpur, Noida, Dehradun, Haridwar, Kolkata, Asansol, Siliguri, Chandigarh, New Delhi.";

export const HOME_KEYWORDS = [
  "love connection",
  "lover near me",
  "love connection near me",
  "find lover near me",
  "dating app India",
  "online dating India",
  "best dating app in India",
  "safe dating app India",
  "verified dating app India",
  "serious relationship dating app",
  "dating app for serious relationships",
  "long term relationship dating app",
  "meaningful relationship app",
  "genuine dating app India",
  "trusted dating app India",
  "dating site India",
  "online dating site India",
  "Indian dating app",
  "dating app for Indian singles",
  "meet singles in India",
  "find singles near me",
  "find love online India",
  "meet genuine singles",
  "verified singles India",
  "compatible singles India",
  "relationship app India",
  "match making app India",
  "modern matchmaking India",
  "compatibility matching app",
  "compatibility based dating",
  "intentional dating app",
  "high intent dating app",
  "dating app for commitment",
  "dating app for marriage minded singles",
  "life partner dating app India",
  "local dating app India",
  "secure dating app India",
  "private dating app India",
  "profile verification dating app",
  "face verified dating profiles",
  "real people dating app",
  "safe online dating",
  "online dating safety India",
  "dating scam prevention",
  "respectful dating community",
  "authentic connections online",
  "genuine relationships India",
  "meaningful connections India",
  "find compatible matches",
  "relationship compatibility India",
  "serious singles India",
  "dating app with verified profiles",
  "dating for long term relationships",
  "find genuine love India",
  "Online girls near me",
  "Online woman near me",
  "Online naughty girls near me",
  "beautiful girls near me",
  "Online model near me",
  "online actress near me",
  "Visakhapatnam",
  "Vijayawada",
  "Papum Pare",
  "Guwahati",
  "Patna",
  "Raipur",
  "Ponda Goa",
  "Ahmedabad",
  "Surat",
  "Vadodara",
  "Faridabad",
  "Gurugram",
  "Shimla",
  "Jamshedpur",
  "Dhanbad",
  "Ranchi",
  "Bangalore",
  "Mysore",
  "Thiruvananthapuram",
  "Kochi",
  "Indore",
  "Bhopal",
  "Gwalior",
  "Mumbai",
  "Pune",
  "Nagpur",
  "Thane",
  "Navi Mumbai",
  "Shillong",
  "Aizawl",
  "Kohima",
  "Bhubaneswar",
  "Cuttack",
  "Rourkela",
  "Ludhiana",
  "Amritsar",
  "Jalandhar",
  "Patiala",
  "Jaipur",
  "Jodhpur",
  "Kota",
  "Bikaner",
  "Gangtok",
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Hyderabad",
  "Warangal",
  "Kanpur",
  "Lucknow",
  "Ghaziabad",
  "Varanasi",
  "Prayagraj",
  "Gorakhpur",
  "Noida",
  "Dehradun",
  "Haridwar",
  "Kolkata",
  "Asansol",
  "Siliguri",
  "Chandigarh",
  "New Delhi",
];

const coreKeywords = [
  "online dating India",
  "safe dating app India",
  "verified dating profiles",
  "Indian singles",
  "matchmaking services India",
  "serious relationships",
  "meaningful relationships",
  "compatibility matching",
  "trusted dating platform",
  "find a partner online",
  "dating safety India",
  "genuine dating website",
];

type PublicSeo = {
  title: string;
  description: string;
  keywords: string[];
};

export const PUBLIC_PAGE_SEO = {
  "/about-us": {
    title: "About ConnectLove & Our Safety-First Mission",
    description:
      "Learn how Connect Love helps adults in India build genuine connections through intentional profiles, compatibility tools, privacy controls, and dating safety.",
    keywords: ["about Connect Love", "intentional dating India", "relationship platform"],
  },
  "/blog": {
    title: "Online Dating Tips & Relationship Advice",
    description:
      "Read practical online dating tips for authentic profiles, respectful conversations, scam awareness, safer first dates, and meaningful relationships in India.",
    keywords: ["online dating tips", "relationship advice India", "dating safety tips"],
  },
  "/careers": {
    title: "Careers at ConnectLove",
    description:
      "Explore careers at Connect Love across engineering, product, trust and safety, customer support, operations, marketing, sales, and finance.",
    keywords: ["Connect Love careers", "dating app jobs India", "trust and safety careers"],
  },
  "/contact-us": {
    title: "Contact ConnectLove Support",
    description:
      "Contact Connect Love for account access, privacy, verification, matches, subscriptions, payments, billing, or dating safety support.",
    keywords: ["Connect Love support", "dating app customer support", "report dating safety concern"],
  },
  "/discover": {
    title: "Discover Compatible Indian Singles",
    description:
      "Discover compatible singles on Connect Love using relationship goals, interests, values, location, lifestyle, and verified profile signals.",
    keywords: ["discover singles India", "compatible matches", "verified singles India"],
  },
  "/features": {
    title: "Safe Dating App Features & Matchmaking Tools",
    description:
      "Explore Connect Love features for profile verification, compatibility-based discovery, mutual matches, private messaging, safety, and account control.",
    keywords: ["dating app features", "compatibility matching", "safe online dating features"],
  },
  "/help-center": {
    title: "ConnectLove Help Center",
    description:
      "Get help with your Connect Love account, profile, verification, discovery, matches, messaging, premium plan, payments, privacy, and safety.",
    keywords: ["Connect Love help center", "dating account help", "dating app support India"],
  },
  "/privacy-policy": {
    title: "Privacy Policy",
    description:
      "Read how Connect Love collects, uses, protects, shares, and retains account, profile, verification, location, message, and payment information.",
    keywords: ["Connect Love privacy policy", "dating app data privacy", "profile privacy controls"],
  },
  "/safety": {
    title: "Online Dating Safety Guide for India",
    description:
      "Learn safer online dating practices, how to spot scams and fake profiles, protect personal information, meet safely, and report concerns on Connect Love.",
    keywords: ["online dating safety India", "dating scam prevention", "report fake dating profile"],
  },
  "/terms-of-service": {
    title: "Terms of Service",
    description:
      "Review the Connect Love terms covering eligibility, accounts, member conduct, subscriptions, payments, moderation, safety, content, and service access.",
    keywords: ["Connect Love terms", "dating app terms of service", "member conduct rules"],
  },
  "/refund-policy": {
    title: "Subscription Cancellation & Refund Policy",
    description:
      "Understand ConnectLove subscription cancellation, renewal, duplicate-charge, unauthorized-payment, service issue, and refund request procedures.",
    keywords: ["Connect Love refund policy", "dating app cancellation", "subscription refund India"],
  },
  "/Divorced": {
    title: "Dating After Divorce in India",
    description:
      "Meet divorced Indian singles seeking companionship and meaningful relationships in a privacy-focused community with safer matching tools.",
    keywords: ["dating after divorce India", "divorced singles India", "second marriage dating"],
  },
} satisfies Record<string, PublicSeo>;

function normalizePath(path: string) {
  if (path === "/") return "/";
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}

export function createPublicMetadata({
  title,
  description,
  path,
  keywords = [],
}: PublicSeo & { path: string }): Metadata {
  const canonicalPath = normalizePath(path);
  const canonicalUrl = new URL(canonicalPath, SITE_URL).toString();
  const socialTitle = canonicalPath === "/" ? title : `${title} | ${SITE_NAME}`;
  const seoKeywords =
    canonicalPath === "/"
      ? [...new Set(keywords)]
      : [...new Set([...keywords, ...coreKeywords])];

  return {
    title,
    description,
    keywords: seoKeywords,
    authors: [{ name: "Connect Love Editorial Team", url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category: "Online Dating",
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: socialTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: "/connect-love-logo.png",
          width: 512,
          height: 512,
          alt: "Connect Love",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: ["/connect-love-logo.png"],
    },
  };
}

export function metadataForPublicPage(path: keyof typeof PUBLIC_PAGE_SEO): Metadata {
  return createPublicMetadata({ path, ...PUBLIC_PAGE_SEO[path] });
}
