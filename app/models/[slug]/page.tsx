import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getModelBySlug } from "@/lib/models";
import ModelProfileClient from "@/components/models/ModelProfileClient";
import { SITE_URL } from "@/lib/seo";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { model, videos } = await getModelBySlug(slug);
  if (!model) return { title: "Model not found" };
  const count = model.video_count ?? videos.length;
  return {
    title: model.name,
    description: `Watch ${count} videos featuring ${model.name} on Wild Baddies.`,
    alternates: { canonical: `${SITE_URL}/models/${slug}` },
    openGraph: {
      type: "profile",
      url: `${SITE_URL}/models/${slug}`,
      title: `${model.name} | Wild Baddies`,
      images: model.thumbnail_url ? [model.thumbnail_url] : undefined,
    },
  };
}

export default async function ModelRoute({ params }: Props) {
  const { slug } = await params;
  const result = await getModelBySlug(slug);
  if (!result.model) notFound();
  return <ModelProfileClient initial={result} />;
}
