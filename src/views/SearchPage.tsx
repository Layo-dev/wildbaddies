"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import VideoCardSkeleton from "@/components/VideoCardSkeleton";
import Pagination from "@/components/videos/Pagination";

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

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ListVideosResponse {
  videos: Video[];
  pagination: Pagination;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

const SHOW_OPTIONS = [30, 60, 90, 120];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "views", label: "Most Viewed" },
  { value: "rating", label: "Top Rated" },
];

async function fetchSearch(
  q: string,
  page: number,
  limit: number,
  sort: string,
): Promise<ListVideosResponse> {
  const params = new URLSearchParams({
    q,
    page: String(page),
    limit: String(limit),
    sort,
    status: "ready",
  });
  const res = await fetch(`${SUPABASE_URL}/functions/v1/list-videos?${params}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
  return res.json();
}

const SearchPage = () => {
  const params = useSearchParams();
  const q = (params.get("q") ?? "").trim();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [sort, setSort] = useState("newest");

  // Reset pagination on new query
  useEffect(() => {
    setPage(1);
  }, [q]);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData } = useQuery<ListVideosResponse>({
    queryKey: ["videos", "search", q, page, limit, sort],
    queryFn: () => fetchSearch(q, page, limit, sort),
    enabled: q.length > 0,
    placeholderData: (prev) => prev,
  });

  const videos = data?.videos ?? [];
  const pagination = data?.pagination ?? null;
  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const currentPage = Math.min(page, totalPages);

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

          {q && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>Show:</span>
                {SHOW_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setLimit(n);
                      setPage(1);
                    }}
                    className={`font-bold transition-colors ${
                      limit === n ? "text-primary" : "hover:text-primary"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span>Sort:</span>
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => {
                      setSort(o.value);
                      setPage(1);
                    }}
                    className={`font-bold transition-colors ${
                      sort === o.value ? "text-primary" : "hover:text-primary"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!q ? (
            <p className="mt-12 text-center text-muted-foreground">
              Type something in the search bar to find videos.
            </p>
          ) : (
            <>
              <div
                className={`mt-10 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 transition-opacity duration-200 ${
                  isFetching ? "opacity-50" : "opacity-100"
                }`}
              >
                {isLoading &&
                  Array.from({ length: Math.min(limit, 12) }).map((_, i) => (
                    <VideoCardSkeleton key={i} />
                  ))}
                {isError && (
                  <p className="text-destructive col-span-full">
                    Could not load search: {(error as Error).message}
                  </p>
                )}
                {!isLoading && !isError && videos.length === 0 && (
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
                  />
                ))}
              </div>

              <Pagination page={currentPage} totalPages={totalPages} onChange={goTo} />
            </>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;