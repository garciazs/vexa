"use client";

import { useEffect, useState } from "react";
import { PageRenderer } from "@/components/builder/page-renderer";
import { useWorkspace } from "@/lib/store/workspace-provider";
import { getTemplate } from "@/lib/templates/catalog";
import type { PageBlock } from "@/lib/store/types";
import type { TemplateTheme } from "@/lib/templates/catalog";

export type PublicPageData = {
  slug: string;
  name: string;
  blocks: PageBlock[];
  theme: TemplateTheme;
};

type Props = {
  slug: string;
  initialPage: PublicPageData | null;
  isPreview: boolean;
};

export function PublicLandingClient({ slug, initialPage, isPreview }: Props) {
  const { data, ready, getLandingPageBySlug, incrementPageViews, addLead } = useWorkspace();
  const [submitted, setSubmitted] = useState(false);

  const published = getLandingPageBySlug(slug);
  const draft = data?.landingPages.find((p) => p.slug === slug);
  const previewPage = isPreview ? published ?? draft : undefined;
  const page = initialPage ?? previewPage;

  const theme: TemplateTheme =
    page?.theme ??
    (previewPage?.templateId ? getTemplate(previewPage.templateId)?.theme : undefined) ??
    "midnight";

  useEffect(() => {
    if (!ready || isPreview || !published) return;
    incrementPageViews(slug);
  }, [ready, slug, isPreview, published, incrementPageViews]);

  if (isPreview && !ready) {
    return (
      <div className="min-h-screen bg-[#030304]" aria-hidden>
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-white/5" />
          <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (!page) return null;

  function handleFormSubmit(name: string, email: string) {
    addLead(
      {
        name,
        email,
        score: 60,
        value: 0,
        status: "new",
        source: `Landing: /${slug}`,
        tags: ["form"],
      },
      "form_submit"
    );
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  }

  const isDraftPreview =
    isPreview && previewPage && "status" in previewPage && previewPage.status !== "published";

  return (
    <div>
      {isDraftPreview && (
        <div className="bg-amber-500/20 px-4 py-2 text-center text-sm text-amber-400">
          Pré-visualização — publique para tornar a página pública
        </div>
      )}
      {submitted && (
        <div className="bg-green/20 px-4 py-2 text-center text-sm text-green-bright">
          Obrigado! Entraremos em contacto em breve.
        </div>
      )}
      <PageRenderer blocks={page.blocks} theme={theme} onFormSubmit={handleFormSubmit} />
    </div>
  );
}
