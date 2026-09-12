"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { listTags, groupTags } from "@/lib/tags";

const TagsPage = () => {
  const { data: tags = [], isLoading, isError, error } = useQuery({
    queryKey: ["tags"],
    queryFn: listTags,
  });

  useEffect(() => {
    document.title = "Tags | Wild Baddies";
  }, []);

  const groups = groupTags(tags);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="container py-10 sm:py-16">
          <h1 className="text-center text-4xl sm:text-6xl font-bold uppercase text-foreground tracking-tight">
            Tags
          </h1>

          {isLoading && (
            <div className="mt-10 columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-[9] gap-x-6">
              {Array.from({ length: 36 }).map((_, i) => (
                <Skeleton key={i} className="mb-3 h-4 w-3/4 break-inside-avoid" />
              ))}
            </div>
          )}

          {isError && (
            <p className="mt-10 text-center text-sm text-destructive">
              {error instanceof Error ? error.message : "Failed to load tags."}
            </p>
          )}

          {!isLoading && !isError && tags.length === 0 && (
            <p className="mt-10 text-center text-muted-foreground">No tags yet.</p>
          )}

          {!isLoading && !isError && groups.length > 0 && (
            <div className="mt-10 columns-2 sm:columns-3 md:columns-4 lg:columns-6 xl:columns-[9] gap-x-6">
              {groups.map((group) => (
                <div key={group.letter} className="mb-8 break-inside-avoid">
                  <h2 className="mb-2 text-lg font-bold uppercase text-foreground">
                    {group.letter}
                  </h2>
                  <ul className="space-y-2">
                    {group.tags.map((tag) => (
                      <li key={tag.id}>
                        <Link
                          href={`/search?q=${encodeURIComponent(tag.name)}`}
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

          {!isLoading && !isError && tags.length > 0 && (
            <div className="mt-4 text-right text-sm text-muted-foreground">{tags.length} tags</div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TagsPage;
