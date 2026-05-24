import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("placeholder") || key.startsWith("sk_test_xxx")) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key, { typescript: true });
  }
  return stripeClient;
}

export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function isStripeConfigured(): boolean {
  const stripe = getStripe();
  if (!stripe) return false;
  const starter = process.env.STRIPE_PRICE_STARTER;
  const growth = process.env.STRIPE_PRICE_GROWTH;
  const scale = process.env.STRIPE_PRICE_SCALE;
  return (
    !!starter &&
    !!growth &&
    !!scale &&
    !starter.includes("placeholder") &&
    !growth.includes("placeholder") &&
    !scale.includes("placeholder")
  );
}
