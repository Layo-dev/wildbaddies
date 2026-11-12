"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import VideoCard from "@/components/VideoCard";
import { formatCount } from "@/lib/format";
import type { VideoRecord, VideoSort } from "@/lib/videos";
import { useVideoModels } from "@/hooks/useVideoModels";
import Pagination from "@/components/videos/Pagination";

const PAGE_SIZE = 24;

const SORTS: Array<{ id: VideoSort; label: string }> = [
  { id: "recent", label: "MOST RECENT" },
  { id: "viewed", label: "MOST VIEWED" },
  { id: "rated", label: "BEST RATED" },
];

const sortVideos = (videos: VideoRecord[], sort: VideoSort): VideoRecord[] => {
  const copy = [...videos];
  if (sort === "viewed") return copy.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  if (sort === "rated") return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return copy.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};

interface Props {
  videos: VideoRecord[];
  emptyMessage?: string;
  page?: number;
  paginationBase?: string;
}

export default function SortableVideoGrid({
  videos,
  emptyMessage = "No videos yet.",
  page = 1,
  paginationBase,
}: Props) {
  const router = useRouter();
  const [sort, setSort] = useState<VideoSort>("recent");
  const sorted = useMemo(() => sortVideos(videos, sort), [videos, sort]);
  const totalPages = paginationBase ? Math.ceil(sorted.length / PAGE_SIZE) : 1;
  const currentPage = Math.min(Math.max(1, page), Math.max(1, totalPages));
  const pageVideos = paginationBase
    ? sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : sorted;
  const videoModels = useVideoModels(pageVideos);

  const goToPage = (nextPage: number) => {
    if (!paginationBase) return;
    const url = nextPage === 1 ? paginationBase : `${paginationBase}?page=${nextPage}`;
    router.push(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="mt-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold tracking-wide">
          {SORTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSort(s.id)}
              className={`uppercase transition-colors ${
                sort === s.id ? "text-primary2" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-sm font-bold uppercase text-primary2"
        >
          Any Duration <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-10 -mx-8 sm:mx-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        {pageVideos.map((v) => (
          <VideoCard
            key={v.id}
            slug={v.slug}
            title={v.title}
            durationSeconds={v.duration_seconds}
            views={formatCount(v.views)}
            rating={v.rating}
            thumbnailUrl={v.thumbnail_url}
            models={videoModels[v.id]}
          />
        ))}
      </div>

      {sorted.length === 0 && (
        <p className="mt-10 text-center text-muted-foreground">{emptyMessage}</p>
      )}

      {paginationBase && (
        <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
      )}
    </>
  );
}
