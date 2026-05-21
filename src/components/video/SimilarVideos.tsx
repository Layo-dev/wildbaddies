import VideoCard from "@/components/VideoCard";
import type { VideoRecord } from "@/lib/videos";
import BannerAd from "@/components/BannerAd";

interface SimilarVideosProps {
  videos: VideoRecord[];
}

const SimilarVideos = ({ videos }: SimilarVideosProps) => {
  return (
    <BannerAd zoneId="5929334" />
    <section className="container py-10 sm:py-16">
      <h2 className="text-center text-3xl sm:text-5xl font-bold text-white text-glow tracking-tight uppercase">
        Similar Videos
      </h2>
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            slug={video.slug}
            title={video.title}
            durationSeconds={video.duration_seconds}
            views={video.views}
            rating={video.rating}
            thumbnailUrl={video.thumbnail_url}
          />
        ))}
      </div>
    </section>
  );
};

export default SimilarVideos;