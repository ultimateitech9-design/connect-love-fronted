import { metadataForPublicPage } from "@/lib/seo";

export const metadata = metadataForPublicPage("/discover");

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
