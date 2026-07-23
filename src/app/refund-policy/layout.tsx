import { metadataForPublicPage } from "@/lib/seo";

export const metadata = metadataForPublicPage("/refund-policy");

export default function RefundPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
