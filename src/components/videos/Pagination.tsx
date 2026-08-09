import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

const buildPages = (page: number, total: number): Array<number | "..."> => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, total, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: Array<number | "..."> = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) out.push("...");
    out.push(p);
  });
  return out;
};

const Pagination = ({ page, totalPages, onChange }: Props) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary2 text-primary-foreground disabled:opacity-40 hover:bg-foreground/20 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {buildPages(page, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="px-1 text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-bold transition-colors ${
              p === page
                ? "bg-primary text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.6)]"
                : "bg-foreground/10 text-foreground hover:bg-foreground/20"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-foreground/10 text-foreground disabled:opacity-40 hover:bg-foreground/20 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
};

export default Pagination;