import { NextResponse } from "next/server";
import { upsertSubscription } from "@/lib/billing/subscription-store";
import { getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { isPaidPlanId } from "@/lib/stripe/plans-config";
import type { PlanId } from "@/lib/store/types";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 });
  }

  const stripe = getStripe()!;
  const body = await request.json().catch(() => ({}));
  const sessionId = String(body.sessionId ?? "");
  const workspaceId = String(body.workspaceId ?? "");

  if (!sessionId || !workspaceId) {
    return NextResponse.json({ error: "sessionId e workspaceId obrigatórios" }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });

  if (session.metadata?.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Sessão não corresponde ao workspace" }, { status: 403 });
  }

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return NextResponse.json({ error: "Pagamento ainda não confirmado" }, { status: 402 });
  }

  const planId = session.metadata?.planId;
  if (!isPaidPlanId(planId ?? "")) {
    return NextResponse.json({ error: "Plano inválido na sessão" }, { status: 400 });
  }

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription && typeof session.subscription === "object"
        ? session.subscription.id
        : undefined;

  if (!customerId) {
    return NextResponse.json({ error: "Cliente Stripe em falta" }, { status: 400 });
  }

  await upsertSubscription({
    workspaceId,
    email: (session.metadata?.userEmail || session.customer_email || "").toLowerCase(),
    planId: planId as PlanId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    status: "active",
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, planId });
}
