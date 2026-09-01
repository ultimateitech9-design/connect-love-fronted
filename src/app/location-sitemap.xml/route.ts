import { getLocationSitemapCount, escapeSitemapXml } from "@/lib/locationSitemap";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const sitemaps = Array.from({ length: getLocationSitemapCount() }, (_, id) =>
    new URL(`/location-sitemaps/${id}.xml`, SITE_URL).toString(),
  );
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps.map(
      (url) => `  <sitemap><loc>${escapeSitemapXml(url)}</loc></sitemap>`,
    ),
    "</sitemapindex>",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
