import type { Metadata } from "next";
import { Suspense } from "react";
import SearchPage from "@/views/SearchPage";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Wild Baddies videos.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE_URL}/search` },
};

export default function SearchRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchPage />
    </Suspense>
  );
}
