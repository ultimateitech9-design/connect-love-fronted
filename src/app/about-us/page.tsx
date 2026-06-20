"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { HeartHandshake } from "lucide-react";

export default function AboutUsPage() {
  const page: PublicPageData = {
    eyebrow: "Company",
    title: "About Connect Love",
    description:
      "Connect Love is built for people who want genuine connection, safer dating, verified profiles, and compatibility that goes deeper than quick swipes.",
    icon: HeartHandshake,
    cta: { label: "Join Connect Love", href: "/register" },
    highlights: [
      "Designed for verified profiles, respectful messaging, and intentional relationship goals.",
      "Every role, from support to finance to super-admin, has a clear purpose inside the platform.",
      "The product focuses on quality conversations, privacy, and long-term member trust.",
    ],
    metrics: [
      { value: "5+", label: "operating teams" },
      { value: "1", label: "member-first mission" },
      { value: "24/7", label: "safety mindset" },
    ],
    sections: [
      {
        title: "Our mission",
        body: "We want dating to feel calmer, clearer, and more respectful. The app guides people through profile setup, discovery, matching, messaging, and support without making the experience feel shallow.",
        points: ["Verified profile flows build trust.", "Compatibility details help users decide with context.", "Safety actions stay close to user-facing pages."],
      },
      {
        title: "How the platform runs",
        body: "Connect Love has separate user, admin, support, finance, sales, marketing, and super-admin areas so each team works with the right data and the right actions.",
        points: ["Support handles tickets and safety reports.", "Finance handles invoices, refunds, payments, and subscriptions.", "Super-admin controls roles, settings, security, and logs."],
      },
      {
        title: "Product values",
        body: "The product is designed around consent, clarity, privacy, and useful actions. Every page should tell the user what they can do next.",
        points: ["No confusing dead links.", "No hidden safety path.", "No unnecessary access to private member data."],
      },
    ],
    actions: [
      { title: "Learn the mission", body: "Visitors understand what Connect Love stands for before creating an account." },
      { title: "Create an account", body: "Users move into registration and onboarding when they are ready." },
      { title: "Use role-based support", body: "Questions, billing, reports, and privacy requests route to the correct backend-supported area." },
    ],
    roleAccess: [
      { role: "User", access: "Profile, onboarding, discovery, matches, messages, premium, and settings." },
      { role: "Support", access: "Contact requests, tickets, reports, and customer help workflows." },
      { role: "Finance", access: "Subscriptions, payments, transactions, invoices, and refunds." },
      { role: "Super Admin", access: "Roles, security, logs, settings, notifications, and verification oversight." },
    ],
    faq: [
      { question: "Is Connect Love only a landing page?", answer: "No. It has public pages, user pages, and internal dashboards for different roles." },
      { question: "Why split roles?", answer: "Separate roles help keep user data protected and make each dashboard focused on its real work." },
    ],
  };

  return <MarketingInfoPage page={page} />;
}
