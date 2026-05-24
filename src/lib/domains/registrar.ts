/** Links para registo real de domínios — sem simular compra concluída */

export const REGISTRAR_PARTNERS = [
  {
    id: "cloudflare",
    name: "Cloudflare Registrar",
    description: "Preços ao custo, DNS e SSL integrados",
    buildUrl: (domain: string) =>
      `https://domains.cloudflare.com/?domain=${encodeURIComponent(domain)}`,
  },
  {
    id: "namecheap",
    name: "Namecheap",
    description: "Registo internacional (.com, .io, etc.)",
    buildUrl: (domain: string) =>
      `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`,
  },
] as const;

export function primaryRegistrarUrl(domain: string): string {
  const tld = domain.split(".").pop()?.toLowerCase();
  if (tld === "pt") {
    return `https://www.dns.pt/en/domain/${encodeURIComponent(domain.split(".")[0])}/`;
  }
  return REGISTRAR_PARTNERS[0].buildUrl(domain);
}

export function normalizeDomainName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

export function isValidDomain(name: string): boolean {
  return /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(name);
}
