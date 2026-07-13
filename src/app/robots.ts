import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3002").replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/user/", "/admin/", "/super-admin/", "/management/", "/sales/", "/support/", "/marketing/"] }],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
