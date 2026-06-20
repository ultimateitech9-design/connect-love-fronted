"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { Sparkles } from "lucide-react";

export default function FeaturesPage() {
  const page: PublicPageData = {
    eyebrow: "Product",
    title: "Features for safer dating",
    description:
      "Connect Love brings discovery, profile controls, matches, messaging, video dates, premium plans, reporting, and role dashboards into one connected system.",
    icon: Sparkles,
    cta: { label: "Explore Features", href: "/register" },
    secondaryCta: { label: "View Premium", href: "/premium" },
    highlights: [
      "User features include onboarding, profile, discovery, matches, messages, premium, and settings.",
      "Management features include admin, support, finance, sales, marketing, and super-admin dashboards.",
      "Safety and subscription actions connect to backend-supported support and billing flows.",
    ],
    metrics: [
      { value: "7", label: "user feature areas" },
      { value: "6", label: "management roles" },
      { value: "3", label: "plan levels" },
    ],
    sections: [
      {
        title: "User module",
        body: "The user module handles the actual dating journey: onboarding, profile completion, discovery, matches, chat, premium upgrade, and settings.",
        points: ["Profile data powers matching.", "Messages connect to matches.", "Settings includes account and privacy controls."],
      },
      {
        title: "Admin and support module",
        body: "Admin and support pages help the team review users, reports, verification, tickets, subscriptions, payments, and analytics.",
        points: ["Admin sees operational platform data.", "Support resolves contact forms and tickets.", "Super-admin controls sensitive platform settings."],
      },
      {
        title: "Subscription module",
        body: "Premium actions must be clear and connected to payment, subscription, invoice, refund, sales, and retention pages.",
        points: ["Free users can start safely.", "Gold unlocks more discovery and messaging value.", "Platinum adds visibility and dedicated support."],
      },
    ],
    actions: [
      { title: "Register", body: "A visitor creates an account and starts onboarding." },
      { title: "Use app tools", body: "A user discovers, matches, messages, reports, and edits profile data." },
      { title: "Upgrade or get support", body: "Premium and help actions route to protected app or backend support flows." },
    ],
    roleAccess: [
      { role: "User", access: "Own dating experience and account settings." },
      { role: "Admin", access: "Users, reports, verification, subscriptions, tickets, payments, and analytics." },
      { role: "Support", access: "Contacts, tickets, customer support, reports, and trust-safety queues." },
      { role: "Finance", access: "Invoices, refunds, transactions, subscriptions, and finance reports." },
    ],
    faq: [
      { question: "Should every feature have an action?", answer: "Yes. A feature page should tell users exactly where to go next." },
      { question: "Do admin features show to public users?", answer: "Only public explanation is shown. Real dashboards stay protected by login and role guards." },
    ],
  };

  return <MarketingInfoPage page={page} />;
}
