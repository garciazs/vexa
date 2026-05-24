"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, CreditCard, ExternalLink, FileText, Loader2 } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PlanLimitsCard } from "@/components/dashboard/plan-limits-card";
import { StripeUpgradeButton } from "@/components/billing/stripe-upgrade-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/constants";
import { useWorkspace } from "@/lib/store/workspace-provider";
import type { PlanId } from "@/lib/store/types";
import { formatCurrency } from "@/lib/utils";

export function BillingView() {
  const searchParams = useSearchParams();
  const { data, syncPlanFromStripe, hasStripeSubscription } = useWorkspace();
  const planId = (data?.workspace.plan ?? "free") as PlanId;
  const currentPlan = PLANS.find((p) => p.id === planId) ?? PLANS[0];

  const [portalLoading, setPortalLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null);

  const workspaceId = data?.workspace.id ?? "";
  const email = data?.user.email ?? "";

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/stripe/subscription?workspaceId=${encodeURIComponent(workspaceId)}`)
      .then((r) => r.json())
      .then((json) => {
        setStripeConfigured(json.configured ?? false);
        if (json.planId && json.planId !== planId) {
          syncPlanFromStripe(json.planId);
        }
      })
      .catch(() => setStripeConfigured(false));
  }, [workspaceId, planId, syncPlanFromStripe]);

  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");
    const canceled = searchParams.get("canceled");
    const error = searchParams.get("error");

    if (canceled) {
      setNotice("Checkout cancelado. Pode tentar novamente quando quiser.");
      return;
    }
    if (error) {
      setNotice("Não foi possível iniciar o pagamento. Verifique a configuração Stripe.");
      return;
    }
    if (success === "1" && sessionId && workspaceId) {
      setNotice("A confirmar pagamento…");
      fetch("/api/stripe/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, workspaceId }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.planId) {
            syncPlanFromStripe(json.planId);
            setNotice(`Plano ${json.planId} activado com sucesso. Obrigado!`);
          } else {
            setNotice(json.error ?? "Pagamento pendente de confirmação.");
          }
        })
        .catch(() => setNotice("Erro ao confirmar pagamento. O webhook activará o plano em breve."));
    }
  }, [searchParams, workspaceId, syncPlanFromStripe]);

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else alert(json.error ?? "Portal indisponível.");
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <>
      <Header title="Billing" description="Plano, pagamento Stripe e faturação" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mx-auto max-w-3xl space-y-6">
          {stripeConfigured === false && (
            <Card className="glass border-amber-500/30 bg-amber-500/5">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-amber-200">
                  Pagamentos ainda não configurados no servidor. Siga o guia passo a passo.
                </p>
                <Button variant="green" size="sm" asChild>
                  <Link href="/billing/setup">
                    <ExternalLink className="h-4 w-4" />
                    Onde obter as chaves Stripe
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {notice && (
            <Card className="glass border-green/30 bg-green/5">
              <CardContent className="p-4 text-sm text-green-bright">{notice}</CardContent>
            </Card>
          )}

          <Card className="glass glow-purple border-purple/30">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Plano actual: {currentPlan.name}</CardTitle>
                {planId !== "free" && (
                  <Badge variant="green">Activo</Badge>
                )}
              </div>
              <CardDescription>Workspace {data?.workspace.name ?? "—"}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(currentPlan.price)}
                <span className="text-base font-normal text-muted-foreground">/mês</span>
              </p>
              <ul className="mt-4 space-y-2">
                {currentPlan.features.slice(0, 5).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <Link href="/pricing">Ver todos os planos</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Escolher plano pago</CardTitle>
              <CardDescription>
                Pagamento seguro via Stripe — cartão, MB Way (se activo) e faturação automática
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              {(["starter", "growth", "scale"] as const).map((id) => {
                const plan = PLANS.find((p) => p.id === id)!;
                const isCurrent = planId === id;
                return (
                  <div
                    key={id}
                    className={`rounded-xl border p-4 ${
                      isCurrent ? "border-green/40 bg-green/5" : "border-border"
                    }`}
                  >
                    <p className="font-semibold">{plan.name}</p>
                    <p className="mt-1 text-2xl font-bold">{formatCurrency(plan.price)}</p>
                    <p className="text-xs text-muted-foreground">/mês</p>
                    {isCurrent ? (
                      <Badge className="mt-3" variant="green">
                        Plano actual
                      </Badge>
                    ) : (
                      <StripeUpgradeButton
                        className="mt-3 w-full"
                        planId={id}
                        workspaceId={workspaceId}
                        email={email}
                        label={`Assinar ${plan.name}`}
                        disabled={stripeConfigured === false}
                      />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <PlanLimitsCard currentPlanId={planId} />

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Método de pagamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasStripeSubscription ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Gerir cartão, faturas e cancelamento no portal seguro da Stripe.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    disabled={portalLoading}
                    onClick={openPortal}
                  >
                    {portalLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    Gerir pagamento na Stripe
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Nenhum método configurado. Escolha um plano acima para adicionar o cartão.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Histórico de faturas</CardTitle>
            </CardHeader>
            <CardContent>
              {hasStripeSubscription ? (
                <p className="text-sm text-muted-foreground">
                  As faturas estão disponíveis no{" "}
                  <button
                    type="button"
                    className="text-purple-bright hover:underline"
                    onClick={openPortal}
                  >
                    portal Stripe
                  </button>
                  .
                </p>
              ) : (
                <EmptyState
                  icon={FileText}
                  title="Sem faturas"
                  description="Após a primeira subscrição, as faturas aparecem no portal Stripe."
                  className="py-10"
                />
              )}
            </CardContent>
          </Card>

          <Card className="glass border-purple/20">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Configurar Stripe + Vercel</p>
                <p className="text-sm text-muted-foreground">
                  Links directos para API keys, produtos, webhook e variáveis na Vercel
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/billing/setup">
                  <ExternalLink className="h-4 w-4" />
                  Abrir guia completo
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
