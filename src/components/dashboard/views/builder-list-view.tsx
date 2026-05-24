"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Crown, Layers, Plus, Sparkles, Wand2 } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PageLimitBanner } from "@/components/dashboard/page-limit-banner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/lib/store/workspace-provider";
import { normalizePlanId } from "@/lib/templates/catalog";
import type { PlanId } from "@/lib/store/types";
import { formatPercent } from "@/lib/utils";

const thumbnailStyles = [
  "from-purple/40 to-purple/10",
  "from-green/40 to-green/10",
  "from-surface-hover to-surface",
];

export function BuilderListView() {
  const router = useRouter();
  const { data, createLandingPage, canCreateLandingPage, canUseAIGeneration } = useWorkspace();
  const pages = data?.landingPages ?? [];
  const planId = normalizePlanId(data?.workspace.plan) as PlanId;
  const pageCount = pages.length;
  const publishedTotal = Math.max(
    data?.workspace.landingPagesPublishedTotal ?? 0,
    pages.filter((p) => p.status === "published").length
  );
  const canCreateMore = canCreateLandingPage;
  const canUseAI = canUseAIGeneration;
  const firstPageId = pages[0]?.id;

  function handleNewPage() {
    if (!canCreateMore) return;
    const id = createLandingPage();
    if (!id) {
      alert("Limite de sites atingido no seu plano. Faça upgrade em Billing.");
      return;
    }
    router.push(`/builder/${id}`);
  }

  return (
    <>
      <Header title="Landing Pages" description="Crie e gerencie as suas páginas de conversão" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <PageLimitBanner
          planId={planId}
          pageCount={pageCount}
          publishedTotal={publishedTotal}
          atLimit={!canUseAI}
          existingPageId={firstPageId}
          className="mb-6"
        />

        {canUseAI ? (
          <Link href="/builder/ai">
            <Card className="glass mb-6 overflow-hidden border-purple/30 bg-gradient-to-r from-purple/15 via-transparent to-green/10 transition hover:border-purple/50">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple to-green">
                    <Wand2 className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <CardTitle className="text-lg">Criar site</CardTitle>
                      <Badge variant="green">Profissional</Badge>
                      {planId === "free" && (
                        <Badge variant="warning">1 site grátis</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Descreva o negócio, cores e envie fotos — site completo pronto para publicar.
                      {planId === "free" && publishedTotal === 0 && " Grátis até publicar 1 site."}
                    </p>
                  </div>
                </div>
                <Button variant="green" size="lg" className="shrink-0">
                  <Sparkles className="h-4 w-4" />
                  Criar site
                </Button>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card className="glass mb-6 border-border opacity-90">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-elevated">
                  <Wand2 className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Criar outro site</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {planId === "free"
                      ? "No Free só pode ter 1 site. Assine para criar mais."
                      : "Limite de sites do seu plano atingido."}
                  </p>
                </div>
              </div>
              <Button variant="green" asChild>
                <Link href="/billing">
                  <Crown className="h-4 w-4" />
                  Assinar
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {canCreateMore ? (
            <Button variant="outline" asChild>
              <Link href="/templates">
                <Sparkles className="h-4 w-4" />
                Usar template
              </Link>
            </Button>
          ) : (
            <Button variant="outline" disabled title="Limite de sites atingido">
              <Sparkles className="h-4 w-4" />
              Usar template
            </Button>
          )}
          <div className="flex gap-2">
            {canCreateMore ? (
              <>
                <Button variant="outline" asChild>
                  <Link href="/builder/ai">
                    <Wand2 className="h-4 w-4" />
                    IA
                  </Link>
                </Button>
                <Button onClick={handleNewPage}>
                  <Plus className="h-4 w-4" />
                  Nova página
                </Button>
              </>
            ) : (
              firstPageId && (
                <Button variant="outline" asChild>
                  <Link href={`/builder/${firstPageId}`}>Editar site</Link>
                </Button>
              )
            )}
          </div>
        </div>

        {pages.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="Nenhuma landing page"
            description={
              planId === "free"
                ? "Crie o seu único site grátis com IA — qualidade 100%."
                : "Descreva o seu negócio e tenha um site profissional em minutos."
            }
            actionLabel="Criar site"
            onAction={() => router.push("/builder/ai")}
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {pages.map((page, i) => {
              const conv =
                page.views > 0 ? ((page.leadsCount / page.views) * 100).toFixed(1) : 0;
              return (
                <Link key={page.id} href={`/builder/${page.id}`}>
                  <Card className="glass overflow-hidden transition hover:border-purple/30">
                    <div
                      className={`h-32 bg-gradient-to-br ${thumbnailStyles[i % thumbnailStyles.length]}`}
                    />
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base">{page.name}</CardTitle>
                        <Badge variant={page.status === "published" ? "green" : "secondary"}>
                          {page.status === "published" ? "Publicada" : "Rascunho"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">/{page.slug}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="font-semibold">{page.views.toLocaleString("pt-PT")}</p>
                          <p className="text-muted-foreground">Views</p>
                        </div>
                        <div>
                          <p className="font-semibold">{page.leadsCount}</p>
                          <p className="text-muted-foreground">Leads</p>
                        </div>
                        <div>
                          <p className="font-semibold text-green">
                            {Number(conv) > 0 ? formatPercent(Number(conv)) : "—"}
                          </p>
                          <p className="text-muted-foreground">Conv.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
