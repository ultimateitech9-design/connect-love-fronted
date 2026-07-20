import { metadataForPublicPage } from "@/lib/seo";

export const metadata = metadataForPublicPage("/blog");

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
