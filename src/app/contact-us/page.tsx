"use client";

import { ContactUsForm } from "@/features/home/ContactUsForm";
import { Footer } from "@/features/home/Footer";
import { Navbar } from "@/features/home/Navbar";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { Clock3, HeartHandshake, LockKeyhole, Mail, ShieldAlert } from "lucide-react";

const supportTopics = [
  {
    icon: LockKeyhole,
    title: "Account & privacy",
    description: "Get help with login, profile access, privacy settings, verification, or account changes.",
  },
  {
    icon: HeartHandshake,
    title: "Matches & subscriptions",
    description: "Tell us about matching, messaging, premium plans, payments, or billing questions.",
  },
  {
    icon: ShieldAlert,
    title: "Safety concerns",
    description: "Report suspicious behaviour, harassment, fake profiles, or anything that made you feel unsafe.",
  },
];

const contactPageJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact ConnectLove Support",
    description:
      "Contact ConnectLove for account, privacy, verification, subscription, payment, or dating safety support.",
    url: `${SITE_URL}/contact-us`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      email: "support@connectlove.in",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@connectlove.in",
        availableLanguage: ["English", "Hindi"],
      },
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Contact Us", item: `${SITE_URL}/contact-us` },
    ],
  },
];

export default function ContactUsPage() {
  return (
    <div className="contact-page min-h-screen bg-slate-50 dark:bg-[#121218]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd).replace(/</g, "\\u003c") }}
      />
      <Navbar
        onLoginClick={() => {
          window.location.href = "/login";
        }}
        onSignupClick={() => {
          window.location.href = "/register";
        }}
      />
      <main>
        <section className="contact-page-hero border-b border-rose-100 bg-gradient-to-b from-rose-50 via-white to-slate-50 py-14 dark:border-white/10 dark:from-[#17121a] dark:via-[#121218] dark:to-[#121218] md:py-20">
          <div className="mx-auto w-[90vw] max-w-5xl text-center">
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
              <a href="/" className="hover:text-rose-600">Home</a>
              <span aria-hidden="true"> / </span>
              <span aria-current="page">Contact Us</span>
            </nav>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-500">ConnectLove Support</p>
            <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
              We’re here to help you feel safe and supported
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Whether you have an account question, a payment issue, or a safety concern, share the details below and our support team will help you find the right next step.
            </p>
          </div>
        </section>

        <section className="mx-auto w-[90vw] max-w-5xl py-12 md:py-16">
          <div className="grid gap-4 md:grid-cols-3">
            {supportTopics.map((topic) => {
              const Icon = topic.icon;
              return (
                <article key={topic.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#1d1d25]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{topic.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{topic.description}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <ContactUsForm />

            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-lg">
                <Clock3 className="h-6 w-6 text-rose-300" />
                <h2 className="mt-4 text-lg font-bold">What happens next?</h2>
                <ol className="mt-4 space-y-4 text-sm leading-6 text-slate-300">
                  <li><strong className="text-white">1. We review</strong><br />Your request goes to the relevant support team.</li>
                  <li><strong className="text-white">2. We contact you</strong><br />We’ll use your email or phone number if more details are needed.</li>
                  <li><strong className="text-white">3. We help resolve it</strong><br />You’ll receive guidance or an update about the action taken.</li>
                </ol>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-500/25 dark:bg-rose-500/10">
                <Mail className="h-5 w-5 text-rose-600" />
                <h2 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">Help us respond faster</h2>
                <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Include the email linked to your account, what happened, when it happened, and a screenshot if it helps explain the issue. Never share your password or payment PIN.
                </p>
                <a
                  href="mailto:support@connectlove.in"
                  className="mt-3 inline-flex min-h-11 items-center text-xs font-bold text-rose-700 hover:underline dark:text-rose-300"
                >
                  support@connectlove.in
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
