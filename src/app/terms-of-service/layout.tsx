import { metadataForPublicPage } from "@/lib/seo";

export const metadata = metadataForPublicPage("/terms-of-service");

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
