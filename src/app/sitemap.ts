import type { MetadataRoute } from "next";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { SITE_URL } from "@/lib/seo";

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

  return publicRoutes.map((route) => ({
    url: new URL(route, SITE_URL).toString(),
    changeFrequency: route === "/" || route === "/blog" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/features" || route === "/discover" || route === "/safety" ? 0.8 : 0.6,
  }));
}
