import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import { listCategories } from "@/lib/categories";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Explore Wild Baddies categories — free Latina, Ebony, Thick, Amateur and OnlyFans baddies porn videos. New explicit clips every day. Browse and watch.",
  alternates: { canonical: `${SITE_URL}/categories` },
};

export default async function CategoriesRoute() {
  let categories = [];
  let error: string | null = null;
  try {
    categories = await listCategories();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load categories.";
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container py-10 sm:py-16">
          <h1 className="text-center text-4xl sm:text-6xl font-bold uppercase text-white tracking-tight">
            Categories
          </h1>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8">
            {categories.map((c) => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
          {error && <p className="mt-10 text-center text-sm text-destructive">{error}</p>}
          {!error && categories.length === 0 && (
            <p className="mt-10 text-center text-muted-foreground">No categories yet.</p>
          )}
          {categories.length > 0 && (
            <div className="mt-8 text-right text-sm text-muted-foreground">
              {categories.length} categories
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
