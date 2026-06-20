"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { Newspaper } from "lucide-react";

export default function BlogPage() {
  const page: PublicPageData = {
    eyebrow: "Company",
    title: "Connect Love Blog",
    description: "Guides, product updates, dating safety notes, premium explainers, and support learnings for members and teams.",
    icon: Newspaper,
    cta: { label: "Get Updates", href: "/register" },
    highlights: ["Dating advice with consent and clarity.", "Product release notes for real routes.", "Safety and subscription education."],
    metrics: [{ value: "4", label: "content pillars" }, { value: "Weekly", label: "publishing rhythm" }, { value: "Public", label: "learning access" }],
    sections: [
      { title: "Dating guidance", body: "Blog posts can help users write better profiles, start respectful chats, and plan safer dates.", points: ["Profile tips.", "Conversation advice.", "First-date safety."] },
      { title: "Product updates", body: "Each update should link to the right route such as Discover, Premium, Safety, or Help Center.", points: ["Feature changes.", "Plan updates.", "Support notices."] },
      { title: "Backend connection", body: "Newsletter subscribers are sent to backend support newsletter endpoint from the footer.", points: ["Email captured.", "Backend receives request.", "Support can review contact records."] },
    ],
    actions: [{ title: "Read", body: "Visitor reads guidance." }, { title: "Apply", body: "User applies advice in profile or messages." }, { title: "Subscribe", body: "Footer newsletter POST connects to backend." }],
    faq: [{ question: "Can blog content mention users?", answer: "Only with consent and privacy review." }, { question: "Where do readers ask questions?", answer: "They can use Contact Us or Help Center." }],
  };
  return <MarketingInfoPage page={page} />;
}
