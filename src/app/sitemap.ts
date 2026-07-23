import type { MetadataRoute } from "next";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
  datingLocationPath,
  INDIA_DATING_LOCATIONS,
} from "@/lib/indiaLocations";
import { SITE_URL } from "@/lib/seo";
import {
  isWorldCityIndexable,
  WORLD_CITIES,
  WORLD_COUNTRIES,
  worldCityPath,
  worldCountryPath,
} from "@/lib/worldCities";

export const dynamic = "force-static";

const excludedRootSegments = new Set([
  "actions",
  "admin",
  "forgot-password",
  "login",
  "management",
  "marketing",
  "register",
  "sales",
  "super-admin",
  "support",
  "user",
]);

function discoverPublicRoutes(directory: string, segments: string[] = []): string[] {
  const entries = readdirSync(directory, { withFileTypes: true });
  const hasPage = entries.some((entry) => entry.isFile() && /^page\.(tsx?|jsx?)$/.test(entry.name));
  const routes = hasPage ? [segments.length ? `/${segments.join("/")}` : "/"] : [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (!segments.length && excludedRootSegments.has(entry.name)) continue;
    if (entry.name.startsWith("_") || entry.name.startsWith("@") || entry.name.includes("[")) continue;

    const isRouteGroup = entry.name.startsWith("(") && entry.name.endsWith(")");
    const nextSegments = isRouteGroup ? segments : [...segments, entry.name];
    routes.push(...discoverPublicRoutes(join(directory, entry.name), nextSegments));
  }

  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const appDirectory = join(process.cwd(), "src", "app");
  const publicRoutes = [...new Set(discoverPublicRoutes(appDirectory))].sort();
  const locationRoutes = [
    "/dating/city",
    "/dating/state",
    ...INDIA_DATING_LOCATIONS.map(datingLocationPath),
  ];
  const globalRoutes = [
    ...WORLD_COUNTRIES.map(worldCountryPath),
    ...WORLD_CITIES.filter(isWorldCityIndexable).map(worldCityPath),
  ];
  const routes = [
    ...new Set([...publicRoutes, ...locationRoutes, ...globalRoutes]),
  ].sort();

  return routes.map((route) => ({
    url: new URL(route, SITE_URL).toString(),
    changeFrequency:
      route === "/" || route === "/blog" || route.startsWith("/dating/")
        ? "weekly"
        : "monthly",
    priority:
      route === "/"
        ? 1
        : route === "/features" ||
            route === "/discover" ||
            route === "/safety" ||
            route === "/dating"
          ? 0.8
          : route.startsWith("/dating/")
            ? 0.7
            : 0.6,
  }));
}
