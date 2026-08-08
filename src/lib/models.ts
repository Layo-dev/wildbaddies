import { supabase } from "@/integrations/supabase/client";

export interface ModelRecord {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string | null;
}

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "model";

export const listModels = async (): Promise<ModelRecord[]> => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("models")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: Record<string, unknown>) => {
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
    } as ModelRecord;
  });
};