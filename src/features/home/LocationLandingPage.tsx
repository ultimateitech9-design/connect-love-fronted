import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Footer } from "@/features/home/Footer";
import { Navbar } from "@/features/home/Navbar";
import {
  datingLocationPath,
  type DatingLocation,
} from "@/lib/indiaLocations";

type LocationLandingPageProps = {
  location: DatingLocation;
  relatedLocations: DatingLocation[];
};

const steps = [
  {
    icon: UsersRound,
    title: "Create your profile",
    text: "Share your interests, values, lifestyle and the kind of relationship you want.",
  },
  {
    icon: Sparkles,
    title: "Discover compatible people",
    text: "Explore profiles using preferences, location signals and relationship intent.",
  },
  {
    icon: ShieldCheck,
    title: "Connect more safely",
    text: "Use verification signals, mutual matches, privacy controls, block and report tools.",
  },
];

export function LocationLandingPage({
  location,
  relatedLocations,
}: LocationLandingPageProps) {
  const placeContext =
    location.kind === "city" && location.stateName
      ? `${location.name}, ${location.stateName}`
      : location.name;

  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-[#090910] dark:text-white">
      <Navbar />

      <main className="pt-20">
        <section className="relative isolate overflow-hidden bg-[#0b0612] text-white">
          <Image
            src="/hero-couple.webp"
            alt={`Singles looking for meaningful relationships in ${placeContext}`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,6,18,.96)_0%,rgba(11,6,18,.78)_48%,rgba(11,6,18,.42)_100%)]" />

          <div className="relative mx-auto flex min-h-[560px] w-[90vw] max-w-7xl items-center py-16">
            <div className="max-w-3xl">
              <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-rose-100/75">
                <Link href="/" className="hover:text-white">Home</Link>
                <span aria-hidden="true">/</span>
                <span className="capitalize">{location.kind}</span>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{location.name}</span>
              </nav>

              <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-200">
                <MapPin className="h-4 w-4" />
                Dating in {placeContext}
              </span>
              <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
                Meet singles and find a{" "}
                <span className="bg-gradient-to-r from-rose-300 to-pink-500 bg-clip-text text-transparent">
                  love connection
                </span>{" "}
                in {location.name}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
                Looking for a lover near you in {placeContext}? ConnectLove helps adults discover
                genuine singles for friendship, companionship and meaningful relationships with
                privacy and safety tools close at hand.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-7 py-3 font-bold text-white shadow-xl shadow-rose-500/25 transition hover:scale-[1.03]"
                >
                  Find matches near me
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/safety"
                  className="inline-flex min-h-12 items-center rounded-full border border-white/20 bg-white/10 px-7 py-3 font-semibold text-white backdrop-blur-sm hover:bg-white/15"
                >
                  Read safety tips
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 dark:bg-[#090910]">
          <div className="mx-auto w-[90vw] max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-rose-500">
                Local dating, clearer intent
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                How ConnectLove helps you meet people in {location.name}
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
                Location is one part of a good match. Interests, values, relationship goals,
                lifestyle and respectful communication also matter.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {steps.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-3xl border border-rose-100 bg-rose-50/40 p-7 shadow-sm dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-16 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="mx-auto grid w-[90vw] max-w-7xl items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-3xl font-black tracking-tight">
                Safer dating in {location.name}
              </h2>
              <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">
                No dating platform can guarantee another person&apos;s identity or intentions.
                Review profiles carefully, keep early conversations on-platform, avoid sending
                money and meet in a populated public place when you are ready.
              </p>
            </div>
            <ul className="space-y-4">
              {[
                "Look for complete profiles and verification signals.",
                "Never share OTPs, passwords or financial information.",
                "Tell someone you trust before meeting in person.",
                "Block and report suspicious or disrespectful behaviour.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-slate-700 dark:text-slate-200">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white py-16 dark:bg-[#090910]">
          <div className="mx-auto w-[90vw] max-w-7xl">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-rose-500">
                  Explore nearby
                </span>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  More dating locations
                </h2>
              </div>
              <Link href="/register" className="font-bold text-rose-600 hover:text-rose-500">
                Join ConnectLove →
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {relatedLocations.map((related) => (
                <Link
                  key={`${related.kind}-${related.slug}`}
                  href={datingLocationPath(related)}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-lg dark:border-white/10 dark:hover:border-rose-400/40"
                >
                  <span>
                    <span className="block font-bold">{related.name}</span>
                    <span className="mt-1 block text-xs capitalize text-slate-500 dark:text-slate-400">
                      {related.kind} dating
                    </span>
                  </span>
                  <Heart className="h-5 w-5 text-rose-400 transition group-hover:fill-rose-400" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
