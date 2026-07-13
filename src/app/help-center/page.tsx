"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { HelpCircle } from "lucide-react";

export default function HelpCenterPage() {
  const page: PublicPageData = {
    eyebrow: "Support",
    title: "Help Center",
    description: "Help for accounts, login, onboarding, discovery, messages, premium subscriptions, billing, reports, and privacy requests.",
    icon: HelpCircle,
    cta: { label: "Contact Support", href: "/contact-us" },
    highlights: ["Contact form is connected to backend support/contact.", "Tickets can be reviewed from support dashboards.", "Billing and safety issues route to the right team."],
    metrics: [{ value: "6", label: "help areas" }, { value: "24 hr", label: "reply target" }, { value: "Urgent", label: "safety path" }],
    sections: [
      { title: "Account help", body: "Users can get help with login, registration, onboarding, profile edits, photos, preferences, and account deletion.", points: ["Login issues.", "Profile updates.", "Delete account requests."] },
      { title: "Dating help", body: "Help content explains how likes, matches, discovery, messaging, reports, and blocks work.", points: ["Discovery questions.", "Message limits.", "Report/block flow."] },
      { title: "Backend support", body: "Contact Us posts to the NestJS support endpoint and creates a support record that dashboards can list and update.", points: ["POST /support/contact.", "GET /support/tickets.", "PATCH ticket status."] },
    ],
    actions: [{ title: "Find topic", body: "User identifies account, safety, billing, or product issue." }, { title: "Contact support", body: "User submits backend-connected contact form." }, { title: "Resolve ticket", body: "Support reviews and updates status." }],
    roleAccess: [{ role: "Support", access: "Contacts, tickets, high priority queues, and trust-safety pages." }, { role: "Sales", access: "Plans, subscriptions, and revenue context." }, { role: "Admin", access: "Users, reports, tickets, verification, billing, and payments context." }],
    faq: [{ question: "What is connected to backend?", answer: "Contact Us is connected to /support/contact and footer subscribe is connected to /support/newsletter." }, { question: "Can support update tickets?", answer: "Yes, protected support routes can list and update ticket status." }],
  };
  return <MarketingInfoPage page={page} />;
}
