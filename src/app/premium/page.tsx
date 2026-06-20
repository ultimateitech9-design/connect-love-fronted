"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { Crown } from "lucide-react";

export default function PremiumPage() {
  const page: PublicPageData = {
    eyebrow: "Subscriptions",
    title: "Premium plans for serious connection",
    description:
      "Premium connects plan selection, subscription checkout, billing support, invoices, refunds, sales trends, and retention reporting.",
    icon: Crown,
    cta: { label: "Subscribe Now", href: "/user/premium" },
    secondaryCta: { label: "Create Free Account", href: "/register" },
    highlights: [
      "Free includes profile creation, limited discovery, basic messages, and safety tools.",
      "Gold unlocks unlimited matches, priority visibility, video dates, read receipts, and filters.",
      "Platinum adds global search, verified badge support, daily boosts, and dedicated support.",
    ],
    metrics: [
      { value: "3", label: "plan levels" },
      { value: "0", label: "safety paywalls" },
      { value: "Anytime", label: "upgrade path" },
    ],
    sections: [
      {
        title: "Free plan",
        body: "Free users can understand the product before paying. They can create a profile, browse limited discovery, message within limits, and use safety tools.",
        points: ["Profile and onboarding access.", "Basic discovery and matching.", "Report and block actions remain available."],
      },
      {
        title: "Gold plan",
        body: "Gold is the main upgrade path for users who want more reach and smoother conversations.",
        points: ["Unlimited matches.", "Priority visibility and advanced filters.", "Video dates and AI icebreakers."],
      },
      {
        title: "Backend billing flow",
        body: "Premium actions connect to user premium pages and backend billing-related dashboards for subscriptions, transactions, refunds, and invoices.",
        points: ["Finance reviews payments and refunds.", "Sales tracks conversions and retention.", "Support handles billing questions."],
      },
    ],
    actions: [
      { title: "Choose plan", body: "User compares Free, Gold, and Platinum benefits." },
      { title: "Subscribe", body: "Paid CTA routes to the protected user premium page." },
      { title: "Manage billing", body: "Billing questions route to support and finance workflows." },
    ],
    roleAccess: [
      { role: "User", access: "Plan choice, upgrade, premium feature use, and billing support request." },
      { role: "Finance", access: "Subscriptions, invoices, refunds, transactions, and reports." },
      { role: "Sales", access: "Plans, campaigns, conversions, retention, and trends." },
      { role: "Support", access: "Premium questions and customer tickets." },
    ],
    faq: [
      { question: "Does Premium guarantee love?", answer: "No. Premium improves tools and visibility, but behavior and compatibility still matter." },
      { question: "Where does Subscribe go?", answer: "It routes to /user/premium so logged-in users can continue into checkout." },
    ],
  };

  return <MarketingInfoPage page={page} />;
}
