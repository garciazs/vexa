"use client";

import { useRouter } from "next/navigation";
import { Crown, Lock, Sparkles } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import {
  FREE_STARTER_TEMPLATE_ID,
  TEMPLATE_CATALOG,
  canUseTemplate,
  normalizePlanId,
} from "@/lib/templates/catalog";
import type { PlanId } from "@/lib/store/types";
import { PageLimitBanner } from "@/components/dashboard/page-limit-banner";
import { TEMPLATE_PREVIEW_IMAGES } from "@/lib/templates/template-images";
import { useWorkspace } from "@/lib/store/workspace-provider";
import { cn } from "@/lib/utils";

export function TemplatesView() {
  const router = useRouter();
  const { data, createLandingPage, canCreateLandingPage, canUseAIGeneration } = useWorkspace();
  const plan = normalizePlanId(data?.workspace.plan) as PlanId;
  const pageCount = data?.landingPages.length ?? 0;
  const publishedTotal = Math.max(
    data?.workspace.landingPagesPublishedTotal ?? 0,
    data?.landingPages.filter((p) => p.status === "published").length ?? 0
  );
  const canCreateMore = canCreateLandingPage;

  function applyTemplate(templateId: string, templateName: string) {
    if (!canCreateMore) return;
    const id = createLandingPage({ templateId, name: templateName });
    if (!id) {
      alert("Limite de sites atingido. Faça upgrade para criar mais.");
      return;
    }
    router.push(`/builder/${id}`);
  }

  return (
    <>
      <Header
        title="Templates"
        description={
          plan === "free"
            ? "Plano Free: edite o template grátis ou faça upgrade para desbloquear todos"
            : "Funis premium testados e otimizados"
        }
      />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <PageLimitBanner
          planId={plan}
          pageCount={pageCount}
          publishedTotal={publishedTotal}
          atLimit={!canUseAIGeneration}
          existingPageId={data?.landingPages[0]?.id}
          className="mb-6"
        />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {TEMPLATE_CATALOG.map((tpl) => {
            const allowed = canUseTemplate(plan, tpl);
            const isFreeStarter = tpl.id === FREE_STARTER_TEMPLATE_ID;

            return (
              <Card key={tpl.id} className={cn(
                  "glass overflow-hidden transition hover:border-purple/30",
                  isFreeStarter && "ring-2 ring-green/40",
                  !allowed && "opacity-75"
                )}
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={TEMPLATE_PREVIEW_IMAGES[tpl.id] ?? TEMPLATE_PREVIEW_IMAGES["free-starter"]}
                    alt={tpl.name}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {isFreeStarter && (
                    <Badge className="absolute left-3 top-3 gap-1 bg-green/20 text-green-bright">
                      <Sparkles className="h-3 w-3" />
                      Grátis
                    </Badge>
                  )}
                  {tpl.premium && (
                    <Badge className="absolute right-3 top-3 gap-1">
                      <Crown className="h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                  {!allowed && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <Lock className="h-8 w-8 text-white/70" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{tpl.name}</CardTitle>
                    <Badge variant="secondary">{tpl.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{tpl.description}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{tpl.blocks.length} blocos incluídos</p>
                  {allowed && canCreateMore ? (
                    <Button
                      className="mt-4 w-full"
                      variant={isFreeStarter || tpl.premium ? "green" : "default"}
                      onClick={() => applyTemplate(tpl.id, tpl.name)}
                    >
                      <Sparkles className="h-4 w-4" />
                      Usar template
                    </Button>
                  ) : !canCreateMore ? (
                    <Button className="mt-4 w-full" variant="outline" asChild>
                      <a href="/billing">Limite de sites — fazer upgrade</a>
                    </Button>
                  ) : (
                    <Button className="mt-4 w-full" variant="outline" asChild>
                      <a href="/billing">Fazer upgrade</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
