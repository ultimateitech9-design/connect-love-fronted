import type { LucideIcon } from "lucide-react";

export const navLinks = [
  { href: "/about-us", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/safety", label: "Safety" },
  { href: "/help-center", label: "Support" },
];

export const footerLinkGroups = [
  {
    category: "Product",
    links: [
      { label: "Discover", href: "/discover" },
      { label: "Features", href: "/features" },
      { label: "Safety", href: "/safety" },
      { label: "Dating Locations", href: "/dating" },
      { label: "Worldwide Dating", href: "/dating/world" },
    ],
  },
  {
    category: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Blog", href: "/blog" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
  },
  {
    category: "Support",
    links: [
      { label: "Support", href: "/help-center" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
    ],
  },
];

export type PublicPageData = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  contactEmails?: { label: string; email: string }[];
  highlights: string[];
  metrics: { value: string; label: string }[];
  sections: { title: string; body: string; points: string[] }[];
  longForm?: { title: string; paragraphs: string[]; points?: string[] }[];
  actions: { title: string; body: string }[];
  roleAccess?: { role: string; access: string }[];
  faq: { question: string; answer: string }[];
  lastUpdated?: string;
};
