import { metadataForPublicPage } from "@/lib/seo";

export const metadata = metadataForPublicPage("/safety");

export default function SafetyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
