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
        points: ["Support handles tickets and safety reports.", "Administrators handle billing, payments, and subscriptions.", "Super-admin controls roles, settings, security, and logs."],
      },
      {
        title: "Product values",
        body: "The product is designed around consent, clarity, privacy, and useful actions. Every page should tell the user what they can do next.",
        points: ["No confusing dead links.", "No hidden safety path.", "No unnecessary access to private member data."],
      },
    ],
    longForm: [
      { title: "Why ConnectLove exists", paragraphs: ["Online dating can feel noisy, uncertain, and overly focused on quick judgments. ConnectLove is designed to give people more context: what someone values, what kind of relationship they want, what interests they share, and whether they are ready to communicate respectfully.", "Our aim is not to manufacture perfect compatibility. It is to provide clearer tools so adults can make their own informed choices while retaining control over consent, privacy, and pace."], points: ["Intentional profiles over empty swiping.", "Clear relationship goals and preferences.", "Mutual interest before messaging.", "Easy access to safety and support."] },
      { title: "The member journey", paragraphs: ["A member begins with registration and guided onboarding, adds profile and verification details, sets discovery preferences, explores profiles, and expresses interest through likes or super likes. Mutual interest creates a match, after which members can communicate and decide whether to continue.", "At every stage, members can change preferences, manage visibility, stop an interaction, block or report, request support, review premium options, or deactivate the account."], points: ["Register and complete a truthful profile.", "Discover using personal preferences.", "Match and communicate with consent.", "Manage privacy, billing, and support."] },
      { title: "How we think about trust", paragraphs: ["Trust is built through product design and consistent operations, not a single badge. Verification, reporting, access controls, moderation records, support workflows, and transparent policies each contribute a layer.", "No technology can eliminate all risk. We encourage members to combine platform tools with careful judgment, safe meeting practices, and prompt reporting of suspicious behavior."], points: ["Verification is a signal, not a guarantee.", "Core safety tools remain free.", "Sensitive access follows job responsibilities.", "Serious concerns can be escalated."] },
      { title: "A product that should keep improving", paragraphs: ["We use support themes, operational data, safety trends, accessibility needs, and member feedback to understand where the experience is confusing or unsafe. Product decisions should balance usefulness with privacy and avoid engagement patterns that encourage harmful behavior.", "As ConnectLove evolves, public pages, feature descriptions, prices, and policies should remain aligned with the actual service."], points: ["Listen to member feedback.", "Measure quality as well as growth.", "Document sensitive operational actions.", "Explain material product changes."] },
    ],
    actions: [
      { title: "Learn the mission", body: "Visitors understand what Connect Love stands for before creating an account." },
      { title: "Create an account", body: "Users move into registration and onboarding when they are ready." },
      { title: "Use role-based support", body: "Questions, billing, reports, and privacy requests route to the correct backend-supported area." },
    ],
    roleAccess: [
      { role: "User", access: "Profile, onboarding, discovery, matches, messages, premium, and settings." },
      { role: "Support", access: "Contact requests, tickets, reports, and customer help workflows." },
      { role: "Sales", access: "Subscriptions, plans, and revenue trends." },
      { role: "Super Admin", access: "Roles, security, logs, settings, notifications, and verification oversight." },
    ],
    faq: [
      { question: "Is Connect Love only a landing page?", answer: "No. It has public pages, user pages, and internal dashboards for different roles." },
      { question: "Why split roles?", answer: "Separate roles help keep user data protected and make each dashboard focused on its real work." },
      { question: "Does ConnectLove guarantee relationships?", answer: "No. The service provides discovery and communication tools, while members make their own choices and outcomes vary." },
      { question: "How can I share feedback?", answer: "Use the Contact Us page with Product Feedback as the problem type." },
    ],
  };

  return <MarketingInfoPage page={page} />;
}
