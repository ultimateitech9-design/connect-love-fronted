"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MapPin, Search } from "lucide-react";
import { Footer } from "@/features/home/Footer";
import { Navbar } from "@/features/home/Navbar";
import {
  datingLocationPath,
  type DatingLocation,
} from "@/lib/indiaLocations";

type LocationDirectoryPageProps = {
  title: string;
  description: string;
  locations: DatingLocation[];
};

export function LocationDirectoryPage({
  title,
  description,
  locations,
}: LocationDirectoryPageProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("en-IN");
  const filteredLocations = useMemo(() => {
    if (!normalizedQuery) return locations;
    return locations.filter((location) => {
      const haystack = `${location.name} ${location.stateName ?? ""} ${location.kind}`
        .toLocaleLowerCase("en-IN");
      return haystack.includes(normalizedQuery);
    });
  }, [locations, normalizedQuery]);

  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-[#090910] dark:text-white">
      <Navbar />
      <main className="pt-20">
        <section className="bg-gradient-to-br from-[#120719] via-[#2b0a36] to-[#090910] py-20 text-white">
          <div className="mx-auto w-[90vw] max-w-7xl">
            <Link href="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-rose-100/70 hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-200">
              <MapPin className="h-4 w-4" />
              India dating directory
            </span>
            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,400px)] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
                  {title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
                  {description}
                </p>
              </div>
              <label className="relative block">
                <span className="sr-only">Search city or state</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search city or state"
                  className="h-12 w-full rounded-2xl border border-white/15 bg-white/8 px-11 text-sm font-semibold text-white outline-none placeholder:text-slate-400 focus:border-rose-300 focus:bg-white/12"
                />
              </label>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto w-[90vw] max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {filteredLocations.length.toLocaleString("en-IN")} {filteredLocations.length === 1 ? "location" : "cities and locations"}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dating/state"
                  className="rounded-full border border-rose-200 px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-400/10"
                >
                  Browse states
                </Link>
                <Link
                  href="/dating/city"
                  className="rounded-full border border-rose-200 px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-400/10"
                >
                  Browse cities
                </Link>
                <Link
                  href="/dating/world"
                  className="rounded-full border border-violet-200 px-5 py-2.5 text-sm font-bold text-violet-600 hover:bg-violet-50 dark:border-violet-400/30 dark:text-violet-300 dark:hover:bg-violet-400/10"
                >
                  Worldwide cities
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredLocations.map((location) => (
                <Link
                  key={`${location.kind}-${location.slug}`}
                  href={datingLocationPath(location)}
                  className="group flex min-h-24 items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-rose-400/40"
                >
                  <span>
                    <span className="block text-lg font-bold">{location.name}</span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                      {location.kind === "city" && location.stateName
                        ? `${location.stateName} · City dating`
                        : "State dating"}
                    </span>
                  </span>
                  <Heart className="h-5 w-5 shrink-0 text-rose-400 transition group-hover:fill-rose-400" />
                </Link>
              ))}
            </div>
            {filteredLocations.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                No city found for "{query}".
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
