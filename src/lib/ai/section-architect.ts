import type { PageBlock } from "@/lib/store/types";
import type { PlanId } from "@/lib/store/types";
import type { PageCopy } from "@/lib/ai/copy-engine";
import { GENERATION_TIERS, getGenerationTier } from "@/lib/ai/generation-tiers";
import { getIndustryImages } from "@/lib/ai/industry-images";
import type { VisualStrategy } from "@/lib/ai/visual-strategy";

function block(type: string, label: string, content: Record<string, string>): PageBlock {
  return { id: `block-${crypto.randomUUID()}`, type, label, content };
}

function paletteMeta(p: VisualStrategy["palette"]): Record<string, string> {
  return {
    hideBranding: "true",
    primaryColor: p.primary,
    accentColor: p.accent,
    backgroundColor: p.background,
    surfaceColor: p.surface,
    textColor: p.text,
    mutedColor: p.muted,
    gradient: p.gradient,
    colorMode: p.mode,
    typography: p.mode === "light" ? "sans-display" : "sans-modern",
  };
}

function distributeImages(stock: string[], userImages: string[]): string[] {
  if (userImages.length === 0) return stock;
  const out = [...stock];
  userImages.forEach((img, i) => {
    if (i < out.length) out[i] = img;
    else out.push(img);
  });
  return out;
}

function buildSection(
  section: string,
  copy: PageCopy,
  imgs: string[],
  meta: Record<string, string>
): PageBlock | null {
  const img = (i: number) => imgs[i] ?? imgs[0] ?? "";

  switch (section) {
    case "navbar":
      return block("navbar", "Navbar", {
        brand: copy.navbar.brand,
        links: copy.navbar.links,
        cta: copy.navbar.cta,
        ...meta,
      });
    case "hero":
      return block("hero", "Hero", {
        layout: "premium-split",
        badge: copy.hero.badge,
        headline: copy.hero.headline,
        subtitle: copy.hero.subtitle,
        cta: copy.hero.cta,
        ctaSecondary: copy.hero.ctaSecondary,
        imageUrl: img(0),
        animation: "fade-up",
        align: "left",
        ...meta,
      });
    case "logos":
      return block("logos", "Logos", {
        headline: copy.logos.headline,
        logo1: copy.logos.logo1,
        logo2: copy.logos.logo2,
        logo3: copy.logos.logo3,
        logo4: copy.logos.logo4,
        logo5: copy.logos.logo5,
        animation: "fade-in",
      });
    case "social-proof":
      return block("social-proof", "Stats", {
        headline: copy.socialProof.headline,
        stat1: copy.socialProof.stat1,
        stat1label: copy.socialProof.stat1label,
        stat2: copy.socialProof.stat2,
        stat2label: copy.socialProof.stat2label,
        stat3: copy.socialProof.stat3,
        stat3label: copy.socialProof.stat3label,
        animation: "fade-up",
      });
    case "problem-solution":
      return block("problem-solution", "Problema vs Solução", {
        headline: copy.problemSolution.headline,
        problem: copy.problemSolution.problem,
        solution: copy.problemSolution.solution,
        beforeLabel: copy.problemSolution.beforeLabel,
        afterLabel: copy.problemSolution.afterLabel,
        before1: copy.problemSolution.before1,
        before2: copy.problemSolution.before2,
        before3: copy.problemSolution.before3,
        after1: copy.problemSolution.after1,
        after2: copy.problemSolution.after2,
        after3: copy.problemSolution.after3,
        animation: "slide-left",
      });
    case "bento":
      return block("bento", "Bento Grid", {
        headline: copy.bento.headline,
        subtitle: copy.bento.subtitle,
        cell1title: copy.bento.cell1title,
        cell1desc: copy.bento.cell1desc,
        cell1image: img(1),
        cell2title: copy.bento.cell2title,
        cell2desc: copy.bento.cell2desc,
        cell2image: img(2),
        cell3title: copy.bento.cell3title,
        cell3desc: copy.bento.cell3desc,
        cell4title: copy.bento.cell4title,
        cell4desc: copy.bento.cell4desc,
        cell4image: img(3),
        animation: "scale",
      });
    case "features":
      return block("features", "Features", {
        headline: copy.features.headline,
        subtitle: copy.features.subtitle,
        feature1title: copy.features.feature1title,
        feature1desc: copy.features.feature1desc,
        feature1image: img(1),
        feature2title: copy.features.feature2title,
        feature2desc: copy.features.feature2desc,
        feature2image: img(2),
        feature3title: copy.features.feature3title,
        feature3desc: copy.features.feature3desc,
        feature3image: img(3),
        animation: "fade-up",
      });
    case "about":
      if (!copy.about) return null;
      return block("about", "Sobre", {
        headline: copy.about.headline,
        text: copy.about.text,
        imageUrl: img(1),
        animation: "slide-left",
      });
    case "services":
      if (!copy.services) return null;
      return block("services", "Serviços", {
        headline: copy.services.headline,
        subtitle: copy.services.subtitle,
        service1title: copy.services.service1title,
        service1desc: copy.services.service1desc,
        service1price: copy.services.service1price,
        service2title: copy.services.service2title,
        service2desc: copy.services.service2desc,
        service2price: copy.services.service2price,
        service3title: copy.services.service3title,
        service3desc: copy.services.service3desc,
        service3price: copy.services.service3price,
        animation: "scale",
      });
    case "gallery":
      return block("gallery", "Galeria", {
        headline: "Galeria",
        subtitle: "Imagens reais do nosso trabalho.",
        image1: img(4),
        image2: img(5),
        image3: img(6),
        image4: img(7),
        animation: "scale",
      });
    case "testimonials":
      return block("testimonials", "Depoimentos", {
        headline: copy.testimonials.headline,
        quote1: copy.testimonials.quote1,
        author1: copy.testimonials.author1,
        role1: copy.testimonials.role1,
        quote2: copy.testimonials.quote2,
        author2: copy.testimonials.author2,
        role2: copy.testimonials.role2,
        quote3: copy.testimonials.quote3,
        author3: copy.testimonials.author3,
        role3: copy.testimonials.role3,
        animation: "fade-up",
      });
    case "pricing":
      return block("pricing", "Pricing", {
        headline: copy.pricing.headline,
        subtitle: copy.pricing.subtitle,
        price: copy.pricing.price,
        period: copy.pricing.period,
        feature1: copy.pricing.feature1,
        feature2: copy.pricing.feature2,
        feature3: copy.pricing.feature3,
        feature4: copy.pricing.feature4,
        button: copy.pricing.button,
        animation: "scale",
      });
    case "guarantee":
      return block("guarantee", "Garantia", {
        headline: copy.guarantee?.headline ?? "Garantia total",
        text: copy.guarantee?.text ?? "Satisfação garantida ou devolução integral.",
        animation: "fade-up",
      });
    case "faq":
      return block("faq", "FAQ", {
        headline: copy.faq.headline,
        q1: copy.faq.q1,
        a1: copy.faq.a1,
        q2: copy.faq.q2,
        a2: copy.faq.a2,
        q3: copy.faq.q3,
        a3: copy.faq.a3,
        animation: "fade-up",
      });
    case "form":
      return block("form", "Formulário", {
        headline: copy.form.headline,
        subtitle: copy.form.subtitle,
        button: copy.form.button,
        imageUrl: img(8),
        animation: "fade-up",
      });
    case "cta":
      return block("cta", "CTA Final", {
        headline: copy.cta.headline,
        subtitle: copy.cta.subtitle,
        button: copy.cta.button,
        imageUrl: img(9),
        animation: "blur",
      });
    case "footer":
      return block("footer", "Footer", {
        brand: copy.navbar.brand,
        tagline: copy.footer.tagline,
        col1: copy.footer.col1,
        col2: copy.footer.col2,
        col3: copy.footer.col3,
        ...meta,
      });
    default:
      return null;
  }
}

export function buildPremiumBlocks(
  strategy: VisualStrategy,
  copy: PageCopy,
  planId: PlanId,
  userImages: string[]
): PageBlock[] {
  const tier = getGenerationTier(planId);
  const images = getIndustryImages(strategy.industry);
  const stock = [images.hero, ...images.features, ...images.gallery, images.form, images.cta];
  const imgs = distributeImages(stock, userImages.slice(0, tier.maxUserImages));
  const meta = paletteMeta(strategy.palette);

  const blocks: PageBlock[] = [];
  for (const section of strategy.sections) {
    const b = buildSection(section, copy, imgs, meta);
    if (b) blocks.push(b);
    if (blocks.length >= tier.maxBlocks) break;
  }

  return blocks;
}

export const SECTION_PLAN_LIMITS = Object.fromEntries(
  (Object.keys(GENERATION_TIERS) as PlanId[]).map((id) => [
    id,
    { maxBlocks: GENERATION_TIERS[id].maxBlocks, maxUserImages: GENERATION_TIERS[id].maxUserImages },
  ])
) as Record<PlanId, { maxBlocks: number; maxUserImages: number }>;
