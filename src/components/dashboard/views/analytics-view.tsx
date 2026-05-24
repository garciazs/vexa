"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/lib/store/workspace-provider";
import { PIPELINE_STAGES } from "@/lib/store/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

export function AnalyticsView() {
  const { data, metrics } = useWorkspace();
  const leads = data?.leads ?? [];

  const metricCards = [
    {
      label: "Receita fechada",
      value: formatCurrency(metrics.revenue),
      change: 0,
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

  const funnelData = PIPELINE_STAGES.map((stage) => ({
    stage: stage.title,
    value: leads.filter((l) => l.status === stage.id).length,
  }));

  const hasFunnelData = funnelData.some((d) => d.value > 0);
  const hasAnyData = metrics.leadsCount > 0 || metrics.publishedPages > 0;

  return (
    <>
      <Header title="Analytics" description="Métricas e funil de conversão" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>

        {!hasAnyData ? (
          <div className="mt-8">
            <EmptyState
              icon={BarChart3}
              title="Sem dados ainda"
              description="Publique landing pages e capture leads para ver gráficos e métricas detalhadas."
              actionLabel="Criar landing page"
              actionHref="/builder"
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Leads por etapa</CardTitle>
              </CardHeader>
              <CardContent>
                {hasFunnelData ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={funnelData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                      <XAxis type="number" stroke="#71717a" fontSize={12} allowDecimals={false} />
                      <YAxis
                        dataKey="stage"
                        type="category"
                        stroke="#71717a"
                        fontSize={12}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#121218",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" fill="#84cc16" radius={[0, 4, 4, 0]} name="Leads" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="py-12 text-center text-sm text-muted-foreground">
                    Sem leads no pipeline — adicione leads no CRM para ver o funil.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Total de leads</span>
                  <span className="font-semibold">{metrics.leadsCount}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Receita ganha</span>
                  <span className="font-semibold text-green">{formatCurrency(metrics.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Páginas publicadas</span>
                  <span className="font-semibold">{metrics.publishedPages}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
