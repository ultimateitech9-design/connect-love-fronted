import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorldCityLandingPage } from "@/features/home/WorldCityLandingPage";
import { getCitySearchPhrases } from "@/lib/globalSearchPhrases";
import { createPublicMetadata, SITE_NAME, SITE_URL } from "@/lib/seo";
import {
  getRelatedWorldCities,
  getWorldCity,
  isWorldCityIndexable,
  WORLD_CITIES,
  worldCityPath,
} from "@/lib/worldCities";

type WorldCityPageProps = {
  params: Promise<{ country: string; city: string }>;
};

export const dynamicParams = true;
export const revalidate = 86_400;

export function generateStaticParams() {
  return WORLD_CITIES.filter(isWorldCityIndexable).map((city) => ({
    country: city.countrySlug,
    city: city.slug,
  }));
}

export async function generateMetadata({
  params,
}: WorldCityPageProps): Promise<Metadata> {
  const { country, city: citySlug } = await params;
  const city = getWorldCity(country, citySlug);
  if (!city) return {};

  const path = worldCityPath(city);
  const metadata = createPublicMetadata({
    title: `Dating in ${city.name}, ${city.countryName} – Meet Singles`,
    description: `Meet local singles in ${city.name}, ${city.countryName} on ConnectLove. Find a love connection, explore compatible people near you and date with privacy and safety tools.`,
    path,
    keywordScope: "global",
    keywords: getCitySearchPhrases(city.name, city.countryName, 12),
  });

  if (isWorldCityIndexable(city)) return metadata;

  return {
    ...metadata,
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function WorldCityPage({ params }: WorldCityPageProps) {
  const { country, city: citySlug } = await params;
  const city = getWorldCity(country, citySlug);
  if (!city) notFound();

  const canonicalUrl = new URL(worldCityPath(city), SITE_URL).toString();
  const relatedCities = getRelatedWorldCities(city);
  const faq = [
    {
      question: `How can I meet singles in ${city.name}?`,
      answer: `Create a complete ConnectLove profile, choose honest relationship preferences and explore available profiles around ${city.name}. Availability depends on active members and visibility settings.`,
    },
    {
      question: `Is ConnectLove available in ${city.countryName}?`,
      answer: `Yes. ConnectLove is available worldwide, including ${city.countryName}. Features and profile availability can vary by location, device and account status.`,
    },
    {
      question: `How can I date more safely in ${city.name}?`,
      answer:
        "Protect financial and account information, keep early conversations on-platform, be cautious about urgent money requests, meet in a populated public place and use locally appropriate safety resources.",
    },
  ];
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: `Dating in ${city.name}, ${city.countryName}`,
      url: canonicalUrl,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
      about: {
        "@type": "City",
        name: city.name,
        containedInPlace: {
          "@type": "Country",
          name: city.countryName,
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: city.latitude,
          longitude: city.longitude,
        },
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
          name: "Worldwide dating",
          item: `${SITE_URL}/dating/world`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: city.countryName,
          item: `${SITE_URL}/dating/world/${city.countrySlug}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: city.name,
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
      <WorldCityLandingPage city={city} relatedCities={relatedCities} />
    </>
  );
}
