import { NextResponse } from "next/server";
import { getSubscriptionByWorkspace, resolvePlanForWorkspace } from "@/lib/billing/subscription-store";
import { isStripeConfigured } from "@/lib/stripe/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId")?.trim();

  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId obrigatório" }, { status: 400 });
  }

  const sub = await getSubscriptionByWorkspace(workspaceId);
  const planId = await resolvePlanForWorkspace(workspaceId);

  return NextResponse.json({
    configured: isStripeConfigured(),
    planId,
    status: sub?.status ?? null,
    hasPaymentMethod: !!sub?.stripeCustomerId,
    stripeCustomerId: sub?.stripeCustomerId ?? null,
    updatedAt: sub?.updatedAt ?? null,
  });
}
