import type { PlanId } from "@/lib/store/types";
import { PLAN_LIMITS as PAGE_PLAN_LIMITS } from "@/lib/templates/catalog";

/** Limites de geração IA por plano — Free = qualidade 100%, 1 página; pagos = escalonado */
export interface GenerationTierConfig {
  /** Free: stack completo estilo startup. Pagos: conforme plano */
  fullQuality: boolean;
  maxBlocks: number;
  maxUserImages: number;
  maxPages: number;
  label: string;
  hint: string;
}

export const GENERATION_TIERS: Record<PlanId, GenerationTierConfig> = {
  free: {
    fullQuality: true,
    maxBlocks: 20,
    maxUserImages: 3,
    maxPages: PAGE_PLAN_LIMITS.free.maxPages,
    label: "100% Premium",
    hint: "1 site grátis com qualidade 100%. Use a IA, edite e publique — só depois o limite entra em vigor.",
  },
  starter: {
    fullQuality: false,
    maxBlocks: 11,
    maxUserImages: 3,
    maxPages: PAGE_PLAN_LIMITS.starter.maxPages,
    label: "Starter",
    hint: "Até 3 sites · 11 secções · logos e hero premium · 3 fotos por site.",
  },
  growth: {
    fullQuality: true,
    maxBlocks: 16,
    maxUserImages: 10,
    maxPages: PAGE_PLAN_LIMITS.growth.maxPages,
    label: "Growth",
    hint: "Sites ilimitados · 16 secções incl. bento e problema/solução · 10 fotos.",
  },
  scale: {
    fullQuality: true,
    maxBlocks: 20,
    maxUserImages: 20,
    maxPages: PAGE_PLAN_LIMITS.scale.maxPages,
    label: "Scale",
    hint: "Tudo ilimitado · 20 secções · 20 fotos · pipeline completo.",
  },
};

export function getGenerationTier(planId: PlanId): GenerationTierConfig {
  return GENERATION_TIERS[planId] ?? GENERATION_TIERS.free;
}

/** Secções bloqueadas em planos sem fullQuality */
export const PREMIUM_ONLY_SECTIONS = ["bento", "problem-solution", "gallery", "guarantee"] as const;

export const STARTER_SECTIONS_SKIP = ["bento", "gallery", "guarantee"] as const;
