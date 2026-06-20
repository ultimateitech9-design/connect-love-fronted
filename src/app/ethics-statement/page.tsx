"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { BadgeCheck } from "lucide-react";

export default function EthicsStatementPage() {
  const page: PublicPageData = {
    eyebrow: "Company",
    title: "Ethics Statement",
    description: "Our product decisions are guided by consent, transparency, privacy, fair access, healthy engagement, and responsible moderation.",
    icon: BadgeCheck,
    cta: { label: "Review Safety", href: "/safety" },
    highlights: ["Safety tools should not be paywalled.", "Sensitive data must be role-limited.", "Moderation actions should be explainable and auditable."],
    metrics: [{ value: "5", label: "principles" }, { value: "RBAC", label: "data rule" }, { value: "Audit", label: "action trail" }],
    sections: [
      { title: "Consent", body: "Users should control their profile, photos, messages, visibility, and deletion requests.", points: ["Clear settings.", "Consent-first stories.", "Contact for privacy questions."] },
      { title: "Responsible monetization", body: "Premium should add value without removing core safety or misleading users.", points: ["No safety paywall.", "No false guarantees.", "Clear plan terms."] },
      { title: "Internal accountability", body: "Admin and management pages should match role needs and avoid unnecessary data access.", points: ["Need-to-know access.", "Logs for sensitive action.", "Super-admin role control."] },
    ],
    actions: [{ title: "Design", body: "Build features around clarity and safety." }, { title: "Review", body: "Check privacy and role impact." }, { title: "Improve", body: "Use support feedback to improve product." }],
    roleAccess: [{ role: "All roles", access: "Use only the data needed for assigned work." }, { role: "Super Admin", access: "Review roles, logs, settings, and security." }, { role: "Support/Admin", access: "Resolve user issues with documented actions." }],
    faq: [{ question: "Is this legal policy?", answer: "No. It complements privacy and terms pages." }, { question: "Why public?", answer: "Members should know the platform's operating principles." }],
  };
  return <MarketingInfoPage page={page} />;
}
