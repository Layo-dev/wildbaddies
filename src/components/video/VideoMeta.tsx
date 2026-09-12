"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { listVideoCategories, type VideoCategory } from "@/lib/videos";
import { getVideoModels, type ModelRecord } from "@/lib/models";

interface VideoMetaProps {
  videoId?: string;
  initialCategories?: VideoCategory[];
  initialModels?: ModelRecord[];
}

const VideoMeta = ({ videoId, initialCategories, initialModels }: VideoMetaProps) => {
  const { data: categories = initialCategories ?? [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["video-categories", videoId],
    queryFn: () => listVideoCategories(videoId as string),
    enabled: Boolean(videoId),
    initialData: initialCategories,
  });

  const { data: models = initialModels ?? [], isLoading: modelsLoading } = useQuery({
    queryKey: ["video-models", videoId],
    queryFn: () => getVideoModels(videoId as string),
    enabled: Boolean(videoId),
    initialData: initialModels,
  });

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
          Model{models.length !== 1 ? "s" : ""}
        </h3>
        {modelsLoading ? (
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-36 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-full" />
          </div>
        ) : models.length === 0 ? (
          <p className="text-sm text-muted-foreground">No models listed</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {models.map((m) => (
              <Link
                key={m.id}
                href={`/models/${m.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-primary2/30 bg-secondary/30 py-1 pl-1 pr-3 text-sm font-bold text-primary2 transition-colors hover:bg-primary2/15"
              >
                <span className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-secondary">
                  {m.thumbnail_url ? (
                    <img src={m.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                      ?
                    </span>
                  )}
                </span>
                {m.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
          Categories
        </h3>
        {categoriesLoading ? (
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-16" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link key={c.id} href={`/categories/${c.slug}`} className="chip hover:bg-primary/20 transition-colors">
                {c.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoMeta;
