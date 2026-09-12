"use client";

import { KeyboardEvent, useMemo, useRef, useState } from "react";
import { X, Tag as TagIcon } from "lucide-react";
import type { TagRecord } from "@/lib/tags";

export interface SelectedTag {
  id: string | null; // null = new tag to be created
  name: string;
}

interface Props {
  available: TagRecord[];
  value: SelectedTag[];
  onChange: (tags: SelectedTag[]) => void;
  disabled?: boolean;
  loading?: boolean;
}

const TagAutocomplete = ({ available, value, onChange, disabled, loading }: Props) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedNames = useMemo(
    () => new Set(value.map((t) => t.name.toLowerCase())),
    [value],
  );

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return available
      .filter((t) => t.name.toLowerCase().includes(q) && !selectedNames.has(t.name.toLowerCase()))
      .slice(0, 8);
  }, [query, available, selectedNames]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    return available.find((t) => t.name.toLowerCase() === q) ?? null;
  }, [query, available]);

  const addTag = (tag: SelectedTag) => {
    const name = tag.name.trim();
    if (!name || selectedNames.has(name.toLowerCase())) return;
    onChange([...value, { id: tag.id, name }]);
    setQuery("");
    setOpen(false);
    setHighlight(0);
  };

  const removeTag = (name: string) => {
    onChange(value.filter((t) => t.name !== name));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, Math.max(suggestions.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (open && suggestions[highlight]) {
        const s = suggestions[highlight];
        addTag({ id: s.id, name: s.name });
      } else if (query.trim()) {
        addTag(exactMatch ? { id: exactMatch.id, name: exactMatch.name } : { id: null, name: query });
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !query && value.length > 0) {
      removeTag(value[value.length - 1].name);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <span className="block font-bold tracking-wider uppercase">Tags</span>
        <span className="block text-sm text-muted-foreground">
          Type to search. Press Enter to add a new tag.
        </span>
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag.name}
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-secondary/40 py-1 pl-2 pr-1 text-sm text-foreground"
            >
              <TagIcon className="h-3.5 w-3.5 text-primary" />
              <span className="truncate max-w-[12rem]">{tag.name}</span>
              {tag.id === null && (
                <span className="text-[10px] uppercase tracking-wider text-primary">new</span>
              )}
              <button
                type="button"
                aria-label={`Remove ${tag.name}`}
                disabled={disabled}
                onClick={() => removeTag(tag.name)}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-foreground disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          disabled={disabled}
          placeholder={loading ? "Loading tags…" : "Add a tag"}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          className="w-full rounded-md border border-primary/40 bg-secondary/30 px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />

        {open && query.trim() && (
          <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-primary/40 bg-background shadow-lg">
            {suggestions.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addTag({ id: s.id, name: s.name })}
                  onMouseEnter={() => setHighlight(i)}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                    i === highlight ? "bg-primary/15 text-foreground" : "text-foreground/85"
                  }`}
                >
                  <TagIcon className="h-3.5 w-3.5 text-primary" />
                  {s.name}
                </button>
              </li>
            ))}
            {!exactMatch && (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addTag({ id: null, name: query })}
                  className="w-full px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
                >
                  Create “{query.trim()}”
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TagAutocomplete;
