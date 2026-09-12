import type { SupabaseClient } from "@supabase/supabase-js";
import type { VideoRecord, VideoSort, VideoCategory, CategoryVideosResult } from "@/lib/videos";

const VIDEO_SELECT =
  "id,title,slug,bunny_video_id,status,playback_url,thumbnail_url,duration_seconds,views,rating,created_at";

const sortToOrder = (sort: VideoSort): { col: string; ascending: boolean } => {
  switch (sort) {
    case "viewed":
      return { col: "views", ascending: false };
    case "rated":
      return { col: "rating", ascending: false };
    default:
      return { col: "created_at", ascending: false };
  }
};

export async function getVideoBySlug(
  client: SupabaseClient,
  slug: string,
): Promise<VideoRecord | null> {
  const { data, error } = await client
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as VideoRecord | null;
}

export async function listVideos(
  client: SupabaseClient,
  status: VideoRecord["status"] = "ready",
): Promise<VideoRecord[]> {
  const { data, error } = await client
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as VideoRecord[];
}

export async function listVideoCategories(
  client: SupabaseClient,
  videoId: string,
): Promise<VideoCategory[]> {
  const { data, error } = await client
    .from("video_categories")
    .select("categories:category_id ( id, name, slug )")
    .eq("video_id", videoId);

  if (error) throw new Error(error.message);

  return ((data ?? []) as Array<{ categories: VideoCategory | VideoCategory[] | null }>)
    .flatMap((row) => {
      const c = row.categories;
      if (!c) return [];
      return Array.isArray(c) ? c : [c];
    })
    .filter((c): c is VideoCategory => Boolean(c?.id && c?.name));
}

export async function getVideosByCategory(
  client: SupabaseClient,
  slug: string,
  sort: VideoSort = "recent",
): Promise<CategoryVideosResult> {
  try {
    const { data, error } = await client.functions.invoke("get-videos-by-category", {
      body: { slug, sort },
    });
    if (!error && data) {
      const payload = data as {
        category?: { id: string; name: string; slug: string } | null;
        videos?: VideoRecord[];
      };
      if (Array.isArray(payload.videos)) {
        return {
          category: payload.category ?? null,
          videos: payload.videos,
        };
      }
    }
  } catch {
    // fall through
  }

  const { data: cat, error: catErr } = await client
    .from("categories")
    .select("id,name,slug")
    .eq("slug", slug)
    .maybeSingle();
  if (catErr) throw new Error(catErr.message);
  if (!cat) return { category: null, videos: [] };

  const order = sortToOrder(sort);
  const { data: rows, error: vErr } = await client
    .from("video_categories")
    .select(`videos:video_id ( ${VIDEO_SELECT} )`)
    .eq("category_id", cat.id);
  if (vErr) throw new Error(vErr.message);

  const videos = ((rows ?? []) as Array<{ videos: VideoRecord | VideoRecord[] | null }>)
    .flatMap((r) => {
      const v = r.videos;
      if (!v) return [];
      return Array.isArray(v) ? v : [v];
    })
    .filter((v): v is VideoRecord => Boolean(v?.id) && v.status === "ready")
    .sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[order.col];
      const bv = (b as unknown as Record<string, unknown>)[order.col];
      if (typeof av === "number" && typeof bv === "number") return bv - av;
      return String(bv ?? "").localeCompare(String(av ?? ""));
    });

  return {
    category: cat as { id: string; name: string; slug: string },
    videos,
  };
}

export async function getVideosByTag(
  client: SupabaseClient,
  slug: string,
  sort: VideoSort = "recent",
): Promise<{ tag: { id: string; name: string; slug: string } | null; videos: VideoRecord[] }> {
  const { data: tag, error: tagErr } = await client
    .from("tags")
    .select("id,name,slug")
    .eq("slug", slug)
    .maybeSingle();
  if (tagErr) throw new Error(tagErr.message);
  if (!tag) return { tag: null, videos: [] };

  const order = sortToOrder(sort);
  const { data: rows, error: vErr } = await client
    .from("video_tags")
    .select(`videos:video_id ( ${VIDEO_SELECT} )`)
    .eq("tag_id", tag.id);
  if (vErr) throw new Error(vErr.message);

  const videos = ((rows ?? []) as Array<{ videos: VideoRecord | VideoRecord[] | null }>)
    .flatMap((r) => {
      const v = r.videos;
      if (!v) return [];
      return Array.isArray(v) ? v : [v];
    })
    .filter((v): v is VideoRecord => Boolean(v?.id) && v.status === "ready")
    .sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[order.col];
      const bv = (b as unknown as Record<string, unknown>)[order.col];
      if (typeof av === "number" && typeof bv === "number") return bv - av;
      return String(bv ?? "").localeCompare(String(av ?? ""));
    });

  return { tag: tag as { id: string; name: string; slug: string }, videos };
}
