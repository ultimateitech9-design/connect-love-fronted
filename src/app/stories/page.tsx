"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { BookOpen } from "lucide-react";

export default function StoriesPage() {
  const page: PublicPageData = {
    eyebrow: "Product",
    title: "Stories from meaningful matches",
    description: "Stories explain how members move from profile to conversation to real connection while keeping consent, privacy, and safety clear.",
    icon: BookOpen,
    cta: { label: "Create Your Story", href: "/register" },
    highlights: ["Consent-first story publishing.", "Real dating learnings from members.", "Safe editorial review before anything goes public."],
    metrics: [{ value: "3", label: "review stages" }, { value: "100%", label: "consent required" }, { value: "0", label: "private data exposed" }],
    sections: [
      { title: "Story content", body: "A story can include how people matched, what made the conversation work, and how they planned a respectful first date.", points: ["No private chats without consent.", "No sensitive data.", "Photos require approval."] },
      { title: "Review process", body: "Support or marketing should review stories before publishing so member privacy is protected.", points: ["Collect permission.", "Edit personal details.", "Remove if consent changes."] },
      { title: "Backend action", body: "Story interest can route through contact/support until a dedicated story submission backend is added.", points: ["Contact form captures request.", "Support can triage it.", "Marketing can follow up."] },
    ],
    actions: [{ title: "Submit", body: "Member sends story interest through contact." }, { title: "Review", body: "Team checks consent and privacy." }, { title: "Publish", body: "Approved story is made public safely." }],
    faq: [{ question: "Can a story be removed?", answer: "Yes, members should contact support to remove or update it." }, { question: "Can stories include Premium?", answer: "Only if relevant, and never as a guarantee of results." }],
  };
  return <MarketingInfoPage page={page} />;
}
