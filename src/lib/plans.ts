export const STRIPE_PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 29,
    currency: "eur",
    stripePriceId: "price_starter_placeholder",
    stripeProductId: "prod_starter_placeholder",
  },
  growth: {
    id: "growth",
    name: "Growth",
    price: 79,
    currency: "eur",
    stripePriceId: "price_growth_placeholder",
    stripeProductId: "prod_growth_placeholder",
    popular: true,
  },
  scale: {
    id: "scale",
    name: "Scale",
    price: 199,
    currency: "eur",
    stripePriceId: "price_scale_placeholder",
    stripeProductId: "prod_scale_placeholder",
  },
} as const;

export type PlanId = keyof typeof STRIPE_PLANS;

export function getPlanById(id: string) {
  return STRIPE_PLANS[id as PlanId] ?? null;
}
