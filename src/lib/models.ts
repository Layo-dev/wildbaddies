import { supabase } from "@/integrations/supabase/client";
import type { VideoRecord } from "@/lib/videos";

export interface ModelRecord {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string | null;
  video_count: number | null;
  subscribers_count: number | null;
  profile_views: number | null;
  instagram_url: string | null;
  twitter_url: string | null;
  tiktok_url: string | null;
  onlyfans_url: string | null;
  fansly_url: string | null;
}

export interface ModelBySlugResult {
  model: ModelRecord | null;
  videos: VideoRecord[];
}

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "model";

const toNumber = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const toUrl = (v: unknown): string | null => {
  const url = String(v ?? "").trim();
  return url || null;
};

export const mapModelRow = (row: Record<string, unknown>): ModelRecord => {
  const name = String(row.name ?? "").trim();
  return {
    id: String(row.id ?? name),
    name,
    slug: String(row.slug ?? slugify(name)),
    bio: (row.bio as string | null) ?? null,
    thumbnail_url:
      (row.thumbnail_url as string | null) ??
      (row.image_url as string | null) ??
      (row.avatar_url as string | null) ??
      null,
    is_active: Boolean(row.is_active ?? true),
    created_at: (row.created_at as string | null) ?? null,
    video_count: toNumber(row.video_count ?? row.videos_count ?? row.count),
    subscribers_count: toNumber(row.subscribers_count ?? row.subscriber_count),
    profile_views: toNumber(row.profile_views ?? row.profile_view_count),
    instagram_url: toUrl(row.instagram_url),
    twitter_url: toUrl(row.twitter_url ?? row.x_url),
    tiktok_url: toUrl(row.tiktok_url),
    onlyfans_url: toUrl(row.onlyfans_url),
    fansly_url: toUrl(row.fansly_url),
  };
};

const VIDEO_SELECT =
  "id,title,slug,bunny_video_id,status,playback_url,thumbnail_url,duration_seconds,views,rating,created_at";

export async function incrementModelProfileView(modelId: string): Promise<void> {
  const client = ensureSupabase();
  const { error } = await client.rpc("increment_model_profile_view", {
    p_model_id: modelId,
  });
  if (error) {
    console.error("Failed to increment profile view:", error);
  }
}

export const isSubscribedToModel = async (userId: string, modelId: string): Promise<boolean> => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("model_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("model_id", modelId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return Boolean(data);
};

export const subscribeToModel = async (userId: string, modelId: string): Promise<void> => {
  const client = ensureSupabase();
  const { error } = await client
    .from("model_subscriptions")
    .insert({ user_id: userId, model_id: modelId });

  if (error) throw new Error(error.message);
};

export const unsubscribeFromModel = async (userId: string, modelId: string): Promise<void> => {
  const client = ensureSupabase();
  const { error } = await client
    .from("model_subscriptions")
    .delete()
    .eq("user_id", userId)
    .eq("model_id", modelId);

  if (error) throw new Error(error.message);
};

export const listModels = async (): Promise<ModelRecord[]> => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("models")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapModelRow(row as Record<string, unknown>));
};

export const getVideoModels = async (videoId: string): Promise<ModelRecord[]> => {
  const client = ensureSupabase();
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
};

export const getModelBySlug = async (slug: string): Promise<ModelBySlugResult> => {
  const client = ensureSupabase();

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

  const videoCount = model.video_count ?? videos.length;

  return {
    model: { ...model, video_count: videoCount },
    videos,
  };
};
