import { notFound } from "next/navigation";
import { getPublishedPage } from "@/lib/publish/store";
import { PublicLandingClient } from "@/app/p/[slug]/public-landing-client";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function PublicLandingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  const published = await getPublishedPage(slug);

  if (!published && !isPreview) {
    notFound();
  }

  const initialPage = published
    ? {
        slug: published.slug,
        name: published.name,
        blocks: published.blocks,
        theme: published.theme,
      }
    : null;

  return <PublicLandingClient slug={slug} initialPage={initialPage} isPreview={isPreview} />;
}
