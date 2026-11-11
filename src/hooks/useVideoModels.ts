"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVideoModelsByVideoIds } from "@/lib/models";
import type { VideoRecord } from "@/lib/videos";

export const useVideoModels = (videos: Pick<VideoRecord, "id">[]) => {
  const videoIds = useMemo(
    () => [...new Set(videos.map((video) => video.id))].sort(),
    [videos],
  );
  const { data = {} } = useQuery({
    queryKey: ["video-models", videoIds],
    queryFn: () => getVideoModelsByVideoIds(videoIds),
    enabled: videoIds.length > 0,
  });

  return data;
};
