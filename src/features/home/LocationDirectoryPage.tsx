import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
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
  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-[#090910] dark:text-white">
      <Navbar />
      <main className="pt-20">
        <section className="bg-gradient-to-br from-[#120719] via-[#2b0a36] to-[#090910] py-20 text-white">
          <div className="mx-auto w-[90vw] max-w-7xl">
            <nav aria-label="Breadcrumb" className="mb-5 text-sm text-rose-100/70">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span aria-current="page">Dating locations</span>
            </nav>
            <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-rose-200">
              <MapPin className="h-4 w-4" />
              India dating directory
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
              {description}
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto w-[90vw] max-w-7xl">
            <div className="mb-8 flex flex-wrap gap-3">
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

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {locations.map((location) => (
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
