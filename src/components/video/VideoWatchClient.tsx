"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import VideoActions from "@/components/video/VideoActions";
import VideoMeta from "@/components/video/VideoMeta";
import ShareSection from "@/components/video/ShareSection";
import VideoComments from "@/components/video/VideoComments";
import { incrementVideoView, type VideoCategory, type VideoRecord } from "@/lib/videos";
import type { ModelRecord } from "@/lib/models";

const VideoPlayer = dynamic(() => import("@/components/video/VideoPlayer"), { ssr: false });

interface Props {
  video: VideoRecord;
  categories: VideoCategory[];
  models: ModelRecord[];
}

export default function VideoWatchClient({ video, categories, models }: Props) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div className="mt-4 -mx-8 sm:mx-0">
        <VideoPlayer
          videoUrl={video.playback_url}
          posterUrl={video.thumbnail_url}
          onFirstPlay={() => incrementVideoView(video.id)}
        />
      </div>
      <div className="mt-6">
        <VideoActions
          onToggleShare={() => setShareOpen((v) => !v)}
          shareOpen={shareOpen}
          videoId={video.id}
        />
        <VideoMeta
          videoId={video.id}
          initialCategories={categories}
          initialModels={models}
        />
        <ShareSection open={shareOpen} />
        <VideoComments />
      </div>
    </>
  );
}
