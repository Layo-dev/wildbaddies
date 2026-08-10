import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModelProfile from "@/components/models/ModelProfile";
import VideoCard from "@/components/VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
import { getModelBySlug, incrementModelProfileView } from "@/lib/models";
import type { ModelBySlugResult, ModelRecord } from "@/lib/models";
import type { VideoRecord, VideoSort } from "@/lib/videos";
import { formatCount } from "@/lib/format";

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

const ModelPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const [sort, setSort] = useState<VideoSort>("recent");
  const [data, setData] = useState<ModelBySlugResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const viewTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getModelBySlug(slug)
      .then((res) => {
        if (cancelled) return;
        setData(res);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const model = data?.model ?? null;

  useEffect(() => {
    if (!model?.id || viewTrackedRef.current === model.id) return;
    viewTrackedRef.current = model.id;
    incrementModelProfileView(model.id);
    setData((prev) => {
      if (!prev?.model) return prev;
      const views = prev.model.profile_views ?? 0;
      return {
        ...prev,
        model: { ...prev.model, profile_views: views + 1 },
      };
    });
  }, [model?.id]);

  const handleModelUpdate = (patch: Partial<ModelRecord>) => {
    setData((prev) => {
      if (!prev?.model) return prev;
      return { ...prev, model: { ...prev.model, ...patch } };
    });
  };
  const videos = useMemo(
    () => sortVideos(data?.videos ?? [], sort),
    [data?.videos, sort],
  );
  const pageTitle = model ? `${model.name} | Wild Baddies` : "Model | Wild Baddies";

  const metaDescription = useMemo(() => {
    if (!model) return "Browse model videos on Wild Baddies.";
    const count = model.video_count ?? videos.length;
    return `Watch ${count} videos featuring ${model.name} on Wild Baddies.`;
  }, [model, videos.length]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://wildbaddies.com/models/${slug}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`https://wildbaddies.com/models/${slug}`} />
        {model?.thumbnail_url && <meta property="og:image" content={model.thumbnail_url} />}
      </Helmet>

      <Header />

      <main>
        <section className="container py-8 sm:py-12">
          {loading && (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_1fr] gap-10 lg:gap-14">
              <div className="flex flex-col items-center gap-4">
                <Skeleton className="aspect-[3/4] w-full max-w-[280px] rounded-xl" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-16 w-full max-w-sm" />
              </div>
              <div>
                <Skeleton className="mx-auto h-10 w-40" />
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-video w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && error && (
            <p className="text-center text-sm text-destructive">{error}</p>
          )}

          {!loading && !error && !model && (
            <p className="text-center text-muted-foreground">Model not found.</p>
          )}

          {!loading && !error && model && (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_1fr] gap-10 lg:gap-14">
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <ModelProfile model={model} onModelUpdate={handleModelUpdate} />
              </aside>

              <div>
                <h2 className="text-center text-3xl sm:text-4xl font-bold uppercase tracking-tight text-foreground">
                  Videos
                </h2>

                <div className="mt-6 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold tracking-wide">
                    {SORTS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSort(s.id)}
                        className={`uppercase transition-colors ${
                          sort === s.id
                            ? "text-primary2"
                            : "text-muted-foreground hover:text-foreground"
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

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  {videos.map((v) => (
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

                {videos.length === 0 && (
                  <p className="mt-10 text-center text-muted-foreground">
                    No videos for this model yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ModelPage;
