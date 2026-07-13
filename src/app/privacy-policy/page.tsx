"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { Users } from "lucide-react";

export default function PrivacyPolicyPage() {
  const page: PublicPageData = {
    eyebrow: "Privacy",
    title: "Privacy Policy",
    description: "How Connect Love collects, uses, protects, and limits access to member data across app features, subscriptions, support, and role dashboards.",
    icon: Users,
    cta: { label: "Manage Account", href: "/user/settings" },
    secondaryCta: { label: "Contact Privacy Team", href: "/contact-us" },
    highlights: ["Members control profile, photos, preferences, messages, and account settings.", "Internal access is role-based.", "Subscription and payment data is used for billing, refunds, invoices, and fraud prevention."],
    metrics: [{ value: "Role", label: "based access" }, { value: "No", label: "data selling" }, { value: "48 hr", label: "deletion target" }],
    sections: [
      { title: "Data collected", body: "Account, profile, photos, preferences, location, messages, reports, support requests, and subscription records can be used to operate the product.", points: ["Profile data powers discovery.", "Support data resolves tickets.", "Payment data supports billing."] },
      { title: "Data controls", body: "Users should be able to edit profile data, change settings, request deletion, contact support, and ask privacy questions.", points: ["Settings route.", "Contact form route.", "Support review route."] },
      { title: "Backend usage", body: "Backend modules store users, matches, messages, support contacts, payments, subscriptions, roles, logs, and platform settings.", points: ["User module.", "Support module.", "Platform/admin modules."] },
    ],
    actions: [{ title: "Review", body: "User checks profile and account data." }, { title: "Control", body: "User updates settings or submits privacy request." }, { title: "Backend follow-up", body: "Support/admin handles records under role permission." }],
    roleAccess: [{ role: "User", access: "Own profile, photos, messages, preferences, premium, and settings." }, { role: "Support", access: "Tickets, contact context, and report details needed for resolution." }, { role: "Sales", access: "Plans, subscriptions, and revenue context." }, { role: "Admin", access: "Users, reports, verification, tickets, subscriptions, payments, and analytics." }, { role: "Super Admin", access: "Roles, settings, security, logs, notifications, users, payments, and verification." }],
    faq: [{ question: "Who can see private data?", answer: "Only users and authorized roles with a real operational reason should access private data." }, { question: "Is payment data shared with everyone?", answer: "No. It should stay limited to billing, finance, support, admin, and fraud prevention workflows." }],
  };
  return <MarketingInfoPage page={page} />;
}
