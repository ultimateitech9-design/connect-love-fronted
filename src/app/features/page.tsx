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
        points: ["Free users can start safely.", "Gold unlocks more discovery and messaging value.", "Diamond adds visibility and dedicated support."],
      },
    ],
    longForm: [
      { title: "Profile and onboarding", paragraphs: ["Registration captures the basic account information needed to begin. Guided onboarding then helps members add age, city, profession, religion, height, bio, interests, personality, hobbies, photos, and verification information.", "Members should keep profiles truthful and current. Profile settings allow updates while privacy controls determine which status, distance, and photo information may be shown."], points: ["Guided profile completion.", "Photo management and live verification flow.", "Relationship goals and interest tags.", "Visibility and privacy settings."] },
      { title: "Discovery and matching", paragraphs: ["Discovery combines member preferences with available profile and location information. Filters cover age, distance, interests, relationship goals, verification, and Interested In choices for women, men, non-binary people, or everyone.", "Likes, passes, and super likes help members act on profiles. Mutual interest creates a match and opens the communication journey."], points: ["Search and filter controls.", "Distance-aware ordering where location is available.", "Profile boosts and priority features by plan.", "Block and report access."] },
      { title: "Messaging and connection tools", paragraphs: ["Matched members can continue conversations through messaging features. Depending on availability and plan, the experience can include read states, media, reactions, gifts, video-date tools, conversation themes, and profile context.", "Communication tools must be used with consent. Spam, threats, impersonation, financial solicitation, and harassment are not acceptable."], points: ["Match-based conversations.", "Media and expressive chat tools.", "Video-date pathway.", "Message reporting and safety controls."] },
      { title: "Premium, support, and account control", paragraphs: ["Basic, Premium, and Elite plans offer different limits and visibility tools. Core reporting and blocking remain available regardless of plan. Billing questions and support requests follow dedicated assistance routes.", "Settings help members manage notifications, privacy, account visibility, and deactivation. Privacy or deletion requests can be sent through the support process."], points: ["Transparent plan comparison.", "Billing and subscription support.", "Notification and privacy choices.", "Account deactivation and request paths."] },
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
      { role: "Super Admin", access: "Roles, security, logs, settings, verification, and platform operations." },
    ],
    faq: [
      { question: "Do I need Premium to report someone?", answer: "No. Core safety actions such as reporting and blocking are not paid features." },
      { question: "Do admin features show to public users?", answer: "Only public explanation is shown. Real dashboards stay protected by login and role guards." },
      { question: "Can I change my discovery preferences?", answer: "Yes. Filters can be adjusted in Discover, and profile or privacy choices can be updated in the relevant account pages." },
      { question: "Are all features always available?", answer: "Availability can depend on account status, device support, location, plan, safety review, and ongoing product updates." },
    ],
  };

  return <MarketingInfoPage page={page} />;
}
