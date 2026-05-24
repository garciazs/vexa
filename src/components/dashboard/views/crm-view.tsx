"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  Kanban,
  Plus,
  Target,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/lib/store/workspace-provider";
import { PIPELINE_STAGES, type LeadStatus } from "@/lib/store/types";
import { formatCurrency, formatPercent } from "@/lib/utils";

const statusColors: Record<string, "default" | "green" | "warning" | "success" | "secondary"> = {
  new: "default",
  qualified: "green",
  proposal: "warning",
  won: "success",
  lost: "secondary",
};

export function CrmView() {
  const { data, addLead, updateLeadStatus, crmMetrics } = useWorkspace();
  const leads = data?.leads ?? [];
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [value, setValue] = useState("");

  const chartData = PIPELINE_STAGES.map((s) => ({
    name: s.title,
    leads: crmMetrics.byStage[s.id],
  }));

  function handleAddLead(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    addLead({
      name: name.trim(),
      email: email.trim(),
      score: 50,
      value: Number(value) || 0,
      status: "new",
      source: "CRM manual",
      tags: [],
    });
    setName("");
    setEmail("");
    setValue("");
    setShowForm(false);
  }

  function moveLead(leadId: string, current: LeadStatus, direction: "prev" | "next") {
    const idx = PIPELINE_STAGES.findIndex((s) => s.id === current);
    const nextIdx = direction === "next" ? idx + 1 : idx - 1;
    if (nextIdx < 0 || nextIdx >= PIPELINE_STAGES.length) return;
    updateLeadStatus(leadId, PIPELINE_STAGES[nextIdx].id);
  }

  if (leads.length === 0 && !showForm) {
    return (
      <>
        <Header title="CRM" description="Pipeline visual, métricas em tempo real e gestão premium de leads" />
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <EmptyState
            icon={Kanban}
            title="Pipeline vazio"
            description="Adicione o seu primeiro lead para ver o dashboard e o kanban."
            actionLabel="Novo lead"
            onAction={() => setShowForm(true)}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="CRM" description="Pipeline visual, métricas em tempo real e gestão premium de leads" />
      <div className="flex-1 overflow-x-auto p-6 scrollbar-thin">
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="glass border-purple/10 transition hover:border-purple/25">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="rounded-lg bg-purple/10 p-2">
                <Users className="h-5 w-5 text-purple-bright" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total de leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
                <p className="text-xs text-green">+{crmMetrics.recentLeads} esta semana</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="rounded-lg bg-green/10 p-2">
                <Wallet className="h-5 w-5 text-green" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valor no pipeline</p>
                <p className="text-2xl font-bold">{formatCurrency(crmMetrics.pipelineValue)}</p>
                <p className="text-xs text-muted-foreground">excl. perdidos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Target className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taxa de fecho</p>
                <p className="text-2xl font-bold">{formatPercent(crmMetrics.winRate)}</p>
                <p className="text-xs text-muted-foreground">ganhos vs perdidos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="rounded-lg bg-cyan-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Receita ganha</p>
                <p className="text-2xl font-bold text-green">{formatCurrency(crmMetrics.wonValue)}</p>
                <p className="text-xs text-muted-foreground">
                  ticket médio {formatCurrency(crmMetrics.avgDeal)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass mb-6">
          <CardContent className="p-4">
            <p className="mb-4 text-sm font-medium">Leads por etapa do pipeline</p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#71717a" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#71717a" />
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid #3f3f46",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="leads" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancelar" : "Novo lead"}
          </Button>
        </div>

        {showForm && (
          <Card className="glass mb-6 max-w-md">
            <CardContent className="p-4">
              <form onSubmit={handleAddLead} className="space-y-3">
                <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="number"
                  placeholder="Valor (€)"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
                <Button type="submit" className="w-full">
                  Adicionar lead
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="flex min-w-max gap-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageLeads = leads.filter((l) => l.status === stage.id);
            const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
            return (
              <div key={stage.id} className="w-72 shrink-0">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">{stage.title}</h3>
                  <div className="text-right">
                    <Badge variant="secondary">{stageLeads.length}</Badge>
                    {stageValue > 0 && (
                      <p className="mt-0.5 text-xs text-green">{formatCurrency(stageValue)}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <Card key={lead.id} className="glass">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <p className="font-medium">{lead.name}</p>
                          <Badge variant={statusColors[lead.status] ?? "secondary"}>
                            {lead.score}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{lead.email}</p>
                        {lead.source && (
                          <p className="mt-1 truncate text-[10px] text-muted-foreground">{lead.source}</p>
                        )}
                        <p className="mt-2 text-sm font-semibold text-green">
                          {formatCurrency(lead.value)}
                        </p>
                        <div className="mt-3 flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveLead(lead.id, lead.status, "prev")}
                            disabled={stage.id === PIPELINE_STAGES[0].id}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => moveLead(lead.id, lead.status, "next")}
                            disabled={stage.id === PIPELINE_STAGES[PIPELINE_STAGES.length - 1].id}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      Sem leads
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
