import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { ModelRecord } from "@/lib/models";
import { formatCount } from "@/lib/format";

interface Props {
  model: ModelRecord;
}

const BIO_PREVIEW_LENGTH = 180;

const ModelProfile = ({ model }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const bio = model.bio?.trim() ?? "";
  const showReadMore = bio.length > BIO_PREVIEW_LENGTH;
  const displayBio = expanded || !showReadMore ? bio : `${bio.slice(0, BIO_PREVIEW_LENGTH).trim()}…`;

  return (
    <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
      <div className="relative w-full max-w-[280px] overflow-hidden rounded-xl bg-secondary aspect-[3/4] mx-auto lg:mx-0">
        {model.thumbnail_url ? (
          <img
            src={model.thumbnail_url}
            alt={`${model.name} portrait`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-foreground/10" />
        )}
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-foreground/10 pointer-events-none" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-foreground">
        {model.name}
      </h1>

      {bio && (
        <div className="w-full max-w-prose">
          <p className="text-sm leading-relaxed text-foreground/90">{displayBio}</p>
          {showReadMore && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>
      )}

      <div className="flex w-full max-w-xs items-center justify-center border-y border-foreground/10 py-4 lg:max-w-none lg:justify-start">
        <div className="flex-1 text-center lg:text-left">
          <p className="text-xl font-bold text-foreground">
            {formatCount(model.video_count ?? 0) || "0"}
          </p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Videos</p>
        </div>
      </div>

      {model.social_links.length > 0 && (
        <div className="w-full space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Social</h2>
          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            {model.social_links.map((link) => (
              <a
                key={`${link.platform}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary2/40 bg-secondary/30 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary2 transition-colors hover:bg-primary2/15"
              >
                <ExternalLink className="h-3 w-3" />
                {link.platform}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelProfile;
