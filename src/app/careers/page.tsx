"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { Briefcase } from "lucide-react";

export default function CareersPage() {
  const page: PublicPageData = {
    eyebrow: "Company",
    title: "Careers at Connect Love",
    description: "Build dating technology across product, engineering, support, trust, finance, sales, marketing, and operations.",
    icon: Briefcase,
    cta: { label: "Contact Hiring Team", href: "/contact-us" },
    highlights: ["Role-aware dashboards.", "Member safety as a company habit.", "Clear data responsibility for every team."],
    metrics: [{ value: "6+", label: "team paths" }, { value: "RBAC", label: "access model" }, { value: "Human", label: "support culture" }],
    sections: [
      { title: "Product and engineering", body: "Teams build app routes, backend APIs, authentication, dashboards, and safe product flows.", points: ["Frontend pages.", "NestJS APIs.", "Role guards and data flow."] },
      { title: "Support and trust", body: "Teams resolve user questions, safety reports, and high priority cases.", points: ["Tickets.", "Reports.", "Escalations."] },
      { title: "Business teams", body: "Sales, marketing, and administrators handle subscriptions, billing, campaigns, and press.", points: ["Billing accuracy.", "Growth reporting.", "Responsible communication."] },
    ],
    actions: [{ title: "Choose role", body: "Candidate reads the matching team section." }, { title: "Contact", body: "Candidate sends inquiry through backend contact form." }, { title: "Review", body: "Team routes the message internally." }],
    roleAccess: [{ role: "Support teammate", access: "Support dashboard, contacts, tickets, and safety queues." }, { role: "Sales teammate", access: "Sales pages for subscriptions, plans, and revenue trends." }, { role: "Admin teammate", access: "Admin pages for users, verification, reports, billing, and platform operations." }],
    faq: [{ question: "Where do applicants apply?", answer: "Use Contact Us until a dedicated careers backend is added." }, { question: "Why mention permissions?", answer: "Because every team must handle member data carefully." }],
  };
  return <MarketingInfoPage page={page} />;
}
