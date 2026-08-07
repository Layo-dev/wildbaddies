import { supabase } from "@/integrations/supabase/client";

export interface TagRecord {
  id: string;
  name: string;
  slug: string;
}

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "tag";

export const listTags = async (): Promise<TagRecord[]> => {
  const client = ensureSupabase();
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
};

/** Group tags by first character: "#" for non-letters, else uppercase letter. */
export const groupTags = (tags: TagRecord[]): Array<{ letter: string; tags: TagRecord[] }> => {
  const map = new Map<string, TagRecord[]>();
  for (const tag of tags) {
    const first = tag.name[0]?.toUpperCase() ?? "#";
    const letter = /[A-Z]/.test(first) ? first : "#";
    const list = map.get(letter);
    if (list) list.push(tag);
    else map.set(letter, [tag]);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => (a === "#" ? -1 : b === "#" ? 1 : a.localeCompare(b)))
    .map(([letter, list]) => ({ letter, tags: list }));
};
