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
export const INDEXABLE_WORLD_CITY_COUNT = 500;

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
