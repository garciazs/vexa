import { NextResponse } from "next/server";
import { publishPage, type PublishedPageRecord } from "@/lib/publish/store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PublishedPageRecord;
    if (!body.slug || !body.blocks?.length) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    await publishPage({
      ...body,
      publishedAt: new Date().toISOString(),
    });
    return NextResponse.json({ ok: true, slug: body.slug });
  } catch {
    return NextResponse.json({ error: "Erro ao publicar" }, { status: 500 });
  }
}
