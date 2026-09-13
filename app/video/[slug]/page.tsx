import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Eye, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromotedModels from "@/components/PromotedModels";
import SimilarVideos from "@/components/video/SimilarVideos";
import VideoWatchClient from "@/components/video/VideoWatchClient";
import { getVideoBySlug, listVideoCategories, getVideosByCategory } from "@/lib/videos";
import { getVideoModels } from "@/lib/models";
import { SITE_URL, formatDurationIso } from "@/lib/seo";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video) return { title: "Video not found" };

  const title = `${video.title} | Wild Baddies`;
  const description = `Watch ${video.title} on Wild Baddies. Free adult videos updated daily.`;
  const canonical = `${SITE_URL}/video/${slug}`;

  return {
    title: video.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "video.other",
      url: canonical,
      title,
      description,
      images: video.thumbnail_url ? [video.thumbnail_url] : undefined,
      videos: video.playback_url ? [video.playback_url] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      //site: "@WildBaddies",
      title: video.title,
      description: `${video.title} - Watch now on Wild Baddies`,
      images: video.thumbnail_url ? [video.thumbnail_url] : undefined,
    },
    //other: video.playback_url
      //? {
          //"twitter:player": `${canonical}/embed`,
          //"twitter:player:width": "720",
          //"twitter:player:height": "1280",
          //"twitter:player:stream": video.playback_url,
        //}
      //: undefined,
  };
}

export default async function VideoRoute({ params }: Props) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug);
  if (!video) notFound();

  const [categories, models] = await Promise.all([
    listVideoCategories(video.id),
    getVideoModels(video.id),
  ]);

  const firstCategorySlug = categories[0]?.slug;
  const similarData = firstCategorySlug
    ? await getVideosByCategory(firstCategorySlug, "viewed")
    : { videos: [] };
  const related = (similarData.videos ?? [])
    .filter((v) => v.slug !== video.slug)
    .slice(0, 6);

  const canonicalUrl = `${SITE_URL}/video/${slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: `Watch ${video.title} on Wild Baddies. Free adult videos.`,
    thumbnailUrl: video.thumbnail_url,
    uploadDate: new Date(video.created_at).toISOString(),
    duration: formatDurationIso(video.duration_seconds),
    contentUrl: video.playback_url,
    embedUrl: canonicalUrl,
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/WatchAction",
      userInteractionCount: video.views,
    },
    publisher: {
      "@type": "Organization",
      name: "Wild Baddies",
      url: SITE_URL,
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <section className="container pt-6 sm:pt-10 pb-4">
          <h1 className="text-3xl sm:text-5xl font-bold text-white uppercase tracking-tight">
            {video.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" /> {video.views.toLocaleString()} views
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 text-primary fill-primary" />
              {video.rating}
            </span>
            <span>
              {new Date(video.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </section>

        <section className="container">
          <VideoWatchClient video={video} categories={categories} models={models} />
        </section>

        {related.length > 0 && <SimilarVideos videos={related} />}
        <PromotedModels />
      </main>
      <Footer />
    </div>
  );
}
