"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { ShieldCheck } from "lucide-react";

export default function SafetyPage() {
  const page: PublicPageData = {
    eyebrow: "Trust",
    title: "Safety at every step",
    description:
      "Safety combines verified profiles, block/report actions, privacy controls, support tickets, role-based review, and clear escalation paths.",
    icon: ShieldCheck,
    cta: { label: "Read Privacy Policy", href: "/privacy-policy" },
    highlights: [
      "Report and block actions should be available from profile and message surfaces.",
      "Support and trust-safety teams review cases based on urgency and role permissions.",
      "Sensitive user data stays limited to teams that need it for safety, support, or legal reasons.",
    ],
    metrics: [
      { value: "24/7", label: "report entry" },
      { value: "RBAC", label: "role access" },
      { value: "2 hr", label: "urgent target" },
    ],
    sections: [
      {
        title: "Member protection",
        body: "Users need simple tools for reporting, blocking, hiding contact, managing privacy, and asking for help without searching through the full app.",
        points: ["Report unsafe behavior from profile or chat.", "Block unwanted contact immediately.", "Contact support when a case needs human review."],
      },
      {
        title: "Team workflow",
        body: "Reports can move through intake, triage, review, action, and audit notes. This keeps safety decisions trackable.",
        points: ["Support reviews common tickets.", "Trust-safety handles high priority cases.", "Admin or super-admin reviews sensitive escalations."],
      },
      {
        title: "Backend connection",
        body: "Safety actions should create records that support/admin dashboards can review, with timestamps and status updates.",
        points: ["Contact forms hit backend support routes.", "Tickets can be listed and updated.", "Audit logs can track sensitive role actions."],
      },
    ],
    actions: [
      { title: "Report", body: "User reports a profile, message, payment issue, or safety problem." },
      { title: "Review", body: "Support or admin checks context and severity." },
      { title: "Resolve", body: "Team warns, blocks, escalates, refunds, or closes the case." },
    ],
    roleAccess: [
      { role: "Support", access: "Tickets, contact details, and report context." },
      { role: "Admin", access: "Users, reports, verification, tickets, subscriptions, and payments." },
      { role: "Super Admin", access: "Roles, security, logs, settings, and final escalations." },
    ],
    faq: [
      { question: "Who sees reports?", answer: "Only support, admin, trust-safety, or super-admin roles that need case access." },
      { question: "Are safety tools premium only?", answer: "No. Reporting and blocking should remain available to free and paid users." },
    ],
  };

  return <MarketingInfoPage page={page} />;
}
