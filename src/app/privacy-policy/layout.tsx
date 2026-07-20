import { metadataForPublicPage } from "@/lib/seo";

export const metadata = metadataForPublicPage("/privacy-policy");

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
