import { NextResponse } from "next/server";
import {
  checkPageQuota,
  getWorkspaceQuota,
  incrementPageQuota,
  type QuotaAction,
} from "@/lib/billing/page-quota-store";
import { checkRateLimit, getClientIp, hashIp } from "@/lib/security/rate-limit";
import { normalizePlanId } from "@/lib/templates/catalog";
import type { PlanId } from "@/lib/store/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspaceId obrigatório" }, { status: 400 });
  }
  const quota = await getWorkspaceQuota(workspaceId);
  return NextResponse.json({ quota });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const workspaceId = body.workspaceId as string | undefined;
    const action = body.action as QuotaAction | undefined;
    const replaceExisting = !!body.replaceExisting;
    const planId = normalizePlanId(body.planId as PlanId | undefined);
    const confirm = body.confirm === true;

    if (!workspaceId || !action) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    const rateKey = `${workspaceId}:${action}:${ipHash}`;

    const rate = checkRateLimit(rateKey, action === "create" ? 5 : 10, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          allowed: false,
          code: "RATE_LIMIT",
          error: "Demasiados pedidos. Aguarde alguns segundos.",
          retryAfterMs: rate.retryAfterMs,
        },
        { status: 429 }
      );
    }

    const clientPageCount =
      typeof body.clientPageCount === "number" ? body.clientPageCount : undefined;

    const check = await checkPageQuota({
      workspaceId,
      action,
      ipHash,
      replaceExisting,
      clientPageCount,
    });

    if (!check.allowed) {
      return NextResponse.json(
        { allowed: false, code: check.code, error: check.message, quota: check.quota },
        { status: 403 }
      );
    }

    if (confirm && (action === "create" || action === "publish")) {
      const updated = await incrementPageQuota({
        workspaceId,
        action,
        ipHash,
        planId,
      });
      return NextResponse.json({ allowed: true, quota: updated });
    }

    return NextResponse.json({ allowed: true, quota: check.quota });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao verificar quota";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
