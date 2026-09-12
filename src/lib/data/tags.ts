import type { SupabaseClient } from "@supabase/supabase-js";
import type { TagRecord } from "@/lib/tags";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tag";

export async function listTags(client: SupabaseClient): Promise<TagRecord[]> {
  const { data, error } = await client.from("tags").select("*");

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row: Record<string, unknown>) => {
      const name = String(row.name ?? row.title ?? "").trim();
      return {
        id: String(row.id ?? name),
        name,
        slug: String(row.slug ?? slugify(name)),
      } as TagRecord;
    })
    .filter((t) => t.name.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}
