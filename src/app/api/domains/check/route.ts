import { NextResponse } from "next/server";
import { isValidDomain, normalizeDomainName, primaryRegistrarUrl, REGISTRAR_PARTNERS } from "@/lib/domains/registrar";

/**
 * Disponibilidade estimada (sem API de registrar paga).
 * availabilityHint: true = provável disponível — confirme no parceiro.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("name")?.trim() ?? "";
  const name = normalizeDomainName(raw);

  if (!name || !isValidDomain(name)) {
    return NextResponse.json({ available: false, error: "Domínio inválido. Ex: minhaempresa.pt" }, { status: 400 });
  }

  const TAKEN = ["google.pt", "google.com", "facebook.com", "vexa.pt", "vexa.com", "stripe.com", "vercel.com"];
  const likelyAvailable = !TAKEN.includes(name);

  const tld = name.split(".").pop() ?? "pt";
  const price = tld === "com" ? 14 : tld === "io" ? 39 : tld === "pt" ? 12 : 15;

  return NextResponse.json({
    name,
    /** Não é verificação WHOIS real — utilizador confirma no parceiro */
    availabilityHint: likelyAvailable,
    available: likelyAvailable,
    price,
    registrarUrl: primaryRegistrarUrl(name),
    partners: REGISTRAR_PARTNERS.map((p) => ({ id: p.id, name: p.name, url: p.buildUrl(name) })),
    disclaimer:
      "Verificação estimada. O registo é concluído no site do parceiro — o VEXA só liga o domínio após configurar DNS.",
  });
}
