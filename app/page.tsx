import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeaturedVideos from "@/components/FeaturedVideos";
import PromotedModels from "@/components/PromotedModels";
import ExoSliderAd from "@/components/ExoSliderAd";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 120;

export const metadata: Metadata = {
  title: { absolute: "Wild Baddies | Baddies Porn" },
  description:
    "Wild Baddies — Free baddies porn videos, OnlyFans clips, Latina, Ebony & thick amateurs. Daily new explicit videos and photos. Watch the wildest baddies now.",
  alternates: { canonical: `${SITE_URL}/` },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <h1 className="sr-only">Wild Baddies - Baddies Porn</h1>
        <Suspense fallback={<div className="container py-16 text-muted-foreground">Loading videos…</div>}>
          <FeaturedVideos />
        </Suspense>
        <ExoSliderAd />
        <PromotedModels />
      </main>
      <Footer />
    </div>
  );
}
