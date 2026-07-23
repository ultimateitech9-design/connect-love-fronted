import Link from "next/link";
import { ArrowRight, HeartHandshake, ShieldCheck, UserCheck } from "lucide-react";

const guides = [
  {
    icon: UserCheck,
    title: "Verified profiles and safer connections",
    body: "Profile details, photo checks, privacy controls, and optional verification signals help members make more informed choices before connecting.",
    href: "/safety",
    label: "Read the safety guide",
  },
  {
    icon: HeartHandshake,
    title: "Compatibility-led matchmaking",
    body: "Relationship goals, interests, values, lifestyle, and location provide useful context for discovering Indian singles seeking meaningful relationships.",
    href: "/features",
    label: "Explore matching features",
  },
  {
    icon: ShieldCheck,
    title: "Practical relationship advice",
    body: "Clear guidance covers authentic profiles, respectful conversations, scam awareness, healthy boundaries, and safer first-date planning.",
    href: "/blog",
    label: "Browse dating guides",
  },
];

const faqs = [
  {
    question: "Is ConnectLove free to join?",
    answer:
      "Yes. The Free plan includes profile creation, basic messaging, safety tools, and up to five matches per day. Optional Gold and Diamond plans add premium features.",
  },
  {
    question: "Is ConnectLove designed for serious relationships?",
    answer:
      "ConnectLove supports friendship, companionship, dating, and long-term relationship goals. Members can describe their intentions and use compatibility details to make informed choices.",
  },
  {
    question: "How does profile verification work?",
    answer:
      "Members can complete profile and photo checks, while eligible verification flows may add stronger trust signals. A badge is helpful context, but everyone should still follow online dating safety practices.",
  },
  {
    question: "How can I stay safe while dating online?",
    answer:
      "Keep early conversations on-platform, protect passwords and financial details, never send money, meet in a public place, tell someone you trust, and report suspicious or unwanted behavior.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export function HomeSeoContent() {
  return (
    <section
      aria-labelledby="dating-guide-title"
      className="border-b border-slate-100 bg-white py-16 dark:border-white/10 dark:bg-[#0d0d15] sm:py-20"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto w-[90vw] max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700 dark:text-rose-300">Dating in India</p>
          <h2
            id="dating-guide-title"
            className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl"
          >
            Safe online dating and matchmaking for meaningful relationships
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
            ConnectLove helps adults meet compatible Indian singles through intentional profiles, clearer
            relationship goals, privacy controls, and practical safety guidance.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {guides.map(({ icon: Icon, ...guide }) => (
            <article
              key={guide.title}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">{guide.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{guide.body}</p>
              <Link
                href={guide.href}
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-rose-700 hover:text-rose-800 dark:text-rose-300"
              >
                {guide.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700 dark:text-rose-300">Common questions</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Before you start matching
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Learn more in our{" "}
              <Link href="/help-center" className="font-bold text-rose-700 hover:underline dark:text-rose-300">
                Help Center
              </Link>{" "}
              or contact the support team if your question is account-specific.
            </p>
          </div>

          <div className="divide-y divide-slate-200 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.03]">
            {faqs.map((item) => (
              <details key={item.question} className="group p-5 open:bg-rose-50/50 dark:open:bg-rose-500/[0.06]">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900 dark:text-white">
                  {item.question}
                  <span className="text-xl text-rose-500 transition group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="pr-8 pt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
