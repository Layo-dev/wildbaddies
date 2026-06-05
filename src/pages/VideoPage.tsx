import { useParams } from "react-router-dom";
import { Eye, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromotedModels from "@/components/PromotedModels";
import VideoPlayer from "@/components/video/VideoPlayer";
import VideoActions from "@/components/video/VideoActions";
import VideoMeta from "@/components/video/VideoMeta";
import VideoComments from "@/components/video/VideoComments";
import SimilarVideos from "@/components/video/SimilarVideos";
import { Skeleton } from "@/components/ui/skeleton";
import { getVideoBySlug, listVideos, incrementVideoView } from "@/lib/videos";

const VideoPage = () => {
  const { slug } = useParams();

  const { data: video, isLoading, isError, error } = useQuery({
    queryKey: ["video", slug],
    queryFn: () => getVideoBySlug(slug ?? ""),
    enabled: Boolean(slug),
  });

  const { data: similarVideos = [] } = useQuery({
    queryKey: ["videos", "similar", video?.id],
    queryFn: () => listVideos("ready"),
    enabled: Boolean(video?.id),
  });

  const related = similarVideos.filter((item) => item.slug !== video?.slug).slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container pt-6 sm:pt-10 pb-4">

          {/* Title skeleton while loading */}
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
            <p className="text-destructive">Failed to load video: {(error as Error).message}</p>
          ) : !video ? (
            <p className="text-muted-foreground">Video not found or still processing.</p>
          ) : (
            <>
              <h1 className="text-3xl sm:text-5xl font-bold text-white uppercase tracking-tight">
                {video.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Eye className="h-4 w-4" /> {video.views} views
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-primary fill-primary" /> {video.rating}
                </span>
                <span>{new Date(video.created_at).toLocaleDateString()}</span>
              </div>
            </>
          )}
        </section>

        <section className="container">
          {/* Player skeleton while loading — preserves aspect ratio, no empty player flash */}
          {isLoading ? (
            <Skeleton className="w-full aspect-video rounded-lg" />
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
            <VideoActions />
            <VideoMeta videoId={video?.id} />
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