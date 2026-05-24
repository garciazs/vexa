import { NextResponse } from "next/server";
import { linkDomainToPage } from "@/lib/publish/store";

export async function POST(request: Request) {
  try {
    const { domain, slug, workspaceId } = await request.json();
    if (!domain || !slug || !workspaceId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    await linkDomainToPage(domain, slug, workspaceId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao ligar domínio" }, { status: 500 });
  }
}
