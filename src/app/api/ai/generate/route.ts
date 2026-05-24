import { NextResponse } from "next/server";
import { generatePageFromPrompt } from "@/lib/ai/page-generator";
import { checkPageQuota } from "@/lib/billing/page-quota-store";
import { checkRateLimit, getClientIp, hashIp } from "@/lib/security/rate-limit";
import type { PlanId } from "@/lib/store/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt as string | undefined;
    const workspaceId = body.workspaceId as string | undefined;
    const userImages = Array.isArray(body.userImages)
      ? (body.userImages as string[]).filter(
          (u) => typeof u === "string" && u.startsWith("data:image")
        )
      : [];

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 });
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId obrigatório" }, { status: 400 });
    }

    const ip = getClientIp(request);
    const ipHash = hashIp(ip);
    const rate = checkRateLimit(`gen:${workspaceId}:${ipHash}`, 8, 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Demasiados pedidos. Aguarde alguns segundos.", code: "RATE_LIMIT" },
        { status: 429 }
      );
    }

    const pageCount = typeof body.pageCount === "number" ? body.pageCount : 0;

    const check = await checkPageQuota({
      workspaceId,
      action: "generate",
      ipHash,
      clientPageCount: pageCount,
    });

    if (!check.allowed) {
      return NextResponse.json(
        { error: check.message, code: check.code },
        { status: 403 }
      );
    }

    const planId = check.planId as PlanId;
    const delay =
      planId === "free" || planId === "scale" ? 2000 : planId === "growth" ? 1600 : 1300;
    await new Promise((r) => setTimeout(r, delay));

    const result = generatePageFromPrompt({ prompt, planId, userImages });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao gerar página";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
