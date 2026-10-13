import Link from "next/link";
import {
  ArrowRight,
  Earth,
  Heart,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "@/features/home/Footer";
import { Navbar } from "@/features/home/Navbar";
import {
  type NearbyWorldCity,
  type WorldCity,
  type WorldCityFacts,
  WORLD_CITIES_DATA,
  worldCityPath,
  worldCountryPath,
} from "@/lib/worldCities";

type WorldCityLandingPageProps = {
  city: WorldCity;
  nearbyCities: NearbyWorldCity[];
  facts: WorldCityFacts;
};

function cityScale(population: number) {
  if (population >= 5_000_000) return "major global city";
  if (population >= 1_000_000) return "large metropolitan area";
  if (population >= 500_000) return "growing urban centre";
  return "regional city";
}

const formatNumber = (value: number) => value.toLocaleString("en-US");

function ordinal(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  return `${value}${["th", "st", "nd", "rd"][value % 10] ?? "th"}`;
}

function cityFactSentences(city: WorldCity, facts: WorldCityFacts, nearby: NearbyWorldCity[]) {
  const sentences: string[] = [];
  sentences.push(
    facts.countryRank === 1
      ? `${city.name} is the most populous place in ${city.countryName} in our directory, with about ${formatNumber(city.population)} residents.`
      : `With about ${formatNumber(city.population)} residents, ${city.name} is the ${ordinal(facts.countryRank)} largest of the ${formatNumber(facts.countryCityCount)} ${city.countryName} cities listed on ConnectLove.`,
  );
  if (city.adminName && facts.regionCityCount > 1) {
    sentences.push(
      facts.regionRank === 1
        ? `It is the largest listed city in ${city.adminName}, which has ${facts.regionCityCount} cities in this directory.`
        : `Within ${city.adminName} it ranks ${ordinal(facts.regionRank)} by population among ${facts.regionCityCount} listed cities.`,
    );
  }
  if (facts.countryRank !== 1) {
    sentences.push(
      `${facts.largestInCountry.name}, the largest listed city in ${city.countryName}, is roughly ${formatNumber(facts.distanceToLargestKm)} km away.`,
    );
  }
  if (facts.nearestLarger && facts.nearestLarger.id !== facts.largestInCountry.id) {
    sentences.push(
      `The nearest larger city is ${facts.nearestLarger.name}${facts.nearestLarger.countryCode !== city.countryCode ? ` in ${facts.nearestLarger.countryName}` : ""}, about ${formatNumber(facts.nearestLarger.distanceKm)} km away.`,
    );
  }
  const closest = nearby[0];
  const alreadyMentioned = [facts.largestInCountry.id, facts.nearestLarger?.id];
  if (closest && !alreadyMentioned.includes(closest.id)) {
    sentences.push(
      `The closest listed city is ${closest.name}${closest.countryCode !== city.countryCode ? `, ${closest.countryName}` : ""} at around ${formatNumber(closest.distanceKm)} km, so a wider discovery distance can include people there too.`,
    );
  }
  sentences.push(
    `${city.name} sits at ${Math.abs(city.latitude).toFixed(2)}°${city.latitude >= 0 ? "N" : "S"}, ${Math.abs(city.longitude).toFixed(2)}°${city.longitude >= 0 ? "E" : "W"}, in the ${facts.hemisphere}.`,
  );
  return sentences;
}

export function WorldCityLandingPage({
  city,
  nearbyCities,
  facts,
}: WorldCityLandingPageProps) {
  const area = city.adminName
    ? `${city.name}, ${city.adminName}, ${city.countryName}`
    : `${city.name}, ${city.countryName}`;
  const scale = cityScale(city.population);
  const factSentences = cityFactSentences(city, facts, nearbyCities);

  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-[#090910] dark:text-white">
      <Navbar />
      <main className="pt-20">
        <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_80%_20%,#4c1d95_0%,#1f1235_35%,#080b18_75%)] py-20 text-white">
          <div className="absolute -left-20 top-12 h-80 w-80 rounded-full bg-rose-500/15 blur-3xl" />
          <div className="relative mx-auto w-[90vw] max-w-7xl">
            <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-2 text-sm text-violet-100/75">
              <Link href="/" className="hover:text-white">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/dating/world" className="hover:text-white">Worldwide</Link>
              <span aria-hidden="true">/</span>
              <Link href={worldCountryPath({ slug: city.countrySlug })} className="hover:text-white">
                {city.countryName}
              </Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{city.name}</span>
            </nav>

            <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
              <MapPin className="h-4 w-4" />
              Dating in {area}
            </span>
            <h1 className="mt-6 max-w-5xl text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Meet local singles and find a{" "}
              <span className="bg-gradient-to-r from-rose-300 via-pink-400 to-violet-300 bg-clip-text text-transparent">
                love connection
              </span>{" "}
              in {city.name}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">
              ConnectLove is available worldwide for adults seeking friendship,
              companionship and meaningful relationships. Discover people around {area},
              communicate at your own pace and use privacy and safety tools throughout the journey.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-7 py-3 font-bold text-white shadow-xl shadow-rose-500/25 transition hover:scale-[1.03]"
              >
                Find people near me
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/safety"
                className="inline-flex min-h-12 items-center rounded-full border border-white/20 bg-white/10 px-7 py-3 font-semibold backdrop-blur-sm hover:bg-white/15"
              >
                Dating safety guide
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto grid w-[90vw] max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-7 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500 text-white">
                <Earth className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-2xl font-black">About this location</h2>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">City</dt>
                  <dd className="mt-1 font-bold">{city.name}</dd>
                </div>
                {city.adminName ? (
                  <div>
                    <dt className="text-slate-500 dark:text-slate-400">Region</dt>
                    <dd className="mt-1 font-bold">{city.adminName}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Country</dt>
                  <dd className="mt-1 font-bold">{city.countryName}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Population</dt>
                  <dd className="mt-1 font-bold">About {formatNumber(city.population)}</dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Size in {city.countryName}</dt>
                  <dd className="mt-1 font-bold">
                    {ordinal(facts.countryRank)} of {formatNumber(facts.countryCityCount)} listed cities
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400">Location context</dt>
                  <dd className="mt-1 font-bold capitalize">{scale}</dd>
                </div>
              </dl>
              <p className="mt-6 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Population and geographic labels are used only to organise this worldwide
                directory. ConnectLove does not claim a fixed number of profiles in any city;
                availability changes with active members and their visibility settings.
              </p>
            </aside>

            <div className="space-y-8">
            <article className="rounded-3xl border border-slate-200 p-7 sm:p-9 dark:border-white/10">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-rose-500">
                Local context
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                {city.name} at a glance
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                {factSentences.join(" ")}
              </p>
            </article>

            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50 py-12 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="mx-auto flex w-[90vw] max-w-4xl flex-col gap-5 sm:flex-row sm:items-start">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-tight">
                Meeting people in {city.name}
              </h2>
              <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
                Build an honest profile, match with people whose goals fit yours and keep early
                conversations on ConnectLove. When you decide to meet, choose a busy public place
                and follow local guidance in {city.countryName}. See{" "}
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

        <section className="border-t border-slate-200 bg-slate-50 py-16 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="mx-auto w-[90vw] max-w-7xl">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-rose-500">
                  More in {city.countryName}
                </span>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                  Cities closest to {city.name}
                </h2>
              </div>
              <Link href={worldCountryPath({ slug: city.countrySlug })} className="font-bold text-rose-600 hover:text-rose-500">
                View all listed cities →
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {nearbyCities.map((related) => (
                <Link
                  key={related.id}
                  href={worldCityPath(related)}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 hover:border-rose-300 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <span>
                    <span className="block font-bold">{related.name}</span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                      {related.countryCode === city.countryCode
                        ? related.adminName || related.countryName
                        : related.countryName}{" "}
                      · {formatNumber(related.distanceKm)} km away
                    </span>
                  </span>
                  <Heart className="h-5 w-5 text-rose-400" />
                </Link>
              ))}
            </div>
            <p className="mt-9 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Location data attribution:{" "}
              <a href={WORLD_CITIES_DATA.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-rose-600 hover:underline dark:text-rose-300">
                GeoNames
              </a>{" "}
              under{" "}
              <a href={WORLD_CITIES_DATA.licenseUrl} target="_blank" rel="noreferrer" className="font-semibold text-rose-600 hover:underline dark:text-rose-300">
                Creative Commons Attribution 4.0
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
