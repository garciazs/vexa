"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLimitBanner } from "@/components/dashboard/page-limit-banner";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/store/workspace-provider";
import { ONBOARDING_STEPS, type PlanId } from "@/lib/store/types";
import { normalizePlanId } from "@/lib/templates/catalog";

const SUGGESTIONS = [
  "Barbearia premium preto e dourado em Lisboa",
  "Curso online de marketing digital",
  "Mentoria fitness 1:1 com agendamento",
  "Clínica de estética moderna e elegante",
  "SaaS B2B para equipas de vendas",
];

export function OnboardingView() {
  const router = useRouter();
  const { data, canUseAIGeneration } = useWorkspace();
  const completed = data?.onboardingSteps ?? [];
  const planId = normalizePlanId(data?.workspace.plan) as PlanId;
  const pageCount = data?.landingPages.length ?? 0;
  const publishedTotal = Math.max(
    data?.workspace.landingPagesPublishedTotal ?? 0,
    data?.landingPages.filter((p) => p.status === "published").length ?? 0
  );
  const firstPageId = data?.landingPages[0]?.id;
  const atPublishedLimit = !canUseAIGeneration;

  function startWithSuggestion(suggestion: string) {
    if (atPublishedLimit) return;
    router.push(`/builder/ai?prompt=${encodeURIComponent(suggestion)}`);
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
            publishedTotal={publishedTotal}
            atLimit={atPublishedLimit}
            existingPageId={firstPageId}
          />

          <Card className="glass">
            <CardHeader>
              <CardTitle>Crie o seu site com IA</CardTitle>
              <CardDescription>
                {atPublishedLimit
                  ? "Já publicou o seu site grátis — edite-o ou faça upgrade para criar outro"
                  : "Escolha uma sugestão ou descreva o seu negócio — a IA cria o site completo para publicar"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {!atPublishedLimit ? (
                <>
                  <Button variant="green" className="w-full" asChild>
                    <Link href="/builder/ai">
                      <Sparkles className="h-4 w-4" />
                      Abrir gerador de sites com IA
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground">Ou comece com uma sugestão:</p>
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => startWithSuggestion(suggestion)}
                      className="w-full rounded-lg border border-border p-3 text-left text-sm transition hover:border-purple/30 hover:bg-surface-hover"
                    >
                      {suggestion}
                    </button>
                  ))}
                </>
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
