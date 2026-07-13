import type { MetadataRoute } from "next";

const publicRoutes = [
  "", "about-us", "blog", "careers", "contact-us", "cookie-policy", "ethics-statement",
  "features", "help-center", "premium", "press", "privacy-policy", "safety", "stories", "terms-of-service",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002").replace(/\/$/, "");
  const now = new Date();
  return publicRoutes.map((route) => ({
    url: `${baseUrl}/${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "blog" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}

