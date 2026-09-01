import {
  escapeSitemapXml,
  getLocationSitemapCount,
  getLocationSitemapUrls,
  LOCATION_SITEMAP_URL_LIMIT,
} from "@/lib/locationSitemap";

export const dynamic = "force-static";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const match = /^(\d+)\.xml$/.exec(id);
  const chunkId = match ? Number(match[1]) : Number.NaN;

  if (!Number.isInteger(chunkId) || chunkId < 0 || chunkId >= getLocationSitemapCount()) {
    return new Response("Not found", { status: 404 });
  }

  const urls = getLocationSitemapUrls().slice(
    chunkId * LOCATION_SITEMAP_URL_LIMIT,
    (chunkId + 1) * LOCATION_SITEMAP_URL_LIMIT,
  );
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (url) =>
        `  <url><loc>${escapeSitemapXml(url)}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
    ),
    "</urlset>",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
