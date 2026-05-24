import type { PlanId } from "@/lib/store/types";

const PAID_PLANS = ["starter", "growth", "scale"] as const;
export type PaidPlanId = (typeof PAID_PLANS)[number];

export function isPaidPlanId(id: string): id is PaidPlanId {
  return (PAID_PLANS as readonly string[]).includes(id);
}

export function getStripePriceId(planId: PaidPlanId): string | null {
  const map: Record<PaidPlanId, string | undefined> = {
    starter: process.env.STRIPE_PRICE_STARTER,
    growth: process.env.STRIPE_PRICE_GROWTH,
    scale: process.env.STRIPE_PRICE_SCALE,
  };
  const priceId = map[planId];
  if (!priceId || priceId.includes("placeholder")) return null;
  return priceId;
}

export function planIdFromStripePrice(priceId: string): PaidPlanId | null {
  if (priceId === process.env.STRIPE_PRICE_STARTER) return "starter";
  if (priceId === process.env.STRIPE_PRICE_GROWTH) return "growth";
  if (priceId === process.env.STRIPE_PRICE_SCALE) return "scale";
  return null;
}

export function planIdFromStripeProduct(productId: string): PaidPlanId | null {
  const map: Record<string, PaidPlanId | undefined> = {
    [process.env.STRIPE_PRODUCT_STARTER ?? ""]: "starter",
    [process.env.STRIPE_PRODUCT_GROWTH ?? ""]: "growth",
    [process.env.STRIPE_PRODUCT_SCALE ?? ""]: "scale",
  };
  return map[productId] ?? null;
}

export function getPaidPlanMeta(planId: PaidPlanId) {
  const meta = {
    starter: { name: "Starter", price: 29 },
    growth: { name: "Growth", price: 79 },
    scale: { name: "Scale", price: 199 },
  } as const;
  return meta[planId];
}

export function effectivePlanId(storedPlan: PlanId, serverPlan: PlanId): PlanId {
  if (serverPlan !== "free") return serverPlan;
  return storedPlan;
}
