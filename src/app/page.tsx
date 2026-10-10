import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/features/home/Navbar";
import { HeroSection } from "@/features/home/HeroSection";
import { AboutSection } from "@/features/home/AboutSection";
import { FeaturesSection } from "@/features/home/FeaturesSection";
import { HomeSeoContent } from "@/features/home/HomeSeoContent";
import { SafetySection } from "@/features/home/SafetySection";
import { Footer } from "@/features/home/Footer";
import { HomeSearchEffects } from "@/features/home/HomeSearchEffects";
import { TopCitiesSection } from "@/features/home/TopCitiesSection";
import { createPublicMetadata, HOME_DESCRIPTION, HOME_KEYWORDS, HOME_TITLE } from "@/lib/seo";

const homeMetadata = createPublicMetadata({
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  path: "/",
  keywords: HOME_KEYWORDS,
});

export const metadata: Metadata = {
  alternates: homeMetadata.alternates,
  robots: homeMetadata.robots,
};

export default function HomePage() {
  return (
    <div className="marketing-home min-h-screen bg-white text-slate-900 transition-colors dark:bg-[#090910] dark:text-slate-100">
      <Suspense fallback={null}>
        <HomeSearchEffects />
      </Suspense>

      <Navbar />

      <main>
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <TopCitiesSection />
        <HomeSeoContent />
        <SafetySection />
      </main>

      <Footer />
    </div>
  );
}
