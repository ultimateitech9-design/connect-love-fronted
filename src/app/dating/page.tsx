import type { Metadata } from "next";
import { LocationDirectoryPage } from "@/features/home/LocationDirectoryPage";
import { INDIA_DATING_LOCATIONS } from "@/lib/indiaLocations";
import { createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: "Dating Locations in India – Meet Singles Near You",
  description:
    "Browse ConnectLove dating pages for Indian states and cities. Meet local singles, find a love connection near you and explore safer online dating.",
  path: "/dating",
  keywords: [
    "dating locations India",
    "love connection",
    "lover near me",
    "singles near me",
    "local dating India",
  ],
});

export default function DatingDirectoryPage() {
  return (
    <LocationDirectoryPage
      title="Meet singles across Indian cities and states"
      description="Explore local dating pages for Indian cities, states and union territories. Find people near you while keeping compatibility, relationship intent, privacy and safety in focus."
      locations={INDIA_DATING_LOCATIONS}
    />
  );
}
