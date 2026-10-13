import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { LocationLandingPage } from "@/features/home/LocationLandingPage";
import {
  type DatingLocation,
  datingLocationPath,
  getDatingLocation,
  getIndiaCityFacts,
  getRelatedDatingLocations,
  INDIA_CITY_REDIRECTS,
  INDIA_DATING_LOCATIONS,
} from "@/lib/indiaLocations";
import { createPublicMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

type LocationPageProps = {
  params: Promise<{ type: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...INDIA_DATING_LOCATIONS.map((location) => ({
      type: location.kind,
      slug: location.slug,
    })),
    // Old names / spelling variants: rendered only as permanent redirects.
    ...[...INDIA_CITY_REDIRECTS.keys()].map((slug) => ({ type: "city", slug })),
  ];
}

function resolveLocation(type: string, slug: string) {
  const alias = type === "city" ? INDIA_CITY_REDIRECTS.get(slug) : undefined;
  if (alias) permanentRedirect(datingLocationPath(alias));
  return getDatingLocation(type, slug);
}

function locationDescription(location: DatingLocation, placeContext: string) {
  const geo = location.geo;
  if (location.kind === "city" && geo && !geo.area && geo.population > 0) {
    const district = geo.district && geo.district !== location.name ? ` in ${geo.district} district` : "";
    return `Meet genuine singles in ${location.name}${district}, ${location.stateName} – a city of about ${geo.population.toLocaleString("en-IN")} people. Find a local love connection on ConnectLove with privacy and safety tools.`;
  }
  return `Meet genuine singles in ${placeContext} on ConnectLove. Find a local love connection, discover compatible people near you and date with privacy and safety tools.`;
}

export async function generateMetadata({
  params,
}: LocationPageProps): Promise<Metadata> {
  const { type, slug } = await params;
  const location = resolveLocation(type, slug);
  if (!location) return {};

  const placeContext =
    location.kind === "city" && location.stateName
      ? `${location.name}, ${location.stateName}`
      : location.name;
  const path = datingLocationPath(location);

  return createPublicMetadata({
    title:
      location.kind === "city" && location.stateName
        ? `Dating in ${location.name}, ${location.stateName} – Meet Singles Near You`
        : `Dating in ${location.name} – Meet Singles Near You`,
    description: locationDescription(location, placeContext),
    path,
    keywords: [
      `dating in ${location.name}`,
      `dating app ${location.name}`,
      `singles in ${location.name}`,
      `meet singles ${location.name}`,
      `love connection ${location.name}`,
      `lover near me ${location.name}`,
      `find love near me ${location.name}`,
      `online dating ${placeContext}`,
    ],
  });
}

export default async function DatingLocationPage({
  params,
}: LocationPageProps) {
  const { type, slug } = await params;
  const location = resolveLocation(type, slug);
  if (!location) notFound();

  const relatedLocations = getRelatedDatingLocations(location);
  const facts = location.kind === "city" ? getIndiaCityFacts(location) : undefined;
  const nearbyCities = relatedLocations.filter((related) => related.distanceKm !== undefined);
  const canonicalPath = datingLocationPath(location);
  const canonicalUrl = new URL(canonicalPath, SITE_URL).toString();
  const placeContext =
    location.kind === "city" && location.stateName
      ? `${location.name}, ${location.stateName}`
      : location.name;
  const faq = [
    {
      question: `How can I meet singles in ${location.name}?`,
      answer: `Create a complete ConnectLove profile, set honest relationship goals and use discovery preferences to explore available profiles around ${placeContext}.`,
    },
    ...(nearbyCities.length
      ? [
          {
            question: `Which places are near ${location.name}?`,
            answer: `The closest locations to ${location.name} on ConnectLove are ${nearbyCities
              .slice(0, 4)
              .map((city) => `${city.name} (${city.distanceKm} km)`)
              .join(", ")}. You can widen your discovery distance to include people there.`,
          },
        ]
      : []),
    {
      question: `Can ConnectLove guarantee a match in ${location.name}?`,
      answer:
        "No. Profile availability and compatibility vary. ConnectLove provides discovery, matching, privacy and communication tools but cannot guarantee a relationship.",
    },
    {
      question: `How can I date more safely in ${location.name}?`,
      answer:
        "Protect personal and financial information, review verification signals, keep early conversations on-platform, meet in a public place and report suspicious behaviour.",
    },
  ];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Dating in ${location.name}`,
      description: `Meet singles and find meaningful relationships in ${placeContext}.`,
      url: canonicalUrl,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
      about: {
        "@type": location.kind === "city" ? "City" : "State",
        name: placeContext,
        ...(location.geo
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: location.geo.latitude,
                longitude: location.geo.longitude,
              },
            }
          : {}),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: `${location.kind === "city" ? "City" : "State"} dating`,
          item: `${SITE_URL}/dating/${location.kind}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: location.name,
          item: canonicalUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <LocationLandingPage
        location={location}
        relatedLocations={relatedLocations}
        facts={facts}
      />
    </>
  );
}
