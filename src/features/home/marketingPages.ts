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
      { label: "Stories", href: "/stories" },
      { label: "Features", href: "/features" },
      { label: "Safety", href: "/safety" },
      { label: "Premium", href: "/premium" },
    ],
  },
  {
    category: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Ethics Statement", href: "/ethics-statement" },
    ],
  },
  {
    category: "Support",
    links: [
      { label: "Help Center", href: "/help-center" },
      { label: "Contact Us", href: "/contact-us" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cookie Policy", href: "/cookie-policy" },
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
  highlights: string[];
  metrics: { value: string; label: string }[];
  sections: { title: string; body: string; points: string[] }[];
  actions: { title: string; body: string }[];
  roleAccess?: { role: string; access: string }[];
  faq: { question: string; answer: string }[];
};
