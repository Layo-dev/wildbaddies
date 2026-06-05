import VideoCard from "@/components/VideoCard";
import type { VideoRecord } from "@/lib/videos";
//import BannerAd from "@/components/BannerAd";
import AdsterraNativeBanner from "@/components/AdsterraNativeBanner";
import AdsterraNativeBanner2 from "@/components/AdsterraNativeBanner2";
interface SimilarVideosProps {
  videos: VideoRecord[];
}

const SimilarVideos = ({ videos }: SimilarVideosProps) => {
  return (
    <section className="container py-10 sm:py-16">
        <AdsterraNativeBanner2/>
      <div className="block md:hidden">
      <AdsterraNativeBanner/>
      </div>
      {/*<BannerAd zoneId="5929334" />*/}
      <h2 className="text-center text-3xl sm:text-5xl font-bold text-white tracking-tight uppercase">
        Similar Videos
      </h2>
      <div className="mt-10 -mx-8 sm:mx-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
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