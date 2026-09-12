import type { Metadata } from "next";
import { Suspense } from "react";
import VideosPage from "@/views/VideosPage";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Videos",
  description:
    "Browse every video on Wild Baddies — filter by duration and category, sorted by most recent, most viewed or best rated.",
  alternates: { canonical: `${SITE_URL}/videos` },
};

export default function VideosRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <VideosPage />
    </Suspense>
  );
}
