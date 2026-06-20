"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { Search } from "lucide-react";

export default function DiscoverPage() {
  const page: PublicPageData = {
    eyebrow: "Product",
    title: "Discover real compatibility",
    description:
      "Discover helps members browse verified people with filters around values, intent, location, lifestyle, interests, and relationship readiness.",
    icon: Search,
    cta: { label: "Start Discovering", href: "/register" },
    secondaryCta: { label: "Open App Discover", href: "/user/discover" },
    highlights: [
      "Compatibility-first recommendations instead of empty profile scrolling.",
      "Filters for distance, age, relationship intent, interests, and lifestyle.",
      "Discovery actions connect directly to profile view, like, skip, report, and match flows.",
    ],
    metrics: [
      { value: "80+", label: "matching signals" },
      { value: "3", label: "core actions" },
      { value: "24/7", label: "report access" },
    ],
    sections: [
      {
        title: "Discovery logic",
        body: "The page should explain why someone appears in a user queue by showing shared values, mutual interests, profile completeness, and safety signals.",
        points: ["Compatibility reasons can appear on profile cards.", "Incomplete profiles can be guided back to profile settings.", "Premium filters can route users to Premium when locked."],
      },
      {
        title: "User actions",
        body: "Discover should never be only a static list. A user needs real choices: open profile, like, skip, report, block, or continue to messaging after a match.",
        points: ["Like creates interest.", "Skip keeps the queue moving.", "Report protects the member and sends context to support."],
      },
      {
        title: "Backend connection",
        body: "The app discover dashboard connects to backend discovery APIs, user profile data, matches, and report workflows.",
        points: ["Recommendations use profile/preferences data.", "Likes can create matches.", "Reports connect to support/admin queues."],
      },
    ],
    actions: [
      { title: "Complete profile", body: "User adds bio, photos, city, interests, and intent." },
      { title: "Use filters", body: "User adjusts preferences to improve match quality." },
      { title: "Act on profiles", body: "User likes, skips, reports, or starts a match path." },
    ],
    faq: [
      { question: "Can public visitors use real discovery?", answer: "No. Public visitors can read this page, but real discovery requires login." },
      { question: "Where does Discover connect?", answer: "It connects to user discovery, profile, matches, messages, and support/report workflows." },
    ],
  };

  return <MarketingInfoPage page={page} />;
}
