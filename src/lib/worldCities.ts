import worldCitiesData from "@/data/world-cities.json";

export type WorldCity = {
  id: number;
  name: string;
  slug: string;
  countryCode: string;
  countryName: string;
  countrySlug: string;
  continent: string;
  adminName: string;
  adminSlug: string;
  population: number;
  latitude: number;
  longitude: number;
  rank: number;
};

export type WorldCountry = {
  code: string;
  name: string;
  slug: string;
  continent: string;
  cityCount: number;
  topCity: string;
};

type WorldCitiesData = {
  source: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  generatedAt: string;
  selection: string;
  cities: WorldCity[];
};

export const WORLD_CITIES_DATA = worldCitiesData as WorldCitiesData;
export const WORLD_CITIES = WORLD_CITIES_DATA.cities;
// Every city in the published dataset has a dedicated, canonical landing page.
// Keep the complete set eligible for indexing so valid location URLs do not
// receive a noindex directive merely because of their dataset rank.
export const INDEXABLE_WORLD_CITY_COUNT = Number.POSITIVE_INFINITY;

const countryMap = new Map<string, WorldCountry>();
for (const city of WORLD_CITIES) {
  const country = countryMap.get(city.countrySlug);
  if (country) {
    country.cityCount += 1;
  } else {
    countryMap.set(city.countrySlug, {
      code: city.countryCode,
      name: city.countryName,
      slug: city.countrySlug,
      continent: city.continent,
      cityCount: 1,
      topCity: city.name,
    });
  }
}

export const WORLD_COUNTRIES = [...countryMap.values()].sort((a, b) =>
  a.name.localeCompare(b.name),
);

export function worldCountryPath(country: Pick<WorldCountry, "slug">) {
  return `/dating/world/${country.slug}`;
}

export function worldCityPath(
  city: Pick<WorldCity, "countrySlug" | "slug">,
) {
  return `/dating/world/${city.countrySlug}/${city.slug}`;
}

export function getWorldCountry(countrySlug: string) {
  return WORLD_COUNTRIES.find((country) => country.slug === countrySlug);
}

export function getWorldCitiesForCountry(countrySlug: string) {
  return WORLD_CITIES.filter((city) => city.countrySlug === countrySlug);
}

export function getWorldCity(countrySlug: string, citySlug: string) {
  return WORLD_CITIES.find(
    (city) => city.countrySlug === countrySlug && city.slug === citySlug,
  );
}

export function isWorldCityIndexable(city: WorldCity) {
  return city.rank <= INDEXABLE_WORLD_CITY_COUNT;
}

export function getRelatedWorldCities(city: WorldCity, limit = 8) {
  return WORLD_CITIES.filter(
    (candidate) =>
      candidate.countryCode === city.countryCode && candidate.id !== city.id,
  ).slice(0, limit);
}

export type NearbyWorldCity = WorldCity & { distanceKm: number };

export type WorldCityFacts = {
  countryRank: number;
  countryCityCount: number;
  regionRank: number;
  regionCityCount: number;
  largestInCountry: WorldCity;
  distanceToLargestKm: number;
  nearestLarger?: NearbyWorldCity;
  hemisphere: string;
};

function distanceKm(a: WorldCity, b: WorldCity) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)));
}

// Closest listed cities by great-circle distance, across borders. Unlike the
// country top list, this differs for every city, so each page links to its
// real neighbours and every city receives internal links from nearby pages.
export function getNearbyWorldCities(city: WorldCity, limit = 8): NearbyWorldCity[] {
  return WORLD_CITIES.filter((candidate) => candidate.id !== city.id)
    .map((candidate) => ({ ...candidate, distanceKm: distanceKm(city, candidate) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

// Factual context derived from the GeoNames dataset (WORLD_CITIES is sorted by
// population, so list order is population rank).
export function getWorldCityFacts(city: WorldCity): WorldCityFacts {
  const countryCities = getWorldCitiesForCountry(city.countrySlug);
  const regionCities = city.adminName
    ? countryCities.filter((candidate) => candidate.adminName === city.adminName)
    : [city];
  const largestInCountry = countryCities[0];
  const nearestLarger = WORLD_CITIES.filter((candidate) => candidate.population > city.population)
    .map((candidate) => ({ ...candidate, distanceKm: distanceKm(city, candidate) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0];

  return {
    countryRank: countryCities.indexOf(city) + 1,
    countryCityCount: countryCities.length,
    regionRank: regionCities.indexOf(city) + 1,
    regionCityCount: regionCities.length,
    largestInCountry,
    distanceToLargestKm: distanceKm(city, largestInCountry),
    nearestLarger,
    hemisphere: `${city.latitude >= 0 ? "Northern" : "Southern"} and ${city.longitude >= 0 ? "Eastern" : "Western"} hemispheres`,
  };
}
