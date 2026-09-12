"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ModelProfile from "@/components/models/ModelProfile";
import SortableVideoGrid from "@/components/videos/SortableVideoGrid";
import { incrementModelProfileView } from "@/lib/models";
import type { ModelBySlugResult, ModelRecord } from "@/lib/models";

interface Props {
  initial: ModelBySlugResult;
}

export default function ModelProfileClient({ initial }: Props) {
  const [data, setData] = useState(initial);
  const viewTrackedRef = useRef<string | null>(null);
  const model = data.model;

  useEffect(() => {
    if (!model?.id || viewTrackedRef.current === model.id) return;
    viewTrackedRef.current = model.id;
    incrementModelProfileView(model.id);
    setData((prev) => {
      if (!prev.model) return prev;
      return {
        ...prev,
        model: { ...prev.model, profile_views: (prev.model.profile_views ?? 0) + 1 },
      };
    });
  }, [model?.id]);

  const handleModelUpdate = (patch: Partial<ModelRecord>) => {
    setData((prev) => {
      if (!prev.model) return prev;
      return { ...prev, model: { ...prev.model, ...patch } };
    });
  };

  const videos = useMemo(() => data.videos, [data.videos]);

  if (!model) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="container py-8 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,280px)_1fr] gap-10 lg:gap-14">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <ModelProfile model={model} onModelUpdate={handleModelUpdate} />
            </aside>
            <div>
              <h2 className="text-center text-3xl sm:text-4xl font-bold uppercase tracking-tight text-foreground">
                Videos
              </h2>
              <SortableVideoGrid videos={videos} emptyMessage="No videos for this model yet." />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
