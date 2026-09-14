import type { Metadata } from "next";
import { ChevronDown, Search as SearchIcon, BadgeCheck, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModelCard from "@/components/models/ModelCard";
import { listModels } from "@/lib/models";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Models",
  description: "Meet the models featured on Wild Baddies — browse verified creators and collabs.",
  alternates: { canonical: `${SITE_URL}/models` },
  openGraph: {
    title: "Models | Wild Baddies",
    description: "Meet the models featured on Wild Baddies.",
    url: `${SITE_URL}/models`,
    type: "website",
  },
};

export default async function ModelsRoute() {
  let models = [];
  let error: string | null = null;
  try {
    models = await listModels();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load models.";
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container py-8 sm:py-12">
          <h1 className="text-center text-3xl sm:text-5xl font-bold uppercase tracking-tight text-foreground">
            Models
          </h1>
          <div className="mt-6 flex flex-col items-center gap-4 lg:flex-row lg:justify-between">
            <div className="hidden lg:flex items-center gap-2 text-sm">
              <SearchIcon className="h-4 w-4 text-primary" />
              <input
                type="text"
                placeholder="Model search"
                aria-label="Model search"
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-bold uppercase tracking-wide">
              <span className="text-primary">All Models</span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <BadgeCheck className="h-4 w-4" /> Verified
              </span>
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Star className="h-4 w-4" /> Collab
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-bold uppercase tracking-wide text-primary2">
              <span className="inline-flex items-center gap-1">
                Most Viewed <ChevronDown className="h-4 w-4" />
              </span>
              <span className="inline-flex items-center gap-1">
                All Categories <ChevronDown className="h-4 w-4" />
              </span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-8">
            {models.map((m, i) => (
              <ModelCard key={m.id} model={m} rank={i + 1} />
            ))}
          </div>
          {error && <p className="mt-10 text-center text-sm text-destructive">{error}</p>}
          {!error && models.length === 0 && (
            <p className="mt-10 text-center text-muted-foreground">No models yet.</p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
