import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "@/features/home/Footer";
import { Navbar } from "@/features/home/Navbar";
import {
  datingLocationPath,
  type DatingLocation,
  type IndiaCityFacts,
  INDIA_CITY_GEO_DATA,
  type NearbyDatingLocation,
} from "@/lib/indiaLocations";

type LocationLandingPageProps = {
  location: DatingLocation;
  relatedLocations: NearbyDatingLocation[];
  facts?: IndiaCityFacts;
};


const formatNumber = (value: number) => value.toLocaleString("en-IN");

function ordinal(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  return `${value}${["th", "st", "nd", "rd"][value % 10] ?? "th"}`;
}

function cityFactSentences(location: DatingLocation, facts: IndiaCityFacts) {
  const geo = location.geo;
  if (!geo) return [];
  const sentences: string[] = [];
  const district = geo.district && geo.district !== location.name ? geo.district : "";

  if (geo.area) {
    sentences.push(
      `${location.name} is an administrative area in ${location.stateName}${geo.population > 0 ? ` with about ${formatNumber(geo.population)} residents across its towns and villages` : ""}.`,
    );
  } else if (geo.population > 0) {
    sentences.push(
      `${location.name}${district ? ` in ${district} district` : ""} has about ${formatNumber(geo.population)} residents${facts.stateRank ? `, making it the ${ordinal(facts.stateRank)} largest of the ${facts.stateTownCount} ${location.stateName} towns listed on ConnectLove` : ""}.`,
    );
  } else if (district) {
    sentences.push(`${location.name} is in ${district} district of ${location.stateName}.`);
  }

  if (facts.largestInState && facts.distanceToLargestKm !== undefined) {
    sentences.push(
      `${facts.largestInState.name}, the largest listed city in ${location.stateName}, is roughly ${formatNumber(facts.distanceToLargestKm)} km away.`,
    );
  }
  if (facts.nearestLarger && facts.nearestLarger.slug !== facts.largestInState?.slug) {
    sentences.push(
      `The nearest bigger city is ${facts.nearestLarger.name}${facts.nearestLarger.stateName !== location.stateName ? ` in ${facts.nearestLarger.stateName}` : ""}, about ${formatNumber(facts.nearestLarger.distanceKm ?? 0)} km away.`,
    );
  }
  if (facts.districtNeighbours.length) {
    sentences.push(
      `Other places in the same district include ${facts.districtNeighbours.map((city) => city.name).join(", ")}.`,
    );
  }
  sentences.push(
    `${location.name} sits at ${geo.latitude.toFixed(2)}°N, ${geo.longitude.toFixed(2)}°E.`,
  );
  return sentences;
}

export function LocationLandingPage({
  location,
  relatedLocations,
  facts,
}: LocationLandingPageProps) {
  const placeContext =
    location.kind === "city" && location.stateName
      ? `${location.name}, ${location.stateName}`
      : location.name;
  const factSentences = facts ? cityFactSentences(location, facts) : [];

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

        {factSentences.length ? (
          <section className="bg-white py-16 dark:bg-[#090910]">
            <div className="mx-auto w-[90vw] max-w-4xl">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-rose-500">
                Local context
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                {location.name} at a glance
              </h2>
              <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
                {factSentences.join(" ")}
              </p>
              {facts?.districtNeighbours.length ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {facts.districtNeighbours.map((city) => (
                    <Link
                      key={city.slug}
                      href={datingLocationPath(city)}
                      className="rounded-full border border-rose-200 px-4 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-400/10"
                    >
                      Dating in {city.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        <section className="border-y border-slate-200 bg-slate-50 py-12 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="mx-auto flex w-[90vw] max-w-4xl flex-col gap-5 sm:flex-row sm:items-start">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                Meeting people in {location.name}
              </h2>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                Build an honest profile, match with people whose goals fit yours and keep early
                conversations on ConnectLove. When you decide to meet, choose a busy public place
                and tell someone you trust. See{" "}
                <Link href="/features" className="font-semibold text-rose-600 hover:underline dark:text-rose-300">
                  how ConnectLove works
                </Link>{" "}
                and our{" "}
                <Link href="/safety" className="font-semibold text-rose-600 hover:underline dark:text-rose-300">
                  dating safety guide
                </Link>
                .
              </p>
            </div>
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
                  {location.kind === "state"
                    ? `All ${relatedLocations.length} cities in ${location.name}`
                    : `Places near ${location.name}`}
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
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                      {related.distanceKm !== undefined
                        ? `${related.stateName !== location.stateName ? `${related.stateName} · ` : ""}${formatNumber(related.distanceKm)} km away`
                        : related.kind === "state"
                          ? "State dating"
                          : "City dating"}
                    </span>
                  </span>
                  <Heart className="h-5 w-5 text-rose-400 transition group-hover:fill-rose-400" />
                </Link>
              ))}
            </div>
            {location.geo ? (
              <p className="mt-9 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Location data:{" "}
                <a href={INDIA_CITY_GEO_DATA.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-rose-600 hover:underline dark:text-rose-300">
                  GeoNames
                </a>{" "}
                under{" "}
                <a href={INDIA_CITY_GEO_DATA.licenseUrl} target="_blank" rel="noreferrer" className="font-semibold text-rose-600 hover:underline dark:text-rose-300">
                  Creative Commons Attribution 4.0
                </a>
                . Population figures are GeoNames estimates.
              </p>
            ) : null}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
