"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { Megaphone } from "lucide-react";

export default function PressPage() {
  const page: PublicPageData = {
    eyebrow: "Company",
    title: "Press and media",
    description: "Brand facts, product position, safety language, subscription context, and approved media contact path.",
    icon: Megaphone,
    cta: { label: "Contact Press", href: "/contact-us" },
    highlights: ["Public mission language.", "Approved product facts.", "Press inquiries routed through backend contact form."],
    metrics: [{ value: "5", label: "brand topics" }, { value: "1", label: "contact route" }, { value: "Safe", label: "data sharing" }],
    sections: [
      { title: "Company facts", body: "Connect Love focuses on intentional dating, verification, safety, privacy, discovery, messaging, and premium tools.", points: ["Matching.", "Safety.", "Subscriptions."] },
      { title: "Press workflow", body: "Media requests should be reviewed before any sensitive data, policy, or incident detail is shared.", points: ["Marketing drafts.", "Leadership reviews.", "Support verifies safety claims."] },
      { title: "Backend action", body: "Press requests use Contact Us and create backend support records for tracking and follow-up.", points: ["Subject can mention press.", "Email is saved.", "Team can respond."] },
    ],
    actions: [{ title: "Send inquiry", body: "Journalist opens Contact Us." }, { title: "Review", body: "Team checks request." }, { title: "Respond", body: "Approved facts are shared." }],
    faq: [{ question: "Can press access user data?", answer: "No. Only public or approved anonymized information should be shared." }, { question: "Where should urgent requests go?", answer: "Use Contact Us until a dedicated press inbox exists." }],
  };
  return <MarketingInfoPage page={page} />;
}
