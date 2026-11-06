import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import type { ModelRecord } from "@/lib/models";
import { formatCount } from "@/lib/format";

interface Props {
  model: ModelRecord;
  rank: number;
}

const ModelCard = ({ model, rank }: Props) => (
  <Link href={`/models/${model.slug}`} className="group flex flex-col gap-2">
    <div className="relative overflow-hidden rounded-xl bg-secondary aspect-[3/4]">
      {model.thumbnail_url ? (
        <Image
          src={model.thumbnail_url}
          alt={`${model.name} portrait`}
          fill
          sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 640px) 25vw, 50vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-foreground/10" />
      )}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-foreground/10 pointer-events-none" />
    </div>
    <div className="text-center">
      <h3 className="truncate text-sm font-bold text-foreground transition-colors group-hover:text-primary2">
        <span className="text-primary">#{rank}</span> {model.name}
      </h3>
      <div className="mt-0.5 flex items-center justify-center gap-3 text-sm text-muted-foreground">
        <span>{formatCount(model.video_count ?? 0)} videos</span>
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {formatCount(model.total_views ?? 0)}
        </span>
      </div>
    </div>
  </Link>
);

export default ModelCard;
