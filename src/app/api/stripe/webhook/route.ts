import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { upsertSubscription } from "@/lib/billing/subscription-store";
import { getStripe } from "@/lib/stripe/client";
import { isPaidPlanId, planIdFromStripePrice } from "@/lib/stripe/plans-config";
import type { PlanId } from "@/lib/store/types";

export const runtime = "nodejs";

function planFromSubscription(sub: Stripe.Subscription): PlanId {
  const meta = sub.metadata?.planId;
  if (meta && isPaidPlanId(meta)) return meta;
  const priceId = sub.items.data[0]?.price?.id;
  if (priceId) {
    const fromPrice = planIdFromStripePrice(priceId);
    if (fromPrice) return fromPrice;
  }
  return "starter";
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const workspaceId = session.metadata?.workspaceId;
  const planId = session.metadata?.planId;
  const email = (session.metadata?.userEmail || session.customer_email || "").toLowerCase();
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!workspaceId || !customerId || !isPaidPlanId(planId ?? "")) return;

  await upsertSubscription({
    workspaceId,
    email,
    planId: planId as PlanId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    status: "active",
    updatedAt: new Date().toISOString(),
  });
}

async function handleSubscriptionChange(sub: Stripe.Subscription) {
  const workspaceId = sub.metadata?.workspaceId;
  if (!workspaceId) return;

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return;

  const status = sub.status as "active" | "trialing" | "past_due" | "canceled" | "incomplete";
  const planId = planFromSubscription(sub);

  await upsertSubscription({
    workspaceId,
    email: sub.metadata?.userEmail ?? "",
    planId: status === "active" || status === "trialing" ? planId : "free",
    stripeCustomerId: customerId,
    stripeSubscriptionId: sub.id,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret || webhookSecret.includes("placeholder")) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura em falta" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
