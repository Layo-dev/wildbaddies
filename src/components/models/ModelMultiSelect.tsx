import { useMemo, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import type { ModelRecord } from "@/lib/models";

interface Props {
  available: ModelRecord[];
  value: ModelRecord[];
  onChange: (models: ModelRecord[]) => void;
  disabled?: boolean;
  loading?: boolean;
}

const ModelMultiSelect = ({ available, value, onChange, disabled, loading }: Props) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedIds = useMemo(() => new Set(value.map((m) => m.id)), [value]);

  const options = useMemo(
    () => available.filter((m) => !selectedIds.has(m.id)),
    [available, selectedIds],
  );

  const addModel = (model: ModelRecord) => {
    if (selectedIds.has(model.id)) return;
    onChange([...value, model]);
    setOpen(false);
  };

  const removeModel = (id: string) => {
    onChange(value.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <span className="block font-bold tracking-wider uppercase">Models</span>
        <span className="block text-sm text-muted-foreground">Select all models in this video</span>
      </div>

      <div className="relative" ref={containerRef}>
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => setOpen((v) => !v)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          className="flex w-full items-center justify-between rounded-md border border-primary/40 bg-secondary/30 px-4 py-3 text-left text-sm text-muted-foreground outline-none transition-colors hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        >
          <span>{loading ? "Loading models…" : "Select models…"}</span>
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && options.length > 0 && (
          <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-primary/40 bg-background shadow-lg">
            {options.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addModel(m)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-primary2/15"
                >
                  <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-secondary">
                    {m.thumbnail_url ? (
                      <img src={m.thumbnail_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        ?
                      </span>
                    )}
                  </span>
                  <span className="truncate text-foreground">{m.name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {open && !loading && options.length === 0 && (
          <p className="absolute z-30 mt-1 w-full rounded-md border border-primary/40 bg-background px-4 py-3 text-sm text-muted-foreground shadow-lg">
            {available.length === 0 ? "No models available." : "All models selected."}
          </p>
        )}
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selected</span>
          <div className="flex flex-wrap gap-2">
            {value.map((m) => (
              <span
                key={m.id}
                className="inline-flex items-center gap-2 rounded-full border border-primary2/40 bg-secondary/40 py-1 pl-1 pr-1.5 text-sm text-foreground"
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
                <span className="truncate max-w-[10rem]">{m.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${m.name}`}
                  disabled={disabled}
                  onClick={() => removeModel(m.id)}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-primary2/20 hover:text-foreground disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelMultiSelect;
