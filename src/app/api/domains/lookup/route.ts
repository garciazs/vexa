import { NextResponse } from "next/server";
import { getPageByDomain } from "@/lib/publish/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");
  if (!domain) {
    return NextResponse.json({ error: "Domínio obrigatório" }, { status: 400 });
  }
  const page = await getPageByDomain(domain);
  if (!page) {
    return NextResponse.json({ error: "Domínio não configurado" }, { status: 404 });
  }
  return NextResponse.json(page);
}
