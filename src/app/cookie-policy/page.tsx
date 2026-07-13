"use client";

import { MarketingInfoPage } from "@/features/home/MarketingInfoPage";
import type { PublicPageData } from "@/features/home/marketingPages";
import { Cookie } from "lucide-react";

export default function CookiePolicyPage() {
  const page: PublicPageData = {
    eyebrow: "Privacy",
    title: "Cookie Policy",
    description: "Cookies and similar technologies support login sessions, route protection, preferences, analytics, subscriptions, and dashboard access.",
    icon: Cookie,
    cta: { label: "Read Privacy Policy", href: "/privacy-policy" },
    highlights: ["Essential cookies keep users signed in.", "Preference cookies remember app choices.", "Analytics helps improve flows without selling personal data."],
    metrics: [{ value: "3", label: "cookie groups" }, { value: "Secure", label: "session flow" }, { value: "No", label: "personal data sale" }],
    sections: [
      { title: "Essential cookies", body: "These keep authentication, protected routes, and security checks working.", points: ["Login state.", "Role access.", "Anti-abuse checks."] },
      { title: "Preference cookies", body: "These remember choices like theme, dashboard state, and repeated setup preferences.", points: ["Theme.", "Layout.", "Notification choices."] },
      { title: "Backend connection", body: "Cookies help the frontend send authenticated requests to protected backend endpoints for dashboards and account pages.", points: ["JWT protected routes.", "Support dashboard calls.", "Admin APIs."] },
    ],
    actions: [{ title: "Use site", body: "Essential cookies support navigation and login." }, { title: "Save preferences", body: "Optional choices can make the app smoother." }, { title: "Ask privacy", body: "Questions route to Contact Us." }],
    roleAccess: [{ role: "User", access: "Own session and preferences." }, { role: "Admin/Super Admin", access: "Dashboard session and security context." }, { role: "Sales/Marketing", access: "Aggregated campaign and conversion signals where allowed." }],
    faq: [{ question: "Are cookies required?", answer: "Essential cookies are required for login and protected dashboards." }, { question: "Do cookies sell data?", answer: "No. The policy states personal data is not sold through cookies." }],
  };
  return <MarketingInfoPage page={page} />;
}
