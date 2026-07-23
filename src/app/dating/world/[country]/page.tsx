import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldDirectoryPage } from "@/features/home/WorldDirectoryPage";
import { createPublicMetadata } from "@/lib/seo";
import {
  getWorldCitiesForCountry,
  getWorldCountry,
  WORLD_COUNTRIES,
} from "@/lib/worldCities";

type WorldCountryPageProps = {
  params: Promise<{ country: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return WORLD_COUNTRIES.map((country) => ({ country: country.slug }));
}

export async function generateMetadata({
  params,
}: WorldCountryPageProps): Promise<Metadata> {
  const { country: countrySlug } = await params;
  const country = getWorldCountry(countrySlug);
  if (!country) return {};

  return createPublicMetadata({
    title: `Dating in ${country.name} – Meet Local Singles`,
    description: `Explore ConnectLove dating locations in ${country.name}. Browse listed cities, meet compatible local singles and use privacy and safer dating tools.`,
    path: `/dating/world/${country.slug}`,
    keywordScope: "global",
    keywords: [
      `dating in ${country.name}`,
      `dating app ${country.name}`,
      `singles in ${country.name}`,
      `love connection ${country.name}`,
      `lover near me ${country.name}`,
      `online dating ${country.name}`,
    ],
  });
}

export default async function WorldCountryPage({
  params,
}: WorldCountryPageProps) {
  const { country: countrySlug } = await params;
  const country = getWorldCountry(countrySlug);
  if (!country) notFound();
  const cities = getWorldCitiesForCountry(country.slug);

  return (
    <WorldDirectoryPage
      mode="cities"
      title={`Meet singles across ${country.name}`}
      description={`Browse ${cities.length.toLocaleString("en-IN")} listed ConnectLove city locations in ${country.name}. Profile availability changes as members join, travel and update their visibility settings.`}
      country={country}
      cities={cities}
    />
  );
}
