import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/videos`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/categories`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/tags`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/models`, changeFrequency: "weekly", priority: 0.7 },
  ];

  if (!url || !key) return entries;

  const supabase = createClient(url, key);
  const [{ data: videos }, { data: categories }, { data: tags }, { data: models }] = await Promise.all([
    supabase.from("videos").select("slug, updated_at").eq("status", "ready"),
    supabase.from("categories").select("slug, created_at").eq("is_active", true),
    supabase.from("tags").select("slug, created_at"),
    supabase.from("models").select("slug, updated_at").eq("is_active", true),
  ]);

  for (const category of categories ?? []) {
    entries.push({
      url: `${SITE_URL}/categories/${category.slug}`,
      lastModified: category.created_at ? new Date(category.created_at) : undefined,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }
  for (const tag of tags ?? []) {
    entries.push({
      url: `${SITE_URL}/tags/${tag.slug}`,
      lastModified: tag.created_at ? new Date(tag.created_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  for (const model of models ?? []) {
    entries.push({
      url: `${SITE_URL}/models/${model.slug}`,
      lastModified: model.updated_at ? new Date(model.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }
  for (const video of videos ?? []) {
    entries.push({
      url: `${SITE_URL}/video/${video.slug}`,
      lastModified: video.updated_at ? new Date(video.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  return entries;
}
