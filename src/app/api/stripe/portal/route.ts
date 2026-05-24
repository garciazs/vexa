import { NextResponse } from "next/server";
import { getSubscriptionByWorkspace } from "@/lib/billing/subscription-store";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe/client";

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe não configurado" }, { status: 503 });
  }

  const stripe = getStripe()!;
  const body = await request.json().catch(() => ({}));
  const workspaceId = String(body.workspaceId ?? "");

  if (!workspaceId) {
    return NextResponse.json({ error: "Workspace obrigatório" }, { status: 400 });
  }

  const sub = await getSubscriptionByWorkspace(workspaceId);
  if (!sub?.stripeCustomerId) {
    return NextResponse.json(
      { error: "Nenhuma subscrição Stripe encontrada. Faça upgrade primeiro." },
      { status: 404 }
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${getAppUrl()}/billing`,
  });

  return NextResponse.json({ url: session.url });
}
