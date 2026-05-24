"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Crown, ExternalLink, Loader2 } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { StripeUpgradeButton } from "@/components/billing/stripe-upgrade-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/constants";
import { useWorkspace } from "@/lib/store/workspace-provider";
import type { PlanId } from "@/lib/store/types";
import { cn, formatCurrency } from "@/lib/utils";

const PAID_PLANS: PlanId[] = ["starter", "growth", "scale"];

export function BillingView() {
  const searchParams = useSearchParams();
  const { data, syncPlanFromStripe, hasStripeSubscription } = useWorkspace();
  const planId = (data?.workspace.plan ?? "free") as PlanId;

  const [portalLoading, setPortalLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [checkoutAvailable, setCheckoutAvailable] = useState(true);

  const workspaceId = data?.workspace.id ?? "";
  const email = data?.user.email ?? "";

  useEffect(() => {
    if (!workspaceId) return;
    fetch(`/api/stripe/subscription?workspaceId=${encodeURIComponent(workspaceId)}`)
      .then((r) => r.json())
      .then((json) => {
        setCheckoutAvailable(json.configured !== false);
        if (json.planId && json.planId !== planId) {
          syncPlanFromStripe(json.planId);
        }
      })
      .catch(() => setCheckoutAvailable(false));
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
      setNotice("Não foi possível concluir o pagamento. Tente novamente ou contacte o suporte.");
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
        .catch(() => setNotice("A confirmar pagamento — o plano será activado em breve."));
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
      else alert("Não foi possível abrir a gestão da subscrição.");
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <>
      <Header title="Planos" description="Escolha o plano ideal para o seu negócio" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mx-auto max-w-4xl space-y-6">
          {notice && (
            <Card className="glass border-green/30 bg-green/5">
              <CardContent className="p-4 text-sm text-green-bright">{notice}</CardContent>
            </Card>
          )}

          {!checkoutAvailable && (
            <Card className="glass border-border">
              <CardContent className="p-4 text-sm text-muted-foreground">
                As assinaturas estarão disponíveis em breve.
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {PAID_PLANS.map((id) => {
              const plan = PLANS.find((p) => p.id === id)!;
              const isCurrent = planId === id;
              return (
                <Card
                  key={id}
                  className={cn(
                    "glass relative overflow-hidden",
                    plan.popular && "border-purple/40 ring-1 ring-purple/20",
                    isCurrent && "border-green/40 bg-green/5"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute right-3 top-3">
                      <Badge variant="green">
                        <Crown className="mr-1 h-3 w-3" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {formatCurrency(plan.price)}
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6">
                      {isCurrent ? (
                        <Badge variant="green" className="w-full justify-center py-2">
                          Plano actual
                        </Badge>
                      ) : (
                        <StripeUpgradeButton
                          className="w-full"
                          planId={id}
                          workspaceId={workspaceId}
                          email={email}
                          label={`Assinar ${plan.name}`}
                          disabled={!checkoutAvailable}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {planId === "free" && (
            <Card className="glass border-border">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">Plano Free</p>
                  <p className="text-sm text-muted-foreground">
                    1 site grátis com IA — publique-o e escolha um plano acima para criar mais.
                  </p>
                </div>
                <Badge variant="outline">Actual</Badge>
              </CardContent>
            </Card>
          )}

          {hasStripeSubscription && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" disabled={portalLoading} onClick={openPortal}>
                {portalLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4" />
                )}
                Gerir subscrição, cartão e faturas
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
