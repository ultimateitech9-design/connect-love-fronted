import { metadataForPublicPage } from "@/lib/seo";

export const metadata = metadataForPublicPage("/careers");

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
