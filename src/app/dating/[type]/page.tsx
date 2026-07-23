import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationDirectoryPage } from "@/features/home/LocationDirectoryPage";
import { INDIA_CITIES, INDIA_STATES } from "@/lib/indiaLocations";
import { createPublicMetadata } from "@/lib/seo";

type LocationTypePageProps = {
  params: Promise<{ type: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ type: "city" }, { type: "state" }];
}

export async function generateMetadata({
  params,
}: LocationTypePageProps): Promise<Metadata> {
  const { type } = await params;
  if (type !== "city" && type !== "state") return {};
  const plural = type === "city" ? "Cities" : "States";

  return createPublicMetadata({
    title: `Dating by Indian ${plural} – Find Singles Near You`,
    description: `Browse ConnectLove dating pages for Indian ${plural.toLowerCase()}. Find local singles, a genuine love connection and compatible people near you.`,
    path: `/dating/${type}`,
    keywords: [
      `${type} dating India`,
      "love connection",
      "lover near me",
      "singles near me",
      "online dating India",
    ],
  });
}

export default async function LocationTypePage({
  params,
}: LocationTypePageProps) {
  const { type } = await params;
  if (type !== "city" && type !== "state") notFound();

  const isCity = type === "city";
  return (
    <LocationDirectoryPage
      title={isCity ? "Dating in Indian cities" : "Dating across Indian states"}
      description={
        isCity
          ? "Choose a city to explore local dating, compatible singles and meaningful relationship opportunities near you."
          : "Choose an Indian state or union territory to explore local singles and intentional online dating."
      }
      locations={isCity ? INDIA_CITIES : INDIA_STATES}
    />
  );
}
