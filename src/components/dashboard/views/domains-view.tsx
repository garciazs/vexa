"use client";

import { useState } from "react";
import { AlertCircle, Check, ExternalLink, Globe, Link2, Search } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/lib/store/workspace-provider";
import { formatCurrency } from "@/lib/utils";

const SUGGESTIONS = ["minhaempresa.pt", "minhaloja.com", "negocio.io", "marca.pt"];

type CheckResult = {
  name: string;
  available: boolean;
  availabilityHint?: boolean;
  price: number;
  registrarUrl?: string;
  partners?: { id: string; name: string; url: string }[];
  disclaimer?: string;
};

export function DomainsView() {
  const { data, purchaseDomain, connectExistingDomain, verifyDomainDns, linkDomainToPage } =
    useWorkspace();
  const domains = data?.domains ?? [];
  const pages = data?.landingPages ?? [];
  const plan = data?.workspace.plan ?? "free";
  const canUseDomains = plan === "growth" || plan === "scale";

  const [query, setQuery] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [connectInput, setConnectInput] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  async function checkDomain(name: string) {
    setChecking(true);
    setResult(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/domains/check?name=${encodeURIComponent(name)}`);
      const json = await res.json();
      setResult(json);
    } finally {
      setChecking(false);
    }
  }

  async function handleRegisterExternal() {
    if (!result?.name || !result.registrarUrl) return;
    await fetch("/api/domains/register-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: result.name, action: "register" }),
    });
    purchaseDomain(result.name, result.price, "register");
    window.open(result.registrarUrl, "_blank", "noopener,noreferrer");
    setNotice(
      `Abra o parceiro num novo separador, conclua o registo de ${result.name}, depois configure o DNS abaixo. O domínio só fica activo após verificar DNS.`
    );
    setResult(null);
    setQuery("");
  }

  function handleConnectExisting(name: string) {
    const trimmed = name.trim().toLowerCase().replace(/^www\./, "");
    if (!trimmed.includes(".")) {
      setNotice("Indique um domínio válido. Ex: minhaempresa.pt");
      return;
    }
    connectExistingDomain(trimmed);
    setConnectInput("");
    setNotice(
      `Domínio ${trimmed} adicionado como pendente. Configure o DNS e clique em Verificar DNS para activar.`
    );
  }

  return (
    <>
      <Header
        title="Domínios"
        description="Registe no parceiro ou ligue um domínio que já possui — sem compras simuladas"
      />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mx-auto max-w-3xl space-y-6">
          {!canUseDomains && (
            <Card className="glass border-amber-500/30 bg-amber-500/5">
              <CardContent className="flex gap-3 p-4 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  Domínios personalizados nos planos <strong>Growth</strong> e{" "}
                  <strong>Scale</strong>.{" "}
                  <a href="/billing" className="text-purple-bright hover:underline">
                    Ver planos
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass border-blue-500/20 bg-blue-500/5">
            <CardContent className="flex gap-3 p-4 text-sm text-muted-foreground">
              <AlertCircle className="h-5 w-5 shrink-0 text-blue-400" />
              <p>
                O VEXA <strong>não regista domínios internamente</strong>. O registo é feito no
                parceiro (Cloudflare, Namecheap, DNS.PT). Depois, ligue o DNS aqui — só marcamos como
                activo após verificação.
              </p>
            </CardContent>
          </Card>

          {notice && (
            <Card className="glass border-green/30 bg-green/5">
              <CardContent className="p-4 text-sm text-green-bright">{notice}</CardContent>
            </Card>
          )}

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-5 w-5 text-purple-bright" />
                Pesquisar domínio para registar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="ex: minhaempresa.pt"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && query && checkDomain(query)}
                  disabled={!canUseDomains}
                />
                <Button
                  onClick={() => query && checkDomain(query)}
                  disabled={checking || !query.trim() || !canUseDomains}
                >
                  {checking ? "..." : "Verificar"}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={!canUseDomains}
                    onClick={() => {
                      setQuery(s);
                      checkDomain(s);
                    }}
                    className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:border-purple/40 disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
              {result && (
                <div
                  className={`rounded-xl border p-4 ${
                    result.availabilityHint ? "border-green/30 bg-green/5" : "border-border"
                  }`}
                >
                  <p className="font-medium">{result.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.availabilityHint
                      ? "Provavelmente disponível — confirme no parceiro"
                      : "Pode estar indisponível — tente outro nome"}
                  </p>
                  {result.disclaimer && (
                    <p className="mt-2 text-xs text-muted-foreground">{result.disclaimer}</p>
                  )}
                  {result.availabilityHint && (
                    <div className="mt-4 space-y-3">
                      <p className="text-sm">
                        Preço estimado:{" "}
                        <span className="font-bold">{formatCurrency(result.price)}/ano</span> no
                        parceiro
                      </p>
                      <Button
                        variant="green"
                        className="w-full sm:w-auto"
                        disabled={!canUseDomains}
                        onClick={handleRegisterExternal}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Registar no parceiro (checkout real)
                      </Button>
                      {result.partners && result.partners.length > 1 && (
                        <div className="flex flex-wrap gap-2">
                          {result.partners.slice(1).map((p) => (
                            <Button key={p.id} variant="outline" size="sm" asChild>
                              <a href={p.url} target="_blank" rel="noopener noreferrer">
                                {p.name}
                              </a>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-5 w-5 text-green" />
                Já tenho um domínio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Comprou noutro registrador? Adicione aqui e configure o DNS — não cobramos registo
                falso.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="ex: meudominio.pt"
                  value={connectInput}
                  onChange={(e) => setConnectInput(e.target.value)}
                  disabled={!canUseDomains}
                />
                <Button
                  variant="outline"
                  disabled={!canUseDomains || !connectInput.trim()}
                  onClick={() => handleConnectExisting(connectInput)}
                >
                  Ligar domínio
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base">Os seus domínios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {domains.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum domínio ligado. Pesquise acima ou adicione um domínio existente.
                </p>
              ) : (
                domains.map((d) => {
                  const linkedPage = pages.find((p) => p.id === d.linkedPageId);
                  const isActive = d.status === "active" && d.dnsVerified;
                  return (
                    <div key={d.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-purple-bright" />
                          <div>
                            <p className="font-medium">{d.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {d.status === "pending"
                                ? "Pendente — configure DNS para activar"
                                : d.status === "active"
                                  ? `Activo · expira ${new Date(d.expiresAt).toLocaleDateString("pt-PT")}`
                                  : "Expirado"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={isActive ? "green" : d.status === "pending" ? "warning" : "secondary"}>
                            {isActive ? "Activo" : d.status === "pending" ? "Pendente" : d.status}
                          </Badge>
                          {d.dnsVerified && <Badge variant="green">DNS OK</Badge>}
                          {linkedPage && <Badge variant="outline">→ {linkedPage.name}</Badge>}
                        </div>
                      </div>
                      {!d.dnsVerified && (
                        <div className="mt-3 rounded-lg bg-surface/80 p-3 text-xs">
                          <p className="font-medium">Configurar DNS no seu registrador:</p>
                          <p className="mt-1 text-muted-foreground">
                            CNAME @ → <span className="text-green">pages.vexa.pt</span>
                          </p>
                          <p className="mt-2 text-muted-foreground">
                            Após propagar (até 48h), clique em verificar. Só então o domínio fica
                            activo no VEXA.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={() => verifyDomainDns(d.id)}
                          >
                            <Check className="h-3 w-3" /> Verificar DNS
                          </Button>
                        </div>
                      )}
                      {d.dnsVerified && !d.linkedPageId && pages.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-2 text-xs text-muted-foreground">Ligar à landing page:</p>
                          <div className="flex flex-wrap gap-2">
                            {pages.map((p) => (
                              <Button
                                key={p.id}
                                size="sm"
                                variant="outline"
                                onClick={() => linkDomainToPage(d.id, p.id)}
                              >
                                {p.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
