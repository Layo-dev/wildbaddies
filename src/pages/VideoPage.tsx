import { useParams } from "react-router-dom";
import { useState } from "react";
import { Eye, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromotedModels from "@/components/PromotedModels";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoActions from "@/components/video/VideoActions";
import VideoMeta from "@/components/video/VideoMeta";
import ShareSection from "@/components/video/ShareSection";
import VideoComments from "@/components/video/VideoComments";
import SimilarVideos from "@/components/video/SimilarVideos";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getVideoBySlug,
  listVideoCategories,
  getVideosByCategory,
  incrementVideoView,
} from "@/lib/videos";

// Produces valid ISO 8601 duration e.g. PT1M30S
const formatDuration = (seconds: number | null | undefined): string | undefined => {
  if (!seconds || seconds <= 0) return undefined;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `PT${m}M${s}S`;
};

const BASE_URL = "https://wildbaddies.com";

const VideoPage = () => {
  const { slug } = useParams();
  const [shareOpen, setShareOpen] = useState(false);

  const { data: video, isLoading, isError, error } = useQuery({
    queryKey: ["video", slug],
    queryFn: () => getVideoBySlug(slug ?? ""),
    enabled: Boolean(slug),
  });

  // Step 1: get this video's categories
  const { data: categories = [] } = useQuery({
    queryKey: ["video-categories", video?.id],
    queryFn: () => listVideoCategories(video!.id),
    enabled: Boolean(video?.id),
  });

  // Step 2: get videos from same category (actually related)
  const firstCategorySlug = categories[0]?.slug;
  const { data: similarData } = useQuery({
    queryKey: ["similar-videos", firstCategorySlug, video?.id],
    queryFn: () => getVideosByCategory(firstCategorySlug!, "viewed"),
    enabled: Boolean(firstCategorySlug),
  });

  const related = (similarData?.videos ?? [])
    .filter((v) => v.slug !== video?.slug)
    .slice(0, 6);

  const canonicalUrl = `${BASE_URL}/video/${slug}`;
  const pageTitle = video ? `${video.title} | Wild Baddies` : "Wild Baddies";
  const pageDescription = video
    ? `Watch ${video.title} on Wild Baddies. Free adult videos updated daily.`
    : "Wild Baddies — free adult videos updated daily.";

  const jsonLd = video
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: video.title,
        description: `Watch ${video.title} on Wild Baddies. Free adult videos.`,
        thumbnailUrl: video.thumbnail_url,
        uploadDate: new Date(video.created_at).toISOString(),
        duration: formatDuration(video.duration_seconds),
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
          url: BASE_URL,
        },
      })
    : null;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Always render Helmet — fallback values before video loads */}
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="video.other" />
        {video?.thumbnail_url && (
          <meta property="og:image" content={video.thumbnail_url} />
        )}
        {video?.playback_url && (
          <meta property="og:video" content={video.playback_url} />
        )}

        {/* TWITTER / X PLAYER CARD */}
        {video ? (
          <>
            <meta name="twitter:card" content="player" />
            <meta name="twitter:site" content="@WildBaddies" />
            <meta name="twitter:title" content={video.title} />
            <meta name="twitter:description" content={`${video.title} - Watch now on Wild Baddies 🔥`} />
            
            {/* Large preview image (with play icon recommended) */}
            {video.thumbnail_url && (
              <meta name="twitter:image" content={video.thumbnail_url} />
            )}

            {/* Player settings - Critical for inline video preview */}
            <meta name="twitter:player" content={`${canonicalUrl}/embed`} /> {/* Or your clean embed URL */}
            <meta name="twitter:player:width" content="720" />
            <meta name="twitter:player:height" content="1280" /> {/* Vertical looks better on mobile */}
            {video.playback_url && (
              <meta name="twitter:player:stream" content={video.playback_url} />
            )}
          </>
        ) : (
          /* Fallback while loading */
          <>
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={pageTitle} />
            <meta name="twitter:description" content={pageDescription} />
          </>
        )}

        {/* JSON-LD */}
        {jsonLd && (
          <script type="application/ld+json">{jsonLd}</script>
        )}
      </Helmet>

      <Header />
      <main>
        <section className="container pt-6 sm:pt-10 pb-4">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-2/3 rounded-md mb-3" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </>
          ) : isError ? (
            <p className="text-destructive">
              Failed to load video: {(error as Error).message}
            </p>
          ) : !video ? (
            <p className="text-muted-foreground">
              Video not found or still processing.
            </p>
          ) : (
            <>
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
            </>
          )}
        </section>

        <section className="container">
          {isLoading ? (
            <div className="mt-4 -mx-8 sm:mx-0">
              <Skeleton className="w-full aspect-video rounded-lg" />
            </div>
          ) : video ? (
            <div className="mt-4 -mx-8 sm:mx-0">
              <VideoPlayer
                videoUrl={video.playback_url}
                posterUrl={video.thumbnail_url}
                onFirstPlay={() => incrementVideoView(video.id)}
              />
            </div>
          ) : null}

          <div className="mt-6">
            <VideoActions
              onToggleShare={() => setShareOpen((v) => !v)}
              shareOpen={shareOpen}
            />
            <VideoMeta videoId={video?.id} />
            <ShareSection open={shareOpen} />
            <VideoComments />
          </div>
        </section>

        {related.length > 0 && <SimilarVideos videos={related} />}
        <PromotedModels />
      </main>
      <Footer />
    </div>
  );
};

export default VideoPage;