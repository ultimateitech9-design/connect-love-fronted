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
    longForm: [
      { title: "Before you connect", paragraphs: ["Use profile information and verification as context, not proof that someone is safe or compatible. Be careful with incomplete profiles, inconsistent stories, copied-looking photos, immediate requests to move off-platform, and anyone who asks for money or confidential information.", "Keep your password, OTP, financial credentials, home address, workplace details, and government ID private. ConnectLove support will not ask for your password or payment PIN."], points: ["Review the full profile.", "Keep early communication in the app.", "Never send money or investment funds.", "Trust discomfort and stop the interaction."] },
      { title: "Messaging boundaries and consent", paragraphs: ["A match permits communication; it does not create an obligation to reply, share photos, provide a phone number, engage in sexual conversation, or meet. Consent must be voluntary, specific, informed, and can be withdrawn at any time.", "Repeated unwanted messages, threats, hate, blackmail, non-consensual sexual content, doxxing, and attempts to exploit another member may lead to restrictions and escalation."], points: ["Ask before sending sensitive content.", "Respect a no or lack of response.", "Block unwanted contact.", "Save relevant evidence before reporting."] },
      { title: "Meeting safely in person", paragraphs: ["Choose a populated public location, arrange independent transport, tell a trusted person where you are going, keep your phone charged, and avoid leaving food or drinks unattended. Consider a short video conversation first, but remember that video does not remove all risk.", "Leave immediately if the situation feels unsafe. For urgent danger or a suspected crime, contact local emergency services or law enforcement; an in-app report is not an emergency service."], points: ["Meet in public.", "Share plans with someone trusted.", "Control your own travel.", "Limit alcohol and stay alert."] },
      { title: "Reporting, review, and support", paragraphs: ["Reports should include the relevant profile, message, approximate time, and a clear description. The team may review account, interaction, verification, device, or payment context reasonably needed to investigate and protect users.", "Possible outcomes include no action, guidance, warning, content removal, feature restriction, suspension, termination, preservation of evidence, or lawful escalation. To protect privacy and prevent abuse, we may not disclose every investigation detail or action taken."], points: ["Report from profile or message surfaces where available.", "Use Contact Us for additional evidence.", "Do not make knowingly false reports.", "Retaliation against reporters is prohibited."] },
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
      { question: "Are safety tools premium only?", answer: "No. Reporting and blocking remain available to free and paid users." },
      { question: "Is ConnectLove an emergency service?", answer: "No. Contact local emergency services immediately when someone is in urgent danger." },
      { question: "Will I be told what happened after a report?", answer: "We may provide a status or general outcome, but privacy and investigation integrity can limit the details shared." },
    ],
  };

  return <MarketingInfoPage page={page} />;
}
