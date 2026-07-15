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
    longForm: [
      { title: "Work with a member-first mission", paragraphs: ["ConnectLove teams build and operate technology that handles relationships, identity, safety, payments, and private communication. That work requires empathy, careful judgment, strong engineering, and respect for the people behind the data.", "We value colleagues who can explain trade-offs, document decisions, receive feedback, and improve systems without losing sight of member trust."], points: ["Member safety in everyday decisions.", "Clear communication across teams.", "Privacy-aware product thinking.", "Ownership with accountability."] },
      { title: "Teams and disciplines", paragraphs: ["Roles may span frontend and backend engineering, design, product management, quality, infrastructure, data, customer support, trust and safety, operations, finance, sales, marketing, communications, and security.", "Openings, location, work model, experience expectations, and compensation should be confirmed in the relevant job description when positions are formally published."], points: ["Product and engineering.", "Trust, safety, and support.", "Growth and communications.", "Finance and platform operations."] },
      { title: "Responsible access to member data", paragraphs: ["Employment does not grant unrestricted access to user information. Access should be tied to job duties, approved roles, secure accounts, and monitored systems. Browsing data out of curiosity, sharing credentials, or exporting records without authorization is unacceptable.", "Teams handling reports, payments, verification, or messages may receive additional training and confidentiality obligations."], points: ["Least-privilege access.", "No shared accounts.", "Audit sensitive actions.", "Escalate suspected misuse promptly."] },
      { title: "Applying and candidate privacy", paragraphs: ["Until dedicated job listings are available, candidates may contact the hiring team through Contact Us using Careers as the problem type. Send a short role summary and a safe link to professional materials; do not submit government IDs, bank details, passwords, or unrelated sensitive data.", "Application information should be used for recruitment, interview coordination, evaluation, fraud prevention, and required recordkeeping. Candidates should be told if a different hiring provider or process applies."], points: ["Identify the role or team.", "Share relevant experience.", "Avoid unnecessary sensitive documents.", "Watch for impersonation and payment scams."] },
    ],
    actions: [{ title: "Choose role", body: "Candidate reads the matching team section." }, { title: "Contact", body: "Candidate sends inquiry through backend contact form." }, { title: "Review", body: "Team routes the message internally." }],
    roleAccess: [{ role: "Support teammate", access: "Support dashboard, contacts, tickets, and safety queues." }, { role: "Sales teammate", access: "Sales pages for subscriptions, plans, and revenue trends." }, { role: "Admin teammate", access: "Admin pages for users, verification, reports, billing, and platform operations." }],
    faq: [{ question: "Where do applicants apply?", answer: "Use Contact Us with Careers as the problem type until dedicated job listings are available." }, { question: "Why mention permissions?", answer: "Because every team must handle member data carefully." }, { question: "Will ConnectLove ask applicants for money?", answer: "A legitimate application should not require payment for an interview or job offer. Report suspicious requests." }, { question: "Are all teams currently hiring?", answer: "No. Team descriptions explain career paths and do not represent a current vacancy unless a role is specifically posted." }],
  };
  return <MarketingInfoPage page={page} />;
}
