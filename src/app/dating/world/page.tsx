import type { Metadata } from "next";
import { WorldDirectoryPage } from "@/features/home/WorldDirectoryPage";
import { createPublicMetadata } from "@/lib/seo";
import { WORLD_CITIES, WORLD_COUNTRIES } from "@/lib/worldCities";

export const metadata: Metadata = createPublicMetadata({
  title: "Worldwide Dating Locations – Meet Global Singles",
  description:
    "Browse ConnectLove dating locations across 168 countries and 5,000 international cities. Discover local singles, meaningful relationships and safer dating guidance.",
  path: "/dating/world",
  keywordScope: "global",
  keywords: [
    "worldwide dating",
    "international dating app",
    "global singles",
    "love connection worldwide",
    "lover near me",
    "dating cities worldwide",
  ],
});

export default function WorldwideDatingPage() {
  return (
    <WorldDirectoryPage
      mode="countries"
      title="Dating locations around the world"
      description={`ConnectLove is available worldwide. Browse ${WORLD_CITIES.length.toLocaleString("en-IN")} listed cities across ${WORLD_COUNTRIES.length.toLocaleString("en-IN")} countries, then explore local dating guidance and available profiles.`}
      countries={WORLD_COUNTRIES}
    />
  );
}
