import type { PageBlock } from "@/lib/store/types";
import type { PlanId } from "@/lib/store/types";
import type { TemplateTheme } from "@/lib/templates/catalog";
import type { VisualStyle } from "@/lib/ai/visual-strategy";
import { generateCopy } from "@/lib/ai/copy-engine";
import { buildPremiumBlocks, SECTION_PLAN_LIMITS } from "@/lib/ai/section-architect";
import { getGenerationTier } from "@/lib/ai/generation-tiers";
import { analyzePrompt } from "@/lib/ai/visual-strategy";

export interface AIGeneratedPage {
  name: string;
  slug: string;
  theme: TemplateTheme;
  blocks: PageBlock[];
  summary: string;
  niche: string;
  strategy?: {
    pageType: string;
    visualStyle: string;
    emotion: string;
    narrative: string;
  };
  customColors?: {
    primary: string;
    accent: string;
    background: string;
  };
  qualityTier: PlanId;
}

export interface GeneratePageInput {
  prompt: string;
  planId?: PlanId;
  userImages?: string[];
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

function themeFromVisualStyle(style: VisualStyle, mode: "dark" | "light", pageType: string): TemplateTheme {
  if (style === "apple-clean" || style === "warm-local" || mode === "light") return "clean";
  if (style === "luxury-serif" || style === "vibrant-marketing" || pageType === "local") return "launch";
  return "saas";
}

export function generatePageFromPrompt(input: GeneratePageInput | string): AIGeneratedPage {
  const prompt = typeof input === "string" ? input : input.prompt;
  const planId = typeof input === "string" ? "free" : (input.planId ?? "free");
  const userImages = typeof input === "string" ? [] : (input.userImages ?? []);

  const trimmed = prompt.trim();
  if (!trimmed || trimmed.length < 8) {
    throw new Error("Descreva o seu negócio ou produto com mais detalhe.");
  }

  const tier = getGenerationTier(planId);
  const strategy = analyzePrompt(trimmed, planId);
  const copy = generateCopy(strategy, trimmed);
  const blocks = buildPremiumBlocks(strategy, copy, planId, userImages);
  const theme = themeFromVisualStyle(strategy.visualStyle, strategy.palette.mode, strategy.pageType);
  const name = strategy.brandName;
  const slug = slugify(name) || "site";

  const sectionCount = blocks.length;

  const qualityNote = tier.fullQuality
    ? "Qualidade máxima (100%)."
    : `Plano ${tier.label} — ${sectionCount} secções.`;

  const summary = [
    `Site ${strategy.pageType} para ${strategy.industryLabel}.`,
    qualityNote,
    `Headline: "${copy.hero.headline.slice(0, 60)}${copy.hero.headline.length > 60 ? "…" : ""}"`,
    tier.maxPages === 1
      ? "No plano Free só pode guardar 1 landing page — faça upgrade para criar mais."
      : tier.maxPages < Infinity
        ? `Pode criar até ${tier.maxPages} landing pages neste plano.`
        : "Landing pages ilimitadas neste plano.",
    "Edite e publique no builder.",
  ].join(" ");

  return {
    name,
    slug,
    theme,
    blocks,
    summary,
    niche: strategy.industryLabel,
    strategy: {
      pageType: strategy.pageType,
      visualStyle: strategy.visualStyle,
      emotion: strategy.emotion,
      narrative: strategy.narrative,
    },
    customColors: {
      primary: strategy.palette.primary,
      accent: strategy.palette.accent,
      background: strategy.palette.background,
    },
    qualityTier: planId,
  };
}

export const PLAN_GENERATION_LIMITS = SECTION_PLAN_LIMITS;
export { getGenerationTier, GENERATION_TIERS } from "@/lib/ai/generation-tiers";

export const AI_PROMPT_EXAMPLES = [
  "Landing page para uma IA de atendimento no WhatsApp — resposta em segundos, 24/7",
  "Barbearia premium em Lisboa, preto e dourado, agendamento online",
  "SaaS de analytics para e-commerce — estilo Linear, trial grátis",
  "Mentoria high-ticket de marketing digital — €997, garantia 7 dias",
  "App de fitness personalizado — download iOS e Android",
  "Restaurante italiano com reservas e carta de vinhos premium",
];
