import { NextResponse } from "next/server";
import { checkPageQuota, incrementPageQuota } from "@/lib/billing/page-quota-store";
import { assertWorkspaceMatchesRequest } from "@/lib/auth/workspace-request";
import { resolvePlanForWorkspace } from "@/lib/billing/subscription-store";
import { getPublishedPage, publishPage, type PublishedPageRecord } from "@/lib/publish/store";
import { checkRateLimit, getClientIp, hashIp } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PublishedPageRecord & { workspaceId?: string };
    if (!body.slug || !body.blocks?.length || !body.workspaceId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const workspaceId = body.workspaceId;
    if (!assertWorkspaceMatchesRequest(request.headers.get("cookie"), workspaceId)) {
      return NextResponse.json({ error: "Sessão inválida", code: "SESSION" }, { status: 403 });
    }

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    const bodyExtra = body as PublishedPageRecord & {
      workspaceId?: string;
      deviceFingerprint?: string;
    };
    const deviceFingerprint =
      typeof bodyExtra.deviceFingerprint === "string" ? bodyExtra.deviceFingerprint : undefined;

    const rate = checkRateLimit(`pub:${workspaceId}:${ipHash}`, 6, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Demasiados pedidos. Aguarde alguns segundos.", code: "RATE_LIMIT" },
        { status: 429 }
      );
    }

    const existing = await getPublishedPage(body.slug);
    const isRepublish = existing?.workspaceId === workspaceId;

    if (!isRepublish) {
      const check = await checkPageQuota({
        workspaceId,
        action: "publish",
        ipHash,
        deviceFingerprint,
      });

      if (!check.allowed) {
        return NextResponse.json(
          { error: check.message, code: check.code },
          { status: 403 }
        );
      }
    }

    await publishPage({
      ...body,
      publishedAt: body.publishedAt ?? new Date().toISOString(),
    });

    if (!isRepublish) {
      const planId = await resolvePlanForWorkspace(workspaceId);
      await incrementPageQuota({
        workspaceId,
        action: "publish",
        ipHash,
        deviceFingerprint,
        planId,
      });
    }

    return NextResponse.json({ ok: true, slug: body.slug });
  } catch {
    return NextResponse.json({ error: "Erro ao publicar" }, { status: 500 });
  }
}
