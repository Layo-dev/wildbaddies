import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import AdsterraNativeBanner from "@/components/AdsterraNativeBanner";
import AdsterraNativeBanner2 from "@/components/AdsterraNativeBanner2";
import Footer from "@/components/Footer";
import SortableVideoGrid from "@/components/videos/SortableVideoGrid";
import { getVideosByCategory } from "@/lib/videos";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getVideosByCategory(slug, "recent");
  const name = data.category?.name ?? slug.replace(/-/g, " ");
  return {
    title: `${name} Videos`,
    description: `Watch the best ${name} videos on Wild Baddies.`,
    alternates: { canonical: `${SITE_URL}/categories/${slug}` },
  };
}

export default async function CategoryVideosRoute({ params }: Props) {
  const { slug } = await params;
  const data = await getVideosByCategory(slug, "recent");
  if (!data.category) notFound();
  const name = data.category.name;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container py-10 sm:py-16">
        {/*Sponsored · Ad 300×250*/}
        <div className="hidden md:block mb-4">
          <AdsterraNativeBanner2 />
        </div>
        <div className="block md:hidden">
          <AdsterraNativeBanner />
        </div>
          <h1 className="text-center text-4xl sm:text-6xl font-bold uppercase text-foreground tracking-tight">
            {name} Videos
          </h1>
          <SortableVideoGrid
            videos={data.videos}
            emptyMessage="No videos in this category yet."
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
