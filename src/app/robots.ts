import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/user/",
          "/admin/",
          "/super-admin/",
          "/management/",
          "/sales/",
          "/support/",
          "/login",
          "/register",
          "/forgot-password",
          "/deploy-status/",
          "/api/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
