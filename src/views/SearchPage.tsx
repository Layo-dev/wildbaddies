"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import VideoCardSkeleton from "@/components/VideoCardSkeleton";
import Pagination from "@/components/videos/Pagination";
import ModelCard from "@/components/models/ModelCard";
import AdsterraNativeBanner from "@/components/AdsterraNativeBanner";
import AdsterraNativeBanner2 from "@/components/AdsterraNativeBanner2";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideoModels } from "@/hooks/useVideoModels";
import type { ModelRecord } from "@/lib/models";

interface Video {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  duration_seconds: number;
  views: number;
  rating: number;
  status: string;
  created_at: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ListVideosResponse {
  videos: Video[];
  pagination: PaginationMeta;
}

interface SearchModelsResponse {
  models: Array<{
    id: string;
    name: string;
    slug: string;
    thumbnail_url: string | null;
    videos_count: number;
  }>;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
const PAGE_SIZE = 30;

async function fetchSearchVideos(
  q: string,
  page: number,
): Promise<ListVideosResponse> {
  const params = new URLSearchParams({
    q,
    page: String(page),
    limit: String(PAGE_SIZE),
    sort: "newest",
    status: "ready",
  });
  const res = await fetch(`${SUPABASE_URL}/functions/v1/list-videos?${params}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
  return res.json();
}

async function fetchSearchModels(q: string): Promise<SearchModelsResponse> {
  const params = new URLSearchParams({ q, limit: "6" });
  const res = await fetch(`${SUPABASE_URL}/functions/v1/search-models?${params}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Model search failed: ${res.statusText}`);
  return res.json();
}

const SearchPage = () => {
  const params      = useSearchParams();
  const q           = (params.get("q") ?? "").trim();

  const [page, setPage] = useState(1);

  // Reset pagination on new query
  useEffect(() => { setPage(1); }, [q]);

  // ── Videos query
  const {
    data: videoData,
    isLoading: videosLoading,
    isError: videosError,
    error: videosErr,
    isFetching,
    isPlaceholderData,
  } = useQuery<ListVideosResponse>({
    queryKey: ["videos", "search", q, page],
    queryFn:  () => fetchSearchVideos(q, page),
    enabled:  q.length > 0,
    placeholderData: (prev) => prev,
  });

  // ── Models query (fires in parallel with videos)
  const {
    data: modelData,
    isLoading: modelsLoading,
  } = useQuery<SearchModelsResponse>({
    queryKey: ["models", "search", q],
    queryFn:  () => fetchSearchModels(q),
    enabled:  q.length > 0,
    staleTime: 30_000,
  });

  const videos     = videoData?.videos     ?? [];
  const videoModels = useVideoModels(videos);
  const pagination  = videoData?.pagination ?? null;
  const totalPages  = Math.max(1, pagination?.totalPages ?? 1);
  const currentPage = Math.min(page, totalPages);

  // Map search-models response to ModelRecord shape (only fields ModelCard needs)
  const models: ModelRecord[] = (modelData?.models ?? []).map((m) => ({
    id:                m.id,
    name:              m.name,
    slug:              m.slug,
    thumbnail_url:     m.thumbnail_url,
    bio:               null,
    is_active:         true,
    created_at:        null,
    video_count:       m.videos_count,
    total_views:       null,
    subscribers_count: null,
    profile_views:     null,
    instagram_url:     null,
    twitter_url:       null,
    tiktok_url:        null,
    onlyfans_url:      null,
    fansly_url:        null,
  }));

  useEffect(() => {
    if (!isPlaceholderData && pagination && pagination.page !== page) {
      setPage(Math.max(1, Math.min(pagination.page, totalPages)));
    }
  }, [isPlaceholderData, page, pagination, totalPages]);

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container py-10 sm:py-16">
          {/* Ad Banners */}
          <div className="hidden md:block mb-4">
            <AdsterraNativeBanner2 />
          </div>
          <div className="block md:hidden">
            <AdsterraNativeBanner />
          </div>

          {/* Heading */}
          <h1 className="text-center text-4xl sm:text-6xl font-bold text-white tracking-tight">
            {q ? <>SEARCH RESULTS</> : <>SEARCH</>}
          </h1>
          {q && (
            <p className="mt-3 text-center text-muted-foreground">
              Showing results for{" "}
              <span className="font-extrabold text-white">"{q}"</span>
              {pagination && (
                <>
                  {" — "}
                  <span className="font-extrabold text-white">
                    {pagination.totalCount.toLocaleString()}
                  </span>{" "}
                  videos
                </>
              )}
            </p>
          )}

          {!q ? (
            <p className="mt-12 text-center text-muted-foreground">
              Type something in the search bar to find videos.
            </p>
          ) : (
            <>
              {/* ── MODELS SECTION ───────────────────────────── */}
              {(modelsLoading || models.length > 0) && (
                <div className="mt-12">
                  <h2 className="text-xl font-bold text-white mb-5">
                    Model Search
                    {!modelsLoading && models.length > 0 && (
                      <span className="ml-2 text-muted-foreground font-normal text-sm">
                        ({models.length})
                      </span>
                    )}
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {modelsLoading
                      ? Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="flex flex-col gap-2">
                            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                            <Skeleton className="h-3 w-2/3 mx-auto" />
                          </div>
                        ))
                      : models.map((model) => (
                          <ModelCard key={model.id} model={model} />
                        ))}
                  </div>
                </div>
              )}

              {/* ── VIDEOS SECTION ───────────────────────────── */}
              <div className="mt-12">
                <h2 className="text-xl font-bold text-white mb-5">
                  Video Search
                  {pagination && (
                    <span className="ml-2 text-muted-foreground font-normal text-sm">
                      ({pagination.totalCount.toLocaleString()})
                    </span>
                  )}
                </h2>

                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 transition-opacity duration-200 ${isFetching ? "opacity-50" : "opacity-100"}`}>
                  {videosLoading && Array.from({ length: Math.min(PAGE_SIZE, 12) }).map((_, i) => (
                    <VideoCardSkeleton key={i} />
                  ))}
                  {videosError && (
                    <p className="text-destructive col-span-full">
                      Could not load search: {(videosErr as Error).message}
                    </p>
                  )}
                  {!videosLoading && !videosError && videos.length === 0 && (
                    <p className="text-muted-foreground col-span-full text-center">
                      No videos match "{q}".
                    </p>
                  )}
                  {videos.map((video) => (
                    <VideoCard
                      key={video.id}
                      slug={video.slug}
                      title={video.title}
                      durationSeconds={video.duration_seconds}
                      views={video.views}
                      rating={video.rating}
                      thumbnailUrl={video.thumbnail_url}
                      models={videoModels[video.id]}
                    />
                  ))}
                </div>

                <Pagination page={currentPage} totalPages={totalPages} onChange={goTo} />
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;