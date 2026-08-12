import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Fetch videos
  const { data: videos, error: videosError } = await supabase
    .from("videos")
    .select("slug, updated_at")
    .eq("status", "ready")
    .eq("is_public", true)
    .eq("is_approved", true);

  if (videosError) {
    return res.status(500).send(videosError.message);
  }

  // Fetch categories
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("slug, created_at")
    .eq("is_active", true);

  if (categoriesError) {
    return res.status(500).send(categoriesError.message);
  }

  // Fetch tags
  const { data: tags, error: tagsError } = await supabase
    .from("tags")
    .select("slug, created_at")
    .eq("is_active", true);

  if (tagsError) {
    return res.status(500).send(tagsError.message);
  }

  // Fetch models
  const { data: models, error: modelsError } = await supabase
    .from("models")
    .select("slug, updated_at")
    .eq("is_active", true);

  if (modelsError) {
    return res.status(500).send(modelsError.message);
  }

  const baseUrl = "https://wildbaddies.com";

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Homepage
  xml += `
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // Categories
  for (const category of categories ?? []) {
    xml += `
  <url>
    <loc>${baseUrl}/categories/${category.slug}</loc>
    <lastmod>${new Date(category.created_at).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Tags
  for (const tag of tags ?? []) {
    xml += `
  <url>
    <loc>${baseUrl}/tags/${tag.slug}</loc>
    <lastmod>${new Date(tag.created_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  // Models
  for (const model of models ?? []) {
    xml += `
  <url>
    <loc>${baseUrl}/models/${model.slug}</loc>
    <lastmod>${new Date(model.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Videos
  for (const video of videos ?? []) {
    xml += `
  <url>
    <loc>${baseUrl}/video/${video.slug}</loc>
    <lastmod>${new Date(video.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  return res.status(200).send(xml);
}