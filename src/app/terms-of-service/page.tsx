"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { BadgeCheck } from "lucide-react";

export default function TermsOfServicePage() {
  const page: PublicPageData = {
    eyebrow: "Legal",
    title: "Terms of Service",
    description: "Rules for account behavior, subscriptions, safety reports, moderation, content, protected dashboards, and platform access.",
    icon: BadgeCheck,
    cta: { label: "Create Account", href: "/register" },
    highlights: ["Users must provide accurate profile details.", "Premium unlocks paid features and billing actions.", "Unsafe behavior can lead to enforcement."],
    metrics: [{ value: "18+", label: "intended users" }, { value: "Clear", label: "rules" }, { value: "Fair", label: "review process" }],
    sections: [
      { title: "Account rules", body: "Members should use truthful profiles, secure login details, respectful communication, and one account per person.", points: ["No impersonation.", "No scams.", "No harassment."] },
      { title: "Subscriptions", body: "Premium features, plan changes, invoices, refunds, and payment questions connect to finance and support workflows.", points: ["Plan terms.", "Refund review.", "Billing support."] },
      { title: "Enforcement", body: "Reports can lead to warnings, restrictions, suspension, removal, or escalation depending on severity.", points: ["Support review.", "Admin action.", "Super-admin oversight."] },
    ],
    actions: [{ title: "Accept", body: "User agrees by creating or using an account." }, { title: "Use responsibly", body: "User follows platform and safety rules." }, { title: "Resolve issue", body: "Support/admin handles disputes, reports, and billing questions." }],
    roleAccess: [{ role: "User", access: "Must follow account, content, safety, and subscription rules." }, { role: "Support/Admin", access: "May review tickets, reports, users, and enforcement context." }, { role: "Super Admin", access: "May manage roles, settings, security, logs, and final escalations." }],
    faq: [{ question: "Can accounts be restricted?", answer: "Yes. Abuse, scams, impersonation, harassment, or safety risk can lead to restrictions." }, { question: "Are subscriptions covered?", answer: "Yes. Premium plan use, billing, and refunds are part of service terms." }],
  };
  return <MarketingInfoPage page={page} />;
}
