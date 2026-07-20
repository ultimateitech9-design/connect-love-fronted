import { metadataForPublicPage } from "@/lib/seo";

export const metadata = metadataForPublicPage("/features");

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
