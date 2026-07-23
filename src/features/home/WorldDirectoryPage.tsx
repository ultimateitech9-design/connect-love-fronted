import Link from "next/link";
import { Earth, Heart, MapPin } from "lucide-react";
import { Footer } from "@/features/home/Footer";
import { Navbar } from "@/features/home/Navbar";
import {
  type WorldCity,
  type WorldCountry,
  worldCityPath,
  worldCountryPath,
  WORLD_CITIES_DATA,
} from "@/lib/worldCities";

type WorldDirectoryPageProps =
  | {
      mode: "countries";
      title: string;
      description: string;
      countries: WorldCountry[];
    }
  | {
      mode: "cities";
      title: string;
      description: string;
      country: WorldCountry;
      cities: WorldCity[];
    };

export function WorldDirectoryPage(props: WorldDirectoryPageProps) {
  return (
    <div className="min-h-screen bg-white text-slate-950 dark:bg-[#090910] dark:text-white">
      <Navbar />
      <main className="pt-20">
        <section className="bg-gradient-to-br from-[#080b20] via-[#23103b] to-[#090910] py-20 text-white">
          <div className="mx-auto w-[90vw] max-w-7xl">
            <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap gap-2 text-sm text-rose-100/70">
              <Link href="/" className="hover:text-white">Home</Link>
              <span aria-hidden="true">/</span>
              <Link href="/dating" className="hover:text-white">Dating locations</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">
                {props.mode === "countries" ? "Worldwide" : props.country.name}
              </span>
            </nav>
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
              <Earth className="h-4 w-4" />
              ConnectLove worldwide
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-tight sm:text-6xl">
              {props.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-200">
              {props.description}
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto w-[90vw] max-w-7xl">
            {props.mode === "countries" ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {props.countries.map((country) => (
                  <Link
                    key={country.code}
                    href={worldCountryPath(country)}
                    className="group flex min-h-28 items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-violet-400/40"
                  >
                    <span>
                      <span className="block text-lg font-bold">{country.name}</span>
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                        {country.cityCount.toLocaleString("en-IN")} cities · Top: {country.topCity}
                      </span>
                    </span>
                    <Earth className="h-5 w-5 shrink-0 text-violet-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {props.cities.map((city) => (
                  <Link
                    key={city.id}
                    href={worldCityPath(city)}
                    className="group flex min-h-28 items-center justify-between rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-rose-300 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-rose-400/40"
                  >
                    <span>
                      <span className="block text-lg font-bold">{city.name}</span>
                      <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                        {city.adminName || city.countryName}
                      </span>
                    </span>
                    <Heart className="h-5 w-5 shrink-0 text-rose-400 transition group-hover:fill-rose-400" />
                  </Link>
                ))}
              </div>
            )}

            <p className="mt-10 flex flex-wrap items-center gap-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4" />
              Location names and population ordering use{" "}
              <a
                href={WORLD_CITIES_DATA.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-rose-600 hover:underline dark:text-rose-300"
              >
                GeoNames
              </a>
              , licensed under{" "}
              <a
                href={WORLD_CITIES_DATA.licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-rose-600 hover:underline dark:text-rose-300"
              >
                CC BY 4.0
              </a>
              . Profile availability varies by location.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
