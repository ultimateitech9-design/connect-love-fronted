import { metadataForPublicPage } from "@/lib/seo";

export const metadata = metadataForPublicPage("/contact-us");

export default function ContactUsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
