import { metadataForPublicPage } from "@/lib/seo";

export const metadata = metadataForPublicPage("/help-center");

export default function HelpCenterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
