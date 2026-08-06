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

  // Temporary response
  return res.status(200).json({
    videos,
    categories,
  });
}