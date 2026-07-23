import { Suspense } from "react";
import { Navbar } from "@/features/home/Navbar";
import { HeroSection } from "@/features/home/HeroSection";
import { AboutSection } from "@/features/home/AboutSection";
import { FeaturesSection } from "@/features/home/FeaturesSection";
import { HomeSeoContent } from "@/features/home/HomeSeoContent";
import { SafetySection } from "@/features/home/SafetySection";
import { Footer } from "@/features/home/Footer";
import { HomeSearchEffects } from "@/features/home/HomeSearchEffects";

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
        <HomeSeoContent />
        <SafetySection />
      </main>

      <Footer />
    </div>
  );
}
