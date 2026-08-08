import type { ModelRecord } from "@/lib/models";

interface Props {
  model: ModelRecord;
  rank: number;
}

const ModelCard = ({ model, rank }: Props) => (
  <div className="group flex flex-col gap-2">
    <div className="relative overflow-hidden rounded-xl bg-secondary aspect-[3/4]">
      {model.thumbnail_url ? (
        <img
          src={model.thumbnail_url}
          alt={`${model.name} portrait`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="h-full w-full bg-foreground/10" />
      )}
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-foreground/10 pointer-events-none" />
    </div>
    <div className="text-center">
      <h3 className="truncate text-sm font-bold text-foreground">
        <span className="text-primary">#{rank}</span> {model.name}
      </h3>
      {model.bio && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{model.bio}</p>
      )}
    </div>
  </div>
);

export default ModelCard;