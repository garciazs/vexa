import { NextResponse } from "next/server";
import { generatePageFromPrompt } from "@/lib/ai/page-generator";
import { canCreatePage, normalizePlanId } from "@/lib/templates/catalog";
import type { PlanId } from "@/lib/store/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt as string | undefined;
    const planId = normalizePlanId(body.planId as PlanId | undefined);
    const pageCount = typeof body.pageCount === "number" ? body.pageCount : 0;
    const lifetimeCreated =
      typeof body.lifetimeCreated === "number" ? body.lifetimeCreated : pageCount;
    const userImages = Array.isArray(body.userImages)
      ? (body.userImages as string[]).filter((u) => typeof u === "string" && u.startsWith("data:image"))
      : [];

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 });
    }

    if (!canCreatePage(planId, pageCount, lifetimeCreated)) {
      return NextResponse.json(
        {
          error:
            planId === "free"
              ? "Plano Free: limite de 1 site atingido. Faça upgrade para criar mais."
              : "Limite de sites do seu plano atingido.",
          code: "PAGE_LIMIT",
        },
        { status: 403 }
      );
    }

    const delay = planId === "free" || planId === "scale" ? 2000 : planId === "growth" ? 1600 : 1300;
    await new Promise((r) => setTimeout(r, delay));

    const result = generatePageFromPrompt({ prompt, planId, userImages });
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao gerar página";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
