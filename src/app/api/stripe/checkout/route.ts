import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionByWorkspace } from "@/lib/billing/subscription-store";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe/client";
import { getPaidPlanMeta, getStripePriceId, isPaidPlanId } from "@/lib/stripe/plans-config";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      {
        error:
          "Stripe não configurado. Defina STRIPE_SECRET_KEY e STRIPE_PRICE_STARTER/GROWTH/SCALE no .env",
      },
      { status: 503 }
    );
  }

  const stripe = getStripe()!;
  const body = await request.json().catch(() => ({}));
  const planId = String(body.planId ?? body.plan ?? "");
  const workspaceId = String(body.workspaceId ?? "");
  const email = String(body.email ?? "").toLowerCase().trim();

  if (!isPaidPlanId(planId)) {
    return NextResponse.json({ error: "Plano inválido para checkout" }, { status: 400 });
  }
  if (!workspaceId || !email) {
    return NextResponse.json({ error: "Workspace e email obrigatórios" }, { status: 400 });
  }

  const priceId = getStripePriceId(planId);
  if (!priceId) {
    return NextResponse.json({ error: "Price ID Stripe em falta para este plano" }, { status: 503 });
  }

  const existing = await getSubscriptionByWorkspace(workspaceId);
  const meta = getPaidPlanMeta(planId);
  const appUrl = getAppUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: existing?.stripeCustomerId,
    customer_email: existing?.stripeCustomerId ? undefined : email,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    metadata: {
      workspaceId,
      planId,
      userEmail: email,
    },
    subscription_data: {
      metadata: {
        workspaceId,
        planId,
      },
    },
    success_url: `${appUrl}/billing?success=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/billing?canceled=1`,
  });

  return NextResponse.json({
    url: session.url,
    sessionId: session.id,
    plan: { id: planId, name: meta.name, price: meta.price },
  });
}

/** Redireciona para checkout (links legados) */
export async function GET(request: NextRequest) {
  const planId = request.nextUrl.searchParams.get("plan") ?? "growth";
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? "";
  const email = request.nextUrl.searchParams.get("email") ?? "";

  if (!workspaceId || !email) {
    return NextResponse.redirect(new URL("/billing?error=missing_workspace", getAppUrl()));
  }

  const res = await POST(
    new NextRequest(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, workspaceId, email }),
    })
  );
  const json = await res.json();
  if (!res.ok || !json.url) {
    return NextResponse.redirect(new URL(`/billing?error=checkout`, getAppUrl()));
  }
  return NextResponse.redirect(json.url);
}
