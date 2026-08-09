import { ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCount } from "@/lib/format";
import type { CategoryRecord } from "@/lib/categories";
import type { DurationMin } from "./VideoFilterSidebar";
import { DURATION_STEPS } from "./VideoFilterSidebar";
import type { VideoSort } from "@/lib/videos";

const SORT_LABELS: Record<VideoSort, string> = {
  recent: "Most Recent",
  viewed: "Most Viewed",
  rated: "Best Rated",
};

const durationLabel = (m: DurationMin) => (m === 0 ? "Any Duration" : m === 30 ? "30+ Min" : `${m}+ Min`);

interface Props {
  sort: VideoSort;
  onSortChange: (s: VideoSort) => void;
  minDuration: DurationMin;
  onMinDurationChange: (m: DurationMin) => void;
  categories: CategoryRecord[];
  loading?: boolean;
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
}

const MobileVideoFilters = ({
  sort,
  onSortChange,
  minDuration,
  onMinDurationChange,
  categories,
  loading,
  activeCategory,
  onCategoryChange,
  expanded,
  onToggleExpanded,
}: Props) => {
  const visible = expanded ? categories : categories.slice(0, 8);

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-primary2">
            {SORT_LABELS[sort]} <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {(Object.keys(SORT_LABELS) as VideoSort[]).map((s) => (
              <DropdownMenuItem key={s} onSelect={() => onSortChange(s)}>
                {SORT_LABELS[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wide text-primary2">
            {durationLabel(minDuration)} <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {DURATION_STEPS.map((d) => (
              <DropdownMenuItem key={d} onSelect={() => onMinDurationChange(d)}>
                {durationLabel(d)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 px-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-24 rounded-md" />)
          : visible.map((c) => {
              const active = activeCategory === c.slug;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCategoryChange(active ? null : c.slug)}
                  className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/20 text-primary ring-1 ring-primary"
                      : "bg-foreground/10 text-foreground hover:bg-foreground/15"
                  }`}
                >
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground text-xs">{formatCount(c.video_count ?? 0)}</span>
                </button>
              );
            })}

        {!loading && categories.length > 8 && (
          <button
            type="button"
            onClick={onToggleExpanded}
            className="rounded-md border border-primary px-3.5 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileVideoFilters;