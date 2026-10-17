import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/seo";

// Rebuild at most once an hour instead of only at deploy time.
export const revalidate = 3600;

// ── Which pages deserve to be advertised to Google ───────────────────────────
// Hub pages (category / tag / model) with 0–1 videos are near-empty pages.
// Listing them wastes crawl budget and drags down the site's quality signal.
const MIN_CATEGORY_VIDEOS = 3;
const MIN_TAG_VIDEOS = 3;
const MIN_MODEL_VIDEOS = 2;

// Keep in sync with NOINDEX_THIN_PAGES in app/video/[slug]/page.tsx:
// a URL must never be both in the sitemap and noindex.
const EXCLUDE_THIN_VIDEOS = false;

const PAGE = 1000; // Supabase returns max 1000 rows per request

type Row = Record<string, any>;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/videos` },
    { url: `${SITE_URL}/categories` },
    { url: `${SITE_URL}/models` },
    { url: `${SITE_URL}/tags` },
  ];
  if (!url || !key) return staticEntries;

  const supabase = createClient(url, key);

  // Fetch every row (paged) so the sitemap doesn't silently stop at 1000.
  // Throws on error: a failed build keeps the previously cached sitemap,
  // whereas a half-empty sitemap would make URLs disappear.
  async function fetchAll(table: string, columns: string, filter?: (q: any) => any): Promise<Row[]> {
    const rows: Row[] = [];
    for (let from = 0; ; from += PAGE) {
      let q: any = supabase.from(table).select(columns).order("id");
      if (filter) q = filter(q);
      const { data, error } = await q.range(from, from + PAGE - 1);
      if (error) throw error;
      rows.push(...(data ?? []));
      if (!data || data.length < PAGE) break;
    }
    return rows;
  }

  const [videos, categories, tags, models, videoCategories, videoTags, videoModels] = await Promise.all([
    // The service-role key bypasses RLS, so visibility must be filtered here.
    fetchAll("videos", "id, slug, created_at, meta_description", (q) =>
      q.eq("status", "ready").eq("is_public", true).eq("is_approved", true).eq("is_flagged", false),
    ),
    fetchAll("categories", "id, slug", (q) => q.eq("is_active", true)),
    fetchAll("tags", "id, slug", (q) => q.eq("is_active", true)),
    fetchAll("models", "id, slug", (q) => q.eq("is_active", true)),
    fetchAll("video_categories", "video_id, category_id"),
    fetchAll("video_tags", "video_id, tag_id"),
    fetchAll("video_models", "video_id, model_id"),
  ]);

  // video id -> created_at (ms). Only visible videos are counted.
  const createdAt = new Map<string, number>();
  for (const v of videos) createdAt.set(v.id, new Date(v.created_at).getTime());

  // Real counts from the join tables. (The stored counters are stale:
  // 31 of 53 tag counters were wrong when I checked.)
  function tally(joinRows: Row[], hubKey: string) {
    const stats = new Map<string, { count: number; latest: number }>();
    for (const r of joinRows) {
      const t = createdAt.get(r.video_id);
      if (t === undefined) continue;
      const s = stats.get(r[hubKey]) ?? { count: 0, latest: 0 };
      s.count += 1;
      if (t > s.latest) s.latest = t;
      stats.set(r[hubKey], s);
    }
    return stats;
  }
  const catStats = tally(videoCategories, "category_id");
  const tagStats = tally(videoTags, "tag_id");
  const modelStats = tally(videoModels, "model_id");

  const videosWithModel = new Set(videoModels.map((r) => r.video_id));
  const latestVideo = videos.reduce((max, v) => Math.max(max, createdAt.get(v.id) ?? 0), 0);

  const entries: MetadataRoute.Sitemap = staticEntries.map((e) =>
    e.url === `${SITE_URL}/` || e.url === `${SITE_URL}/videos`
      ? { ...e, lastModified: latestVideo ? new Date(latestVideo) : undefined }
      : e,
  );

  function addHubs(rows: Row[], stats: Map<string, { count: number; latest: number }>, path: string, min: number) {
    for (const row of rows) {
      const s = stats.get(row.id);
      if (!s || s.count < min) continue;
      entries.push({
        url: `${SITE_URL}/${path}/${row.slug}`,
        // Newest video in the hub, not the hub's creation date.
        lastModified: new Date(s.latest),
      });
    }
  }
  addHubs(categories, catStats, "categories", MIN_CATEGORY_VIDEOS);
  addHubs(tags, tagStats, "tags", MIN_TAG_VIDEOS);
  addHubs(models, modelStats, "models", MIN_MODEL_VIDEOS);

  const sortedVideos = [...videos].sort((a, b) => (createdAt.get(b.id) ?? 0) - (createdAt.get(a.id) ?? 0));
  for (const v of sortedVideos) {
    if (!v.slug) continue;
    const isThin = !videosWithModel.has(v.id) && !v.meta_description;
    if (EXCLUDE_THIN_VIDEOS && isThin) continue;
    entries.push({
      url: `${SITE_URL}/video/${v.slug}`,
      // created_at, NOT updated_at: a database trigger bumps updated_at on every
      // view-count update, so it changes constantly without any content change
      // (49 videos in the last 24h). Switch to updated_at after the optional
      // trigger fix below.
      lastModified: new Date(v.created_at),
    });
  }

  return entries;
}