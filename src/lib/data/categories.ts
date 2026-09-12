import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryRecord } from "@/lib/categories";

const toNumber = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "category";

export async function listCategories(client: SupabaseClient): Promise<CategoryRecord[]> {
  const { data, error } = await client
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => {
    const name = String(row.name ?? "");
    return {
      id: String(row.id ?? ""),
      name,
      slug: String(row.slug ?? slugify(name)),
      thumbnail_url:
        (row.thumbnail_url as string | null) ??
        (row.image_url as string | null) ??
        (row.cover_url as string | null) ??
        null,
      video_count: toNumber(row.video_count ?? row.videos_count ?? row.count),
      total_views: toNumber(row.total_views ?? row.views ?? row.views_count),
      rating: toNumber(row.rating ?? row.avg_rating),
      is_active: Boolean(row.is_active ?? true),
    } as CategoryRecord;
  });
}
