import {
  escapeSitemapXml,
  getWorldwideSitemapUrls,
  LOCATION_SITEMAP_LAST_MODIFIED,
} from "@/lib/locationSitemap";

export const dynamic = "force-static";

export function GET() {
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...getWorldwideSitemapUrls().map(
      (url) =>
        `  <url><loc>${escapeSitemapXml(url)}</loc><lastmod>${LOCATION_SITEMAP_LAST_MODIFIED}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
    ),
    "</urlset>",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
