"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import VideoCard from "./VideoCard";
import VideoCardSkeleton from "./VideoCardSkeleton";
import Pagination from "./videos/Pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { listCategories, type CategoryRecord } from "@/lib/categories";
import { listVideos, type VideoRecord } from "@/lib/videos";
import { useVideoModels } from "@/hooks/useVideoModels";
//import BannerAd from "@/components/BannerAd";
import AdsterraNativeBanner from "@/components/AdsterraNativeBanner";
import AdsterraNativeBanner2 from "@/components/AdsterraNativeBanner2";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
// ─── Types ────────────────────────────────────────────────────────────────────
// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE_SIZE = 24;
const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "views",  label: "Most Viewed" },
  { value: "rating", label: "Top Rated" },
];

const COLLAPSED_CHIPS_COUNT = 8;

interface FeaturedVideosState {
  page: number;
  sort: string;
}

const DEFAULT_FEATURED_VIDEOS_STATE: FeaturedVideosState = {
  page: 1,
  sort: "newest",
};

export function parseFeaturedVideosSearchParams(search: string | URLSearchParams): FeaturedVideosState {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;

  const page = Number.parseInt(params.get("page") ?? "", 10);
  const sort = params.get("sort") ?? DEFAULT_FEATURED_VIDEOS_STATE.sort;

  return {
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_FEATURED_VIDEOS_STATE.page,
    sort: SORT_OPTIONS.some((option) => option.value === sort) ? sort : DEFAULT_FEATURED_VIDEOS_STATE.sort,
  };
}

export function buildFeaturedVideosSearchParams(state: FeaturedVideosState): string {
  const params = new URLSearchParams();

  if (state.page > 1) params.set("page", String(state.page));
  if (state.sort !== DEFAULT_FEATURED_VIDEOS_STATE.sort) params.set("sort", state.sort);

  return params.toString();
}

const sortVideos = (videos: VideoRecord[], sort: string): VideoRecord[] => {
  const copy = [...videos];
  if (sort === "views") return copy.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  if (sort === "rating") return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return copy.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
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
  const [sort, setSort] = useState(() => parseFeaturedVideosSearchParams(searchParams).sort);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const nextState = parseFeaturedVideosSearchParams(searchParams);
    setPage(nextState.page);
    setSort(nextState.sort);
  }, [searchParams]);

  // ── Categories
  const { data: categories, isLoading: catsLoading } = useQuery<CategoryRecord[]>({
    queryKey: ["categories", "list"],
    queryFn: listCategories,
    staleTime: 5 * 60 * 1000,
  });

  const { data: videos = [], isLoading, isError, error, isFetching } = useQuery<VideoRecord[]>({
    queryKey: ["videos", "list"],
    queryFn: () => listVideos("ready"),
    placeholderData: (prev) => prev,
  });

  const sortedVideos = useMemo(() => sortVideos(videos, sort), [videos, sort]);
  const totalPages = Math.max(1, Math.ceil(sortedVideos.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageVideos = sortedVideos.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const videoModels = useVideoModels(pageVideos);

  const updateStateAndUrl = (next: Partial<FeaturedVideosState>) => {
    const mergedState: FeaturedVideosState = {
      page,
      sort,
      ...next,
    };

    setPage(mergedState.page);
    setSort(mergedState.sort);
    setSearchParams(buildFeaturedVideosSearchParams(mergedState));
  };

  const goTo = (p: number) => {
    updateStateAndUrl({ page: p });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (s: string) => {
    updateStateAndUrl({ sort: s, page: 1 });
  };

  // Build chip list: synthetic "All" + DB categories
  const allChips = useMemo(() => {
    const dbChips = (categories ?? []).map((c) => ({
      slug: c.slug,
      name: c.name,
      href: `/categories/${c.slug}`,
    }));
    return [{ slug: "all", name: "All", href: "/videos" }, ...dbChips];
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
            : allChips.map((c) => (
                <Link key={c.slug} href={c.href} className="chip shrink-0">
                  {c.name}
                </Link>
              ))}
        </div>
      </div>

      {/* Controls row */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
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
        <div className="text-primary2 font-bold">{sortedVideos.length.toLocaleString()} videos</div>
      </div>

      {/* Grid */}
      <div
        className={`mt-10 -mx-8 sm:mx-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 transition-opacity duration-200 ${
          isFetching ? "opacity-50" : "opacity-100"
        }`}
      >
        {isLoading && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
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
      {pageVideos.map((video, index) => (
          <Fragment key={video.id}>
            <VideoCard
              slug={video.slug}
              title={video.title}
              durationSeconds={video.duration_seconds}
              views={video.views}
              rating={video.rating}
              thumbnailUrl={video.thumbnail_url}
              models={videoModels[video.id]}
            />

            {(index + 1) % 8 === 0 && (
              <div className="block md:hidden">
                <AdsterraNativeBanner />
              </div>
            )}
          </Fragment>
        ))}
      </div>

      <Pagination page={currentPage} totalPages={totalPages} onChange={goTo} />
    </section>
  );
};

export default FeaturedVideos;