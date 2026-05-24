"use client";

import Link from "next/link";
import { ArrowRight, Crown, Layers, Plus, Users } from "lucide-react";
import { normalizePlanId } from "@/lib/templates/catalog";
import type { PlanId } from "@/lib/store/types";
import { Header } from "@/components/dashboard/header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/lib/store/workspace-provider";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function DashboardView() {
  const { data, metrics, canCreateLandingPage } = useWorkspace();
  const pages = data?.landingPages ?? [];
  const leads = data?.leads ?? [];
  const planId = normalizePlanId(data?.workspace.plan) as PlanId;
  const canCreateMore = canCreateLandingPage;

  const metricCards = [
    {
      label: "Receita fechada",
      value: formatCurrency(metrics.revenue),
      change: metrics.revenue > 0 ? 0 : 0,
      trend: "up" as const,
    },
    {
      label: "Leads capturados",
      value: String(metrics.leadsCount),
      change: 0,
      trend: "up" as const,
    },
    {
      label: "Taxa de conversão",
      value: metrics.conversionRate > 0 ? formatPercent(metrics.conversionRate) : "—",
      change: 0,
      trend: "up" as const,
    },
    {
      label: "Páginas publicadas",
      value: String(metrics.publishedPages),
      change: 0,
      trend: "up" as const,
    },
  ];

  return (
    <>
      <Header title="Visão geral" description={`Workspace: ${data?.workspace.name ?? "—"}`} />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mb-6 flex justify-end">
          {canCreateMore ? (
            <Button asChild>
              <Link href="/builder">
                <Plus className="h-4 w-4" />
                Nova landing page
              </Link>
            </Button>
          ) : (
            <Button variant="green" asChild>
              <Link href="/billing">
                <Crown className="h-4 w-4" />
                {planId === "free" ? "Assinar para mais sites" : "Upgrade de plano"}
              </Link>
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Landing pages</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/builder">
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {pages.length === 0 ? (
                <EmptyState
                  icon={Layers}
                  title="Nenhuma landing page"
                  description="Crie a sua primeira página ou comece por um template pronto."
                  actionLabel="Criar página"
                  actionHref="/builder"
                  className="py-10"
                />
              ) : (
                <div className="space-y-3">
                  {pages.slice(0, 5).map((page) => (
                    <Link
                      key={page.id}
                      href={`/builder/${page.id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-3 transition hover:border-purple/30"
                    >
                      <div>
                        <p className="font-medium">{page.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {page.views} views • {page.leadsCount} leads
                        </p>
                      </div>
                      <Badge variant={page.status === "published" ? "green" : "secondary"}>
                        {page.status === "published" ? "Publicada" : "Rascunho"}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Leads recentes</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/crm">
                  Ver CRM
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Sem leads ainda"
                  description="Publique uma landing page com formulário ou adicione leads manualmente no CRM."
                  actionLabel="Ir para CRM"
                  actionHref="/crm"
                  className="py-10"
                />
              ) : (
                <div className="space-y-3">
                  {leads.slice(0, 5).map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.source}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green">
                          {formatCurrency(lead.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">Score {lead.score}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
