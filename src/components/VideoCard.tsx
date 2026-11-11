import { Eye, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ModelRecord } from "@/lib/models";

interface VideoCardProps {
  slug?: string;
  title: string;
  duration?: string;
  durationSeconds?: number | null;
  views: string | number;
  rating: string | number;
  thumbnailUrl?: string | null;
  models?: Pick<ModelRecord, "id" | "name" | "slug">[];
}

const formatDuration = (durationSeconds?: number | null, duration?: string) => {
  if (typeof duration === "string" && duration.trim()) {
    return duration;
  }

  if (!durationSeconds || durationSeconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(durationSeconds / 60);
  const secs = `${durationSeconds % 60}`.padStart(2, "0");
  return `${mins}:${secs}`;
};

const VideoCard = ({
  slug,
  title,
  duration,
  durationSeconds,
  views,
  rating,
  thumbnailUrl,
  models = [],
}: VideoCardProps) => {
  const fallbackSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "video";
  const videoSlug = slug ?? fallbackSlug;
  return (
    <article className="flex flex-col gap-2">
      <Link href={`/video/${videoSlug}`} className="group">
        <div className="relative overflow-hidden rounded-lg bg-secondary aspect-video">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={`${title} thumbnail`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-black" />
          )}
          <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-lg pointer-events-none" />
          <div className="absolute top-2 right-2 rounded bg-black/75 px-2 py-0.5 text-xs font-bold text-white">
            {formatDuration(durationSeconds, duration)}
          </div>
        </div>
      </Link>
      <div className="text-center px-4 sm:px-0">
        <Link href={`/video/${videoSlug}`}>
          <h3 className="text-base font-bold text-white truncate">{title}</h3>
        </Link>
        <div className="mt-1 flex min-w-0 items-center justify-center gap-3 text-sm text-muted-foreground">
          {models.length > 0 && (
            <span className="min-w-0 max-w-[40%] truncate text-sm font-normal text-primary2">
              {models.map((model, index) => (
                <span key={model.id}>
                  {index > 0 && ", "}
                  <Link href={`/models/${model.slug}`} className="hover:underline">
                    {model.name}
                  </Link>
                </span>
              ))}
            </span>
          )}
          <Link href={`/video/${videoSlug}`} className="inline-flex shrink-0 items-center gap-1">
            <Eye className="h-3.5 w-3.5" /> {views}
          </Link>
          <Link href={`/video/${videoSlug}`} className="inline-flex shrink-0 items-center gap-1">
            <Star className="h-3.5 w-3.5 text-primary" /> {rating}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default VideoCard;