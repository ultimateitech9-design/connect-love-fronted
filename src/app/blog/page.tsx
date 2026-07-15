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
    longForm: [
      { title: "Dating and communication guides", paragraphs: ["Our guidance should help adults express themselves honestly, understand boundaries, start respectful conversations, recover from rejection, and make thoughtful decisions about moving from messages to meetings.", "Advice is general education, not medical, mental-health, legal, or professional counselling. Readers should seek qualified help for situations requiring specialist support."], points: ["Writing an authentic profile.", "Starting conversations without pressure.", "Recognizing and respecting boundaries.", "Planning a safer first date."] },
      { title: "Safety education", paragraphs: ["Safety articles explain common scam patterns, impersonation, financial solicitation, coercion, image misuse, harassment, and ways to document and report concerning behavior.", "Blog content cannot assess an individual situation in real time. Urgent danger should be reported to local emergency services, while platform concerns can be sent through ConnectLove reporting and support tools."], points: ["Spotting romance and investment scams.", "Protecting personal and financial details.", "Using block and report responsibly.", "Finding the correct support path."] },
      { title: "Product and policy updates", paragraphs: ["When features, plan benefits, prices, eligibility, or policies change, posts can explain what changed, why it matters, and where members can manage the feature. A blog summary does not replace the final checkout terms or legal policy.", "Older posts may describe a previous product version. Dates and update notes help readers distinguish historical information from current functionality."], points: ["Feature explanations.", "Premium and billing updates.", "Privacy or safety education.", "Service notices and release summaries."] },
      { title: "Editorial standards", paragraphs: ["Content should be accurate, respectful, inclusive, and clear about uncertainty. Member stories or quotes require permission and privacy review. Sponsored or commercial relationships should be disclosed where relevant.", "We do not publish private support cases, identifiable safety reports, or confidential internal information as content."], points: ["Check facts and dates.", "Separate advice from guarantees.", "Disclose sponsorships.", "Correct meaningful errors transparently."] },
    ],
    actions: [{ title: "Read", body: "Visitor reads guidance." }, { title: "Apply", body: "User applies advice in profile or messages." }, { title: "Subscribe", body: "Footer newsletter POST connects to backend." }],
    faq: [{ question: "Can blog content mention users?", answer: "Only with appropriate consent and privacy review." }, { question: "Where do readers ask questions?", answer: "They can use Contact Us or Help Center." }, { question: "Is blog advice professional advice?", answer: "No. It provides general information and cannot replace qualified medical, legal, financial, or emergency help." }, { question: "Can an old article be outdated?", answer: "Yes. Check its publication or update date and use current product pages and policies for final terms." }],
  };
  return <MarketingInfoPage page={page} />;
}
