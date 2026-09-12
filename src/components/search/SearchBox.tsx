"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  searchVideoSuggestions,
  type VideoSuggestion,
} from "@/lib/videos";

interface SearchBoxProps {
  className?: string;
  placeholder?: string;
  initialQuery?: string;
  onSubmit?: (query: string) => void;
}

const MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

const SearchBox = ({
  className = "",
  placeholder = "SEARCH",
  initialQuery = "",
  onSubmit,
}: SearchBoxProps) => {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<VideoSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce the input value
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const q = debounced.trim();
    if (q.length < MIN_CHARS) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    searchVideoSuggestions(q, 6, ctrl.signal)
      .then((res) => {
        setSuggestions(res);
        setActiveIndex(-1);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [debounced]);

  // Close on outside click
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const trimmed = query.trim();
  const showDropdown = open && trimmed.length >= MIN_CHARS;

  const goToSearch = (q: string) => {
    const value = q.trim();
    if (!value) return;
    setOpen(false);
    onSubmit?.(value);
    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  const goToVideo = (slug: string) => {
    setOpen(false);
    router.push(`/video/${slug}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (e.key === "Enter") goToSearch(query);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        goToVideo(suggestions[activeIndex].slug);
      } else {
        goToSearch(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const dropdownState = useMemo(() => {
    if (loading) return "loading" as const;
    if (suggestions.length === 0) return "empty" as const;
    return "results" as const;
  }, [loading, suggestions.length]);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Search className="h-5 w-5" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search videos"
          className="w-full bg-transparent border-none outline-none text-base font-bold tracking-wider placeholder:text-muted-foreground"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-md border border-border bg-card shadow-lg overflow-hidden">
          {dropdownState === "loading" && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching…
            </div>
          )}

          {dropdownState === "empty" && !loading && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              No results for "{trimmed}"
            </div>
          )}

          {dropdownState === "results" && (
            <ul className="max-h-80 overflow-y-auto py-1">
              {suggestions.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => goToVideo(s.slug)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                      i === activeIndex ? "bg-secondary" : "hover:bg-secondary/60"
                    }`}
                  >
                    <div className="h-10 w-16 shrink-0 rounded bg-muted overflow-hidden">
                      {s.thumbnail_url && (
                        <img
                          src={s.thumbnail_url}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white line-clamp-2">
                      {s.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={() => goToSearch(query)}
            className="w-full px-3 py-2 border-t border-border text-sm font-extrabold uppercase tracking-widest text-primary hover:bg-secondary transition-colors text-left"
          >
            See all results for "{trimmed}"
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchBox;