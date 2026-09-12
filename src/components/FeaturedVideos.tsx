"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import VideoCard from "./VideoCard";
import VideoCardSkeleton from "./VideoCardSkeleton";
import Pagination from "./videos/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { listCategories, type CategoryRecord } from "@/lib/categories";
import { getVideosByCategory } from "@/lib/videos";
//import BannerAd from "@/components/BannerAd";
import AdsterraNativeBanner from "@/components/AdsterraNativeBanner";
import AdsterraNativeBanner2 from "@/components/AdsterraNativeBanner2";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── API ──────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;

async function fetchVideos(
  page: number,
  limit: number,
  sort: string
): Promise<ListVideosResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort,
    status: "ready",
  });
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/list-videos?${params}`,
    { headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" } }
  );
  if (!res.ok) throw new Error(`Failed to fetch videos: ${res.statusText}`);
  return res.json();
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SHOW_OPTIONS = [30, 60, 90, 120];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "views",  label: "Most Viewed" },
  { value: "rating", label: "Top Rated" },
];

const COLLAPSED_CHIPS_COUNT = 8;

interface FeaturedVideosState {
  page: number;
  limit: number;
  sort: string;
  selectedCategory: string;
}

const DEFAULT_FEATURED_VIDEOS_STATE: FeaturedVideosState = {
  page: 1,
  limit: 30,
  sort: "newest",
  selectedCategory: "all",
};

export function parseFeaturedVideosSearchParams(search: string | URLSearchParams): FeaturedVideosState {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;

  const page = Number.parseInt(params.get("page") ?? "", 10);
  const limit = Number.parseInt(params.get("limit") ?? "", 10);
  const sort = params.get("sort") ?? DEFAULT_FEATURED_VIDEOS_STATE.sort;
  const selectedCategory = params.get("category") ?? DEFAULT_FEATURED_VIDEOS_STATE.selectedCategory;

  return {
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_FEATURED_VIDEOS_STATE.page,
    limit: SHOW_OPTIONS.includes(limit) ? limit : DEFAULT_FEATURED_VIDEOS_STATE.limit,
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? sort : DEFAULT_FEATURED_VIDEOS_STATE.sort,
    selectedCategory: selectedCategory || DEFAULT_FEATURED_VIDEOS_STATE.selectedCategory,
  };
}

export function buildFeaturedVideosSearchParams(state: FeaturedVideosState): string {
  const params = new URLSearchParams();

  if (state.page > 1) params.set("page", String(state.page));
  if (state.limit !== DEFAULT_FEATURED_VIDEOS_STATE.limit) params.set("limit", String(state.limit));
  if (state.sort !== DEFAULT_FEATURED_VIDEOS_STATE.sort) params.set("sort", state.sort);
  if (state.selectedCategory !== DEFAULT_FEATURED_VIDEOS_STATE.selectedCategory) {
    params.set("category", state.selectedCategory);
  }

  return params.toString();
}

const sortToCategorySort = (s: string): "recent" | "viewed" | "rated" => {
  if (s === "views") return "viewed";
  if (s === "rating") return "rated";
  return "recent";
};

// ─── Component ────────────────────────────────────────────────────────────────
const FeaturedVideos = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const setSearchParams = (next: string | Record<string, string>) => {
    const q =
      typeof next === "string"
        ? next
        : new URLSearchParams(next).toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  };
  const [page, setPage] = useState(() => parseFeaturedVideosSearchParams(searchParams).page);
  const [limit, setLimit] = useState(() => parseFeaturedVideosSearchParams(searchParams).limit);
  const [sort, setSort] = useState(() => parseFeaturedVideosSearchParams(searchParams).sort);
  const [selectedCategory, setSelectedCategory] = useState(() => parseFeaturedVideosSearchParams(searchParams).selectedCategory);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const nextState = parseFeaturedVideosSearchParams(searchParams);
    setPage(nextState.page);
    setLimit(nextState.limit);
    setSort(nextState.sort);
    setSelectedCategory(nextState.selectedCategory);
  }, [searchParams]);

  // ── Categories
  const { data: categories, isLoading: catsLoading } = useQuery<CategoryRecord[]>({
    queryKey: ["categories", "list"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });

  // ── Videos (All vs by-category)
  const isAll = selectedCategory === "all";

  const { data, isLoading, isError, error, isFetching } = useQuery<ListVideosResponse>({
    queryKey: ["videos", "list", selectedCategory, page, limit, sort],
    queryFn: async () => {
      if (isAll) return fetchVideos(page, limit, sort);
      const res = await getVideosByCategory(selectedCategory, sortToCategorySort(sort));
      const all = res.videos.map((v) => ({
        id: v.id,
        title: v.title,
        slug: v.slug,
        thumbnail_url: v.thumbnail_url,
        duration_seconds: v.duration_seconds ?? 0,
        views: v.views,
        rating: v.rating,
        status: v.status,
        created_at: v.created_at,
      })) as Video[];
      const totalCount = all.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      const start = (page - 1) * limit;
      const slice = all.slice(start, start + limit);
      return {
        videos: slice,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    },
    placeholderData: (prev) => prev,
  });

  const videos     = data?.videos     ?? [];
  const pagination = data?.pagination ?? null;
  const totalPages = pagination?.totalPages ?? 1;

  const updateStateAndUrl = (next: Partial<FeaturedVideosState>) => {
    const mergedState: FeaturedVideosState = {
      page,
      limit,
      sort,
      selectedCategory,
      ...next,
    };

    setPage(mergedState.page);
    setLimit(mergedState.limit);
    setSort(mergedState.sort);
    setSelectedCategory(mergedState.selectedCategory);
    setSearchParams(buildFeaturedVideosSearchParams(mergedState));
  };

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages) return;
    updateStateAndUrl({ page: p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (n: number) => {
    updateStateAndUrl({ limit: n, page: 1 });
  };

  const handleSortChange = (s: string) => {
    updateStateAndUrl({ sort: s, page: 1 });
  };

  const handleCategoryChange = (slug: string) => {
    updateStateAndUrl({ selectedCategory: slug, page: 1 });
  };

  // Build chip list: synthetic "All" + DB categories
  const allChips = useMemo(() => {
    const dbChips = (categories ?? []).map((c) => ({ slug: c.slug, name: c.name }));
    return [{ slug: "all", name: "All" }, ...dbChips];
  }, [categories]);

  const visibleChips = expanded ? allChips : allChips.slice(0, COLLAPSED_CHIPS_COUNT);
  const canExpand = allChips.length > COLLAPSED_CHIPS_COUNT;

  return (
    <section className="container py-10 sm:py-16">
      {/* Sponsored ad */}
      {/*<div className=" mb-4 mx-auto flex h-[160px] w-full max-w-sm items-center justify-center rounded-md border border-dashed border-border text-xs uppercase tracking-widest text-muted-foreground">*/}
        {/*Sponsored · Ad 300×250*/}
        {/*<BannerAd zoneId="5929334" />*/}
        <div className="hidden md:block mb-4">
          <AdsterraNativeBanner2 />
        </div>
        <div className="block md:hidden">
          <AdsterraNativeBanner />
        </div>
      {/*</div>*/}
      <h2 className="text-center text-4xl sm:text-6xl font-bold text-white tracking-tight">
        FEATURED VIDEOS
      </h2>

      {/* Category chips — horizontal scrolling row */}
      <div className="mt-8 -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 w-max">
          {catsLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-full shrink-0" />
              ))
            : allChips.map((c) => {
                const active = selectedCategory === c.slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => handleCategoryChange(c.slug)}
                    className={
                      active
                        ? "chip shrink-0 bg-foreground text-background border-foreground hover:bg-foreground"
                        : "chip shrink-0"
                    }
                  >
                    {c.name}
                  </button>
                );
              })}
        </div>
      </div>

      {/* Controls row */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        {/* Show: 30 60 90 120 */}
        <div className="flex items-center gap-3">
          <span>Show:</span>
          {SHOW_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => handleLimitChange(n)}
              className={`font-bold transition-colors ${
                limit === n ? "text-primary2" : "hover:text-primary2"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3">
          <span>Sort:</span>
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => handleSortChange(o.value)}
              className={`font-bold transition-colors ${
                sort === o.value ? "text-primary2" : "hover:text-primary2"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Total count */}
        {pagination && (
          <div className="text-primary2 font-bold">
            {pagination.totalCount.toLocaleString()} videos
          </div>
        )}
      </div>

      {/* Grid */}
      <div
        className={`mt-10 -mx-8 sm:mx-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 transition-opacity duration-200 ${
          isFetching ? "opacity-50" : "opacity-100"
        }`}
      >
        {isLoading && (
          <>
            {Array.from({ length: Math.min(limit, 12) }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </>
        )}
        {isError && (
          <p className="text-destructive col-span-full">
            Could not load videos: {(error as Error).message}
          </p>
        )}
        {!isLoading && !isError && videos.length === 0 && (
          <p className="text-muted-foreground col-span-full">No videos found.</p>
        )}
       {videos.map((video, index) => (
          <Fragment key={video.id}>
            <VideoCard
              slug={video.slug}
              title={video.title}
              durationSeconds={video.duration_seconds}
              views={video.views}
              rating={video.rating}
              thumbnailUrl={video.thumbnail_url}
            />

            {(index + 1) % 8 === 0 && (
              <div className="block md:hidden">
                <AdsterraNativeBanner />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      {pagination && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onChange={goTo} />
      )}
    </section>
  );
};

export default FeaturedVideos;