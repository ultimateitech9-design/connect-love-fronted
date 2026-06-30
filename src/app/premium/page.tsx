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
      "Basic includes profile creation, 20 likes per day, basic matching, chat after match, and profile viewing.",
      "Premium unlocks unlimited likes, see who liked you, super likes, boosts, no ads, and priority matching.",
      "Elite adds unlimited super likes, unlimited boosts, advanced filters, top search ranking, and premium badge.",
    ],
    metrics: [
      { value: "3", label: "plan levels" },
      { value: "0", label: "safety paywalls" },
      { value: "Anytime", label: "upgrade path" },
    ],
    sections: [
      {
        title: "Basic Plan",
        body: "Basic users can understand the product before paying. They get limited daily likes, matching, chat after match, and basic profile viewing.",
        points: ["₹0/month.", "20 likes per day.", "Basic matching and chat after match."],
      },
      {
        title: "Premium Plan",
        body: "Premium is the main upgrade path for users who want more reach and smoother conversations.",
        points: ["₹199/month.", "Unlimited likes and see who liked you.", "5 super likes per day and weekly profile boost."],
      },
      {
        title: "Elite Plan",
        body: "Elite is for serious connections with every premium visibility and filtering tool enabled.",
        points: ["₹399/month.", "Unlimited super likes and boosts.", "Advanced filters, top search ranking, and premium badge."],
      },
    ],
    actions: [
      { title: "Choose plan", body: "User compares Basic, Premium, and Elite benefits." },
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
