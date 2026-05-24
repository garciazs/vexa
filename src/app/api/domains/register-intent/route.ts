import { NextResponse } from "next/server";
import { isValidDomain, normalizeDomainName } from "@/lib/domains/registrar";

/** Regista intenção de compra externa — NÃO marca domínio como comprado */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = normalizeDomainName(String(body.name ?? ""));
    const action = body.action === "connect" ? "connect" : "register";

    if (!name || !isValidDomain(name)) {
      return NextResponse.json({ error: "Domínio inválido" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      name,
      action,
      status: "pending",
      message:
        action === "connect"
          ? "Domínio adicionado. Configure o DNS abaixo para activar."
          : "Após registar no parceiro, volte aqui e ligue o DNS.",
    });
  } catch {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }
}
