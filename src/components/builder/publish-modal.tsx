"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DomainRecord, LandingPageRecord } from "@/lib/store/types";

interface PublishModalProps {
  page: LandingPageRecord;
  domains: DomainRecord[];
  onClose: () => void;
  onLinkDomain: (domainId: string) => void;
  publicUrl: string;
}

export function PublishModal({
  page,
  domains,
  onClose,
  onLinkDomain,
  publicUrl,
}: PublishModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const activeDomains = domains.filter((d) => d.status === "active");
  const linked = domains.find((d) => d.linkedPageId === page.id);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <Card className="glass w-full max-w-lg border-green/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="green" className="mb-2">
                Publicada com sucesso
              </Badge>
              <CardTitle>{page.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                A sua landing page está online e pronta para receber visitantes.
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border bg-surface/50 p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              URL pública VEXA
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate text-sm text-green-bright">{publicUrl}</code>
              <Button variant="outline" size="icon" onClick={() => copy(publicUrl, "vexa")}>
                {copied === "vexa" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={publicUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {linked ? (
            <div className="rounded-xl border border-green/30 bg-green/5 p-4">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-green" />
                <p className="font-medium">Domínio personalizado ativo</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                https://{linked.name}
                {linked.dnsVerified ? (
                  <Badge variant="green" className="ml-2">
                    DNS verificado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="ml-2">
                    Aguarda DNS
                  </Badge>
                )}
              </p>
              {!linked.dnsVerified && (
                <div className="mt-3 rounded-lg bg-black/30 p-3 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">Configure o DNS:</p>
                  <p className="mt-1">Tipo: CNAME · Nome: @ ou www</p>
                  <p>
                    Valor: <span className="text-green">pages.vexa.pt</span>
                  </p>
                </div>
              )}
            </div>
          ) : activeDomains.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-medium">Ligar domínio comprado</p>
              <div className="space-y-2">
                {activeDomains
                  .filter((d) => !d.linkedPageId)
                  .map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onLinkDomain(d.id)}
                      className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left text-sm transition hover:border-purple/40"
                    >
                      <span>{d.name}</span>
                      <Badge variant="outline">Ligar</Badge>
                    </button>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Compre um domínio em{" "}
              <a href="/domains" className="text-purple-bright hover:underline">
                Domínios
              </a>{" "}
              para usar https://seusite.pt
            </p>
          )}

          <Button className="w-full" onClick={onClose}>
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
