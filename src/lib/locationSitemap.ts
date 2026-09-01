import { datingLocationPath, INDIA_DATING_LOCATIONS } from "@/lib/indiaLocations";
import { SITE_URL } from "@/lib/seo";
import {
  isWorldCityIndexable,
  WORLD_CITIES,
  WORLD_COUNTRIES,
  worldCityPath,
  worldCountryPath,
} from "@/lib/worldCities";

export const LOCATION_SITEMAP_URL_LIMIT = 50_000;

export function getLocationSitemapUrls() {
  const paths = [
    ...INDIA_DATING_LOCATIONS.map(datingLocationPath),
    ...WORLD_COUNTRIES.map(worldCountryPath),
    ...WORLD_CITIES.filter(isWorldCityIndexable).map(worldCityPath),
  ];

  return [...new Set(paths)]
    .sort()
    .map((path) => new URL(path, SITE_URL).toString());
}

export function getLocationSitemapCount() {
  return Math.max(
    1,
    Math.ceil(getLocationSitemapUrls().length / LOCATION_SITEMAP_URL_LIMIT),
  );
}

export function escapeSitemapXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
