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
    longForm: [
      { title: "How recommendations are created", paragraphs: ["ConnectLove uses the profile information and preferences available to the service to build a discovery queue. Relevant signals can include age range, selected gender preference, city or distance, relationship goal, interests, profile completeness, verification, activity, and prior like or pass actions.", "Recommendations are an aid to discovery, not a promise of compatibility. People and relationships are complex, so members should read profiles, communicate respectfully, and make their own decisions."], points: ["Adjust age, distance, interests, goals, and Interested In filters.", "Everyone removes the gender restriction; other choices filter by the gender saved at registration.", "Previously actioned or blocked profiles may be removed from the queue.", "Location availability can affect distance ordering."] },
      { title: "Build a profile people can understand", paragraphs: ["A useful discovery experience starts with an accurate profile. Recent photos, a clear bio, real interests, and an honest relationship goal give other members enough context to decide whether to connect.", "Do not add phone numbers, home addresses, financial information, passwords, government ID numbers, or other unnecessary sensitive details to public profile fields."], points: ["Use recent photos that represent you.", "Keep age, city, profession, and goals accurate.", "Describe interests in your own voice.", "Update information when circumstances change."] },
      { title: "Likes, passes, super likes, and matches", paragraphs: ["A like expresses interest. A pass moves to another profile. A super like can provide a stronger signal where your plan includes it. A match occurs when eligible members express mutual interest; only then should messaging become available under the product rules.", "A match is never consent to pressure, harassment, sexual content, off-platform contact, or an in-person meeting. Either person can stop responding, unmatch, block, or report at any time."], points: ["Mutual interest opens the conversation path.", "Respect silence and boundaries.", "Never demand personal contact details.", "Use report and block tools when needed."] },
      { title: "Safer discovery choices", paragraphs: ["Verification badges and profile information can help with context but cannot guarantee a person’s identity, intentions, or conduct. Stay alert for requests for money, urgent financial stories, investment offers, attempts to collect OTPs, or pressure to leave the platform immediately.", "For a first meeting, choose a public place, arrange your own transport, tell someone you trust, and leave if anything feels wrong. In an immediate emergency, contact local emergency services."], points: ["Never send money to someone you met through the service.", "Keep early conversations on-platform when possible.", "Report fake profiles or threatening behavior.", "Review the Safety page before meeting."] },
    ],
    actions: [
      { title: "Complete profile", body: "User adds bio, photos, city, interests, and intent." },
      { title: "Use filters", body: "User adjusts preferences to improve match quality." },
      { title: "Act on profiles", body: "User likes, skips, reports, or starts a match path." },
    ],
    faq: [
      { question: "Can public visitors use real discovery?", answer: "No. Public visitors can read this page, but real discovery requires login." },
      { question: "Where does Discover connect?", answer: "It connects to your profile, preferences, matches, messages, and safety/report workflows." },
      { question: "Why did my results change?", answer: "Results can change when you edit filters, update location, act on profiles, or when other members change account status or visibility." },
      { question: "Does verification guarantee safety?", answer: "No. Verification is one trust signal, but members should still use good judgment and follow safety guidance." },
    ],
  };

  return <MarketingInfoPage page={page} />;
}
