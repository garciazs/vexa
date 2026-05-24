"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLimitBanner } from "@/components/dashboard/page-limit-banner";
import { useWorkspace } from "@/lib/store/workspace-provider";
import { ONBOARDING_STEPS, type PlanId } from "@/lib/store/types";
import { normalizePlanId } from "@/lib/templates/catalog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "Curso online de marketing digital",
  "Mentoria fitness 1:1",
  "Webinar gratuito sobre vendas",
  "Programa de coaching executivo",
  "Lançamento de produto SaaS",
];

export function OnboardingView() {
  const router = useRouter();
  const { data, createLandingPage, canCreateLandingPage } = useWorkspace();
  const completed = data?.onboardingSteps ?? [];
  const planId = normalizePlanId(data?.workspace.plan) as PlanId;
  const pageCount = data?.landingPages.length ?? 0;
  const canCreateMore = canCreateLandingPage;
  const firstPageId = data?.landingPages[0]?.id;

  function handleSuggestion(suggestion: string) {
    if (!canCreateMore) return;
    const id = createLandingPage({ name: suggestion });
    if (id) router.push(`/builder/${id}`);
  }

  return (
    <>
      <Header title="Onboarding" description="Configure o VEXA em 5 minutos" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card className="glass glow-purple border-purple/30">
            <CardHeader>
              <CardTitle>Bem-vindo ao VEXA!</CardTitle>
              <CardDescription>
                Complete estes passos para lançar a sua máquina de vendas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ONBOARDING_STEPS.map((step) => {
                const done = completed.includes(step.id);
                return (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <CheckCircle2
                      className={`h-5 w-5 ${done ? "text-green" : "text-muted"}`}
                    />
                    <span className={done ? "text-muted-foreground line-through" : ""}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <PageLimitBanner
            planId={planId}
            pageCount={pageCount}
            atLimit={!canCreateMore}
            existingPageId={firstPageId}
          />

          <Card className="glass">
            <CardHeader>
              <CardTitle>O que quer vender?</CardTitle>
              <CardDescription>
                {canCreateMore
                  ? "Escolha uma sugestão para criar a sua primeira página"
                  : "Já tem o seu site — edite-o ou faça upgrade para criar mais"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {canCreateMore ? (
                SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestion(suggestion)}
                    className="w-full rounded-lg border border-border p-3 text-left text-sm transition hover:border-purple/30 hover:bg-surface-hover"
                  >
                    {suggestion}
                  </button>
                ))
              ) : (
                <div className="flex flex-wrap gap-2">
                  {firstPageId && (
                    <Button asChild>
                      <Link href={`/builder/${firstPageId}`}>Editar o meu site</Link>
                    </Button>
                  )}
                  <Button variant="green" asChild>
                    <Link href="/billing">Assinar para mais sites</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
