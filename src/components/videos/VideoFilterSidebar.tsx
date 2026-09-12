import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCount } from "@/lib/format";
import type { CategoryRecord } from "@/lib/categories";

export const DURATION_STEPS = [0, 1, 5, 10, 15, 20, 30] as const;
export type DurationMin = (typeof DURATION_STEPS)[number];

interface Props {
  categories: CategoryRecord[];
  loading?: boolean;
  minDuration: DurationMin;
  onMinDurationChange: (value: DurationMin) => void;
  activeCategory: string | null;
  onCategoryChange: (slug: string | null) => void;
}

const VideoFilterSidebar = ({
  categories,
  loading,
  minDuration,
  onMinDurationChange,
  activeCategory,
  onCategoryChange,
}: Props) => {
  const activeIndex = DURATION_STEPS.indexOf(minDuration);
  const fillPct = (activeIndex / (DURATION_STEPS.length - 1)) * 100;

  return (
    <aside className="w-full lg:w-[260px] shrink-0">
      {/* Duration */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Duration <span className="text-muted-foreground font-normal">minutes</span>
        </h2>

        <div className="mt-5 relative h-1.5 rounded-full bg-foreground/15">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
            style={{ width: `${Math.max(fillPct, 2)}%` }}
          />
          <div
            className="absolute -top-1.5 h-[18px] w-[18px] -translate-x-1/2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)] transition-all"
            style={{ left: `${fillPct}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          {DURATION_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onMinDurationChange(step)}
              className={`text-sm transition-colors ${
                step === minDuration
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {step === 30 ? "30+" : step}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="mt-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Categories</h2>

        {loading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-32" />
            ))}
          </div>
        ) : (
          <ul className="mt-4 space-y-2.5">
            <li>
              <button
                type="button"
                onClick={() => onCategoryChange(null)}
                className={`text-sm transition-colors ${
                  activeCategory === null ? "text-primary font-bold" : "text-foreground/85 hover:text-primary"
                }`}
              >
                All Videos
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id} className="flex items-baseline gap-2">
                <button
                  type="button"
                  onClick={() => onCategoryChange(c.slug)}
                  className={`text-sm text-left transition-colors ${
                    activeCategory === c.slug
                      ? "text-primary font-bold"
                      : "text-foreground/85 hover:text-primary"
                  }`}
                >
                  {c.name}
                </button>
                <span className="text-xs text-muted-foreground">{formatCount(c.video_count ?? 0)}</span>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/categories"
          className="mt-5 inline-block text-xs font-bold uppercase tracking-widest text-primary hover:opacity-80"
        >
          Browse all categories
        </Link>
      </div>
    </aside>
  );
};

export default VideoFilterSidebar;