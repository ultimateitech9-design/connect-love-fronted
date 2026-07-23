import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationLandingPage } from "@/features/home/LocationLandingPage";
import {
  datingLocationPath,
  getDatingLocation,
  getRelatedDatingLocations,
  INDIA_DATING_LOCATIONS,
} from "@/lib/indiaLocations";
import { createPublicMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";

type LocationPageProps = {
  params: Promise<{ type: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return INDIA_DATING_LOCATIONS.map((location) => ({
    type: location.kind,
    slug: location.slug,
  }));
}

export async function generateMetadata({
  params,
}: LocationPageProps): Promise<Metadata> {
  const { type, slug } = await params;
  const location = getDatingLocation(type, slug);
  if (!location) return {};

  const placeContext =
    location.kind === "city" && location.stateName
      ? `${location.name}, ${location.stateName}`
      : location.name;
  const path = datingLocationPath(location);

  return createPublicMetadata({
    title: `Dating in ${location.name} – Meet Singles Near You`,
    description: `Meet genuine singles in ${placeContext} on ConnectLove. Find a local love connection, discover compatible people near you and date with privacy and safety tools.`,
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
  const location = getDatingLocation(type, slug);
  if (!location) notFound();

  const relatedLocations = getRelatedDatingLocations(location);
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
        "@type": "Place",
        name: placeContext,
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
      />
    </>
  );
}
