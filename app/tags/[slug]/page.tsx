import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SortableVideoGrid from "@/components/videos/SortableVideoGrid";
import { getVideosByTag } from "@/lib/videos";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getVideosByTag(slug, "recent");
  const name = data.tag?.name ?? slug.replace(/-/g, " ");
  return {
    title: `${name} Videos`,
    description: `Watch ${name} videos on Wild Baddies.`,
    alternates: { canonical: `${SITE_URL}/tags/${slug}` },
  };
}

export default async function TagVideosRoute({ params }: Props) {
  const { slug } = await params;
  const data = await getVideosByTag(slug, "recent");
  if (!data.tag) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container py-10 sm:py-16">
          <h1 className="text-center text-4xl sm:text-6xl font-bold uppercase text-foreground tracking-tight">
            {data.tag.name} Videos
          </h1>
          <SortableVideoGrid videos={data.videos} emptyMessage="No videos with this tag yet." />
        </section>
      </main>
      <Footer />
    </div>
  );
}
