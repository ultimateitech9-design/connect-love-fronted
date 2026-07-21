"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, ChevronRight, HelpCircle, Mail } from "lucide-react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import type { PublicPageData } from "./marketingPages";

export function MarketingInfoPage({ page }: { page: PublicPageData }) {
  const Icon = page.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar
        onLoginClick={() => {
          window.location.href = "/login";
        }}
        onSignupClick={() => {
          window.location.href = "/register";
        }}
      />

      <main className="pt-20">
        <section className="bg-white">
          <div className="mx-auto grid min-h-[560px] w-[90vw] max-w-7xl items-center gap-10 py-16 md:grid-cols-[1.08fr_0.92fr] md:py-20">
            <div>
              <span className="inline-flex items-center rounded-full bg-rose-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-rose-500">
                {page.eyebrow}
              </span>
              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 md:text-6xl">
                {page.title}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{page.description}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={page.cta.href}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition hover:from-rose-400 hover:to-pink-500"
                >
                  {page.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {page.secondaryCta ? (
                  <Link
                    href={page.secondaryCta.href}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
                  >
                    {page.secondaryCta.label}
                  </Link>
                ) : null}
              </div>

              {page.contactEmails?.length ? (
                <div className="mt-6 flex flex-wrap gap-3" aria-label="Contact email addresses">
                  {page.contactEmails.map((contact) => (
                    <a
                      key={contact.email}
                      href={`mailto:${contact.email}`}
                      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-rose-200 hover:bg-rose-50/60"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-rose-500 shadow-sm transition group-hover:bg-rose-500 group-hover:text-white">
                        <Mail className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{contact.label}</span>
                        <span className="block text-sm font-semibold text-slate-800 group-hover:text-rose-600">{contact.email}</span>
                      </span>
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/25">
                <Icon className="h-8 w-8 text-white" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-slate-900">What this page covers</h2>
              <div className="mt-5 space-y-4">
                {page.highlights.map((item) => (
                  <div key={item} className="flex gap-3 rounded-2xl bg-white p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                    <p className="text-sm leading-6 text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-950">
          <div className="mx-auto grid w-[90vw] max-w-7xl gap-px overflow-hidden py-px sm:grid-cols-3">
            {page.metrics.map((metric) => (
              <div key={`${metric.value}-${metric.label}`} className="bg-slate-950 px-6 py-8 text-center">
                <p className="text-3xl font-black text-white">{metric.value}</p>
                <p className="mt-2 text-sm font-medium text-white/55">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto w-[90vw] max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-widest text-rose-500">Details</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                A closer look at {page.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Understand the purpose, key capabilities, and choices available to you across this part of ConnectLove.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {page.sections.map((section) => (
                <article key={section.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-xl font-bold text-slate-950">{section.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{section.body}</p>
                  <ul className="mt-5 space-y-3">
                    {section.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-sm leading-6 text-slate-700">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {page.longForm?.length ? (
          <section className="border-y border-slate-200 bg-white py-16 md:py-20">
            <div className="mx-auto w-[90vw] max-w-5xl">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-widest text-rose-500">Complete guide</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Everything you should know</h2>
                <p className="mt-4 text-base leading-7 text-slate-600">Detailed information written for members, visitors, and anyone who wants to understand how this area of ConnectLove works.</p>
              </div>
              <div className="mt-10 divide-y divide-slate-200 rounded-3xl border border-slate-200 px-6 md:px-9">
                {page.longForm.map((section, index) => (
                  <article key={section.title} className="py-8 md:py-10">
                    <div className="grid gap-4 md:grid-cols-[48px_minmax(0,1fr)]">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-sm font-black text-rose-600">{index + 1}</div>
                      <div>
                        <h3 className="text-xl font-black text-slate-950 md:text-2xl">{section.title}</h3>
                        <div className="mt-4 space-y-4">
                          {section.paragraphs.map((paragraph) => <p key={paragraph} className="text-sm leading-7 text-slate-600">{paragraph}</p>)}
                        </div>
                        {section.points?.length ? (
                          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                            {section.points.map((point) => <li key={point} className="flex gap-2.5 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" /><span>{point}</span></li>)}
                          </ul>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="bg-slate-50 py-16 md:py-20">
          <div className="mx-auto grid w-[90vw] max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-rose-500">Action Flow</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                What should happen next
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Follow these practical steps to move from information to the right ConnectLove action.
              </p>
            </div>

            <div className="space-y-4">
              {page.actions.map((action, index) => (
                <div key={action.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-black text-rose-600">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">{action.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{action.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {page.roleAccess ? (
          <section className="bg-white py-16 md:py-20">
            <div className="mx-auto w-[90vw] max-w-7xl">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-widest text-rose-500">Roles and permissions</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
                  Who can use this information
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Role-specific access keeps user, subscription, report, and dashboard data aligned with the work each team performs.
                </p>
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
                {page.roleAccess.map((item, index) => (
                  <div key={`${item.role}-${index}`} className="grid gap-2 border-b border-slate-200 bg-white p-5 last:border-b-0 md:grid-cols-[220px_1fr]">
                    <p className="font-bold text-slate-950">{item.role}</p>
                    <p className="text-sm leading-6 text-slate-600">{item.access}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="bg-slate-950 py-16 text-white md:py-20">
          <div className="mx-auto grid w-[90vw] max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <HelpCircle className="h-6 w-6 text-rose-300" />
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight md:text-4xl">Common questions</h2>
              <p className="mt-4 text-base leading-7 text-white/60">
                Clear answers to the questions members and visitors most often ask about this topic.
              </p>
            </div>

            <div className="space-y-4">
              {page.faq.map((item) => (
                <div key={item.question} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <h3 className="font-bold text-white">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto flex w-[90vw] max-w-7xl flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Ready to continue?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Open the right action for this page and continue through the real Connect Love flow.
              </p>
            </div>
            <Link
              href={page.cta.href}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-rose-600"
            >
              {page.cta.label}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
