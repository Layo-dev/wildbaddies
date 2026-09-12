import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { listTags, groupTags } from "@/lib/tags";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Tags",
  description:
    "Browse every Wild Baddies tag from A to Z — find baddies, models, categories and niches, then jump straight to the videos.",
  alternates: { canonical: `${SITE_URL}/tags` },
};

export default async function TagsRoute() {
  let tags = [];
  let error: string | null = null;
  try {
    tags = await listTags();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load tags.";
  }
  const groups = groupTags(tags);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-10 sm:py-16">
          <h1 className="text-center text-4xl sm:text-6xl font-bold uppercase text-foreground tracking-tight">
            Tags
          </h1>
          {error && <p className="mt-10 text-center text-sm text-destructive">{error}</p>}
          {!error && tags.length === 0 && (
            <p className="mt-10 text-center text-muted-foreground">No tags yet.</p>
          )}
          {groups.length > 0 && (
            <div className="mt-10 columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-[9] gap-x-6">
              {groups.map((group) => (
                <div key={group.letter} className="mb-8 break-inside-avoid">
                  <h2 className="mb-2 text-lg font-bold uppercase text-foreground">{group.letter}</h2>
                  <ul className="space-y-2">
                    {group.tags.map((tag) => (
                      <li key={tag.id}>
                        <Link
                          href={`/tags/${tag.slug}`}
                          className="text-sm leading-snug text-muted-foreground transition-colors hover:text-primary"
                        >
                          {tag.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {tags.length > 0 && (
            <div className="mt-4 text-right text-sm text-muted-foreground">{tags.length} tags</div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
