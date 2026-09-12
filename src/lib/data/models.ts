import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapModelRow,
  type ModelBySlugResult,
  type ModelRecord,
} from "@/lib/models";
import type { VideoRecord } from "@/lib/videos";

const VIDEO_SELECT =
  "id,title,slug,bunny_video_id,status,playback_url,thumbnail_url,duration_seconds,views,rating,created_at";

export async function listModels(client: SupabaseClient): Promise<ModelRecord[]> {
  const { data, error } = await client
    .from("models")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapModelRow(row as Record<string, unknown>));
}

export async function getModelBySlug(
  client: SupabaseClient,
  slug: string,
): Promise<ModelBySlugResult> {
  const { data: modelRow, error: modelErr } = await client
    .from("models")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (modelErr) throw new Error(modelErr.message);
  if (!modelRow) return { model: null, videos: [] };

  const model = mapModelRow(modelRow as Record<string, unknown>);

  const { data: rows, error: vErr } = await client
    .from("video_models")
    .select(`videos:video_id ( ${VIDEO_SELECT} )`)
    .eq("model_id", model.id);

  if (vErr) throw new Error(vErr.message);

  const videos = ((rows ?? []) as Array<{ videos: VideoRecord | VideoRecord[] | null }>)
    .flatMap((row) => {
      const v = row.videos;
      if (!v) return [];
      return Array.isArray(v) ? v : [v];
    })
    .filter((v): v is VideoRecord => Boolean(v?.id) && v.status === "ready");

  return {
    model: { ...model, video_count: model.video_count ?? videos.length },
    videos,
  };
}

export async function getVideoModels(
  client: SupabaseClient,
  videoId: string,
): Promise<ModelRecord[]> {
  const { data, error } = await client
    .from("video_models")
    .select("models:model_id ( * )")
    .eq("video_id", videoId);

  if (error) throw new Error(error.message);

  return ((data ?? []) as Array<{ models: Record<string, unknown> | Record<string, unknown>[] | null }>)
    .flatMap((row) => {
      const m = row.models;
      if (!m) return [];
      return Array.isArray(m) ? m : [m];
    })
    .map((row) => mapModelRow(row))
    .filter((m) => m.is_active);
}
