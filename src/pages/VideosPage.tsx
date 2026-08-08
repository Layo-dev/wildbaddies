import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import VideoCardSkeleton from "@/components/VideoCardSkeleton";
import VideoFilterSidebar, { type DurationMin } from "@/components/videos/VideoFilterSidebar";
import MobileVideoFilters from "@/components/videos/MobileVideoFilters";
import Pagination from "@/components/videos/Pagination";
import { listCategories } from "@/lib/categories";
import { listVideos, getVideosByCategory, type VideoSort, type VideoRecord } from "@/lib/videos";
import { formatCount } from "@/lib/format";

const PAGE_SIZE = 24;

const SORTS: Array<{ id: VideoSort; label: string }> = [
  { id: "recent", label: "Most Recent" },
  { id: "viewed", label: "Most Viewed" },
  { id: "rated", label: "Best Rated" },
];

const sortVideos = (videos: VideoRecord[], sort: VideoSort): VideoRecord[] => {
  const copy = [...videos];
  if (sort === "viewed") return copy.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  if (sort === "rated") return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  return copy.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};

const VideosPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  // Filters are UI state only — they never enter the URL (no crawlable combos).
  const [sort, setSort] = useState<VideoSort>("recent");
  const [minDuration, setMinDuration] = useState<DurationMin>(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [chipsExpanded, setChipsExpanded] = useState(false);

  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: listCategories,
  });

  const { data: videos = [], isLoading, isError, error } = useQuery({
    queryKey: ["browse-videos", activeCategory],
    queryFn: async () =>
      activeCategory
        ? (await getVideosByCategory(activeCategory, "recent")).videos
        : await listVideos("ready"),
  });

  const filtered = useMemo(() => {
    const minSeconds = minDuration * 60;
    const byDuration = videos.filter((v) =>
      minSeconds === 0 ? true : (v.duration_seconds ?? 0) >= minSeconds,
    );
    return sortVideos(byDuration, sort);
  }, [videos, minDuration, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (p: number) => {
    setSearchParams(p <= 1 ? {} : { page: String(p) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetPage = () => setSearchParams({});

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Videos | Wild Baddies</title>
        <meta
          name="description"
          content="Browse every video on Wild Baddies — filter by duration and category, sorted by most recent, most viewed or best rated."
        />
        <link rel="canonical" href="https://wildbaddies.com/videos" />
        <meta property="og:title" content="Videos | Wild Baddies" />
        <meta property="og:description" content="Browse every video on Wild Baddies." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wildbaddies.com/videos" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <main>
        <section className="container py-8 sm:py-12">
          <div className="flex gap-10">
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <VideoFilterSidebar
                  categories={categories}
                  loading={catsLoading}
                  minDuration={minDuration}
                  onMinDurationChange={(d) => {
                    setMinDuration(d);
                    resetPage();
                  }}
                  activeCategory={activeCategory}
                  onCategoryChange={(slug) => {
                    setActiveCategory(slug);
                    resetPage();
                  }}
                />
              </div>
            </div>

            {/* Main column */}
            <div className="min-w-0 flex-1">
              <h1 className="text-center text-3xl sm:text-5xl font-bold uppercase tracking-tight text-foreground">
                Videos
              </h1>

              {/* Desktop sort row */}
              <div className="mt-4 hidden lg:flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                {SORTS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSort(s.id);
                      resetPage();
                    }}
                    className={`text-sm font-bold uppercase tracking-wide transition-colors ${
                      sort === s.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Mobile filters */}
              <div className="mt-4">
                <MobileVideoFilters
                  sort={sort}
                  onSortChange={(s) => {
                    setSort(s);
                    resetPage();
                  }}
                  minDuration={minDuration}
                  onMinDurationChange={(d) => {
                    setMinDuration(d);
                    resetPage();
                  }}
                  categories={categories}
                  loading={catsLoading}
                  activeCategory={activeCategory}
                  onCategoryChange={(slug) => {
                    setActiveCategory(slug);
                    resetPage();
                  }}
                  expanded={chipsExpanded}
                  onToggleExpanded={() => setChipsExpanded((v) => !v)}
                />
              </div>

              {/* Grid */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6 -mx-4 sm:mx-0">
                {isLoading &&
                  Array.from({ length: 6 }).map((_, i) => <VideoCardSkeleton key={i} />)}

                {!isLoading &&
                  !isError &&
                  pageItems.map((v) => (
                    <VideoCard
                      key={v.id}
                      slug={v.slug}
                      title={v.title}
                      durationSeconds={v.duration_seconds}
                      views={formatCount(v.views)}
                      rating={v.rating}
                      thumbnailUrl={v.thumbnail_url}
                    />
                  ))}
              </div>

              {isError && (
                <p className="mt-10 text-center text-sm text-destructive">
                  {(error as Error).message}
                </p>
              )}

              {!isLoading && !isError && pageItems.length === 0 && (
                <p className="mt-10 text-center text-muted-foreground">
                  No videos match these filters.
                </p>
              )}

              <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default VideosPage;