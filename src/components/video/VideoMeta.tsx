import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { listVideoCategories } from "@/lib/videos";

interface VideoMetaProps {
  videoId?: string;
}

const VideoMeta = ({ videoId }: VideoMetaProps) => {
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["video-categories", videoId],
    queryFn: () => listVideoCategories(videoId as string),
    enabled: Boolean(videoId),
  });

  return (
    <div className="mt-8 space-y-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
          Categories
        </h3>
        {isLoading ? (
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
              <Link key={c.id} to={`/categories/${c.slug}`} className="chip hover:bg-primary/20 transition-colors">
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