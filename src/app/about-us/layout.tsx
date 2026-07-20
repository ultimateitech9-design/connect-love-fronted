import { metadataForPublicPage } from "@/lib/seo";

export const metadata = metadataForPublicPage("/about-us");

export default function AboutUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
