"use client";

import { useState } from "react";
import {
  Camera,
  Mail,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Trash2,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  CHANNEL_OPTIONS,
  createDefaultAction,
  TRIGGER_OPTIONS,
} from "@/lib/automation/engine";
import { useWorkspace } from "@/lib/store/workspace-provider";
import type { AutomationAction, AutomationRecord, AutomationTrigger } from "@/lib/store/types";

const channelIcons = {
  whatsapp: MessageCircle,
  instagram: Camera,
  web_chat: MessageCircle,
  email: Mail,
};

export function AutomationsView() {
  const {
    data,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    messageLogs,
  } = useWorkspace();
  const automations = (data?.automations ?? []) as AutomationRecord[];
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState<AutomationTrigger>("new_lead");
  const [smartMode, setSmartMode] = useState(true);
  const [actions, setActions] = useState<AutomationAction[]>([createDefaultAction("whatsapp")]);

  function resetForm() {
    setName("");
    setTrigger("new_lead");
    setSmartMode(true);
    setActions([createDefaultAction("whatsapp")]);
    setEditingId(null);
    setShowForm(false);
  }

  function loadForEdit(auto: AutomationRecord) {
    setEditingId(auto.id);
    setName(auto.name);
    setTrigger(auto.trigger as AutomationTrigger);
    setSmartMode(auto.smartMode !== false);
    setActions(Array.isArray(auto.actions) ? (auto.actions as AutomationAction[]) : []);
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (editingId) {
      updateAutomation(editingId, { name: name.trim(), trigger, actions, smartMode });
    } else {
      createAutomation({ name: name.trim(), trigger, actions, smartMode });
    }
    resetForm();
  }

  function addAction() {
    setActions((prev) => [...prev, createDefaultAction("instagram")]);
  }

  function updateAction(id: string, patch: Partial<AutomationAction>) {
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function removeAction(id: string) {
    setActions((prev) => prev.filter((a) => a.id !== id));
  }

  const triggerLabel = (t: string) =>
    TRIGGER_OPTIONS.find((o) => o.value === t)?.label ?? t;

  return (
    <>
      <Header
        title="Automações"
        description="Workflows inteligentes — IA contextual, intenção e mensagens naturais"
      />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            IA adapta mensagens ao contexto, intenção de compra e sentimento do lead.
          </p>
          <Button onClick={() => (showForm ? resetForm() : setShowForm(true))}>
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancelar" : "Nova automação"}
          </Button>
        </div>

        {showForm && (
          <Card className="glass mb-6 border-purple/20">
            <CardHeader>
              <CardTitle className="text-base">
                {editingId ? "Editar automação" : "Criar fluxo automático"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  placeholder="Nome da automação"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    Gatilho
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value as AutomationTrigger)}
                  >
                    {TRIGGER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} — {opt.description}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={smartMode}
                    onChange={(e) => setSmartMode(e.target.checked)}
                    className="rounded border-border"
                  />
                  IA inteligente — personaliza mensagens, detecta intenção e ajusta timing
                </label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Ações automáticas</p>
                    <Button type="button" variant="outline" size="sm" onClick={addAction}>
                      <Plus className="h-3 w-3" /> Adicionar canal
                    </Button>
                  </div>
                  {actions.map((action, idx) => (
                    <Card key={action.id} className="border-border/60 bg-surface/50">
                      <CardContent className="space-y-3 p-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">Passo {idx + 1}</Badge>
                          {actions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAction(action.id)}
                            >
                              <Trash2 className="h-4 w-4 text-danger" />
                            </Button>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">Canal</label>
                            <select
                              className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                              value={action.channel}
                              onChange={(e) =>
                                updateAction(action.id, {
                                  channel: e.target.value as AutomationAction["channel"],
                                })
                              }
                            >
                              {CHANNEL_OPTIONS.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                              Atraso (minutos)
                            </label>
                            <Input
                              type="number"
                              min={0}
                              value={action.delayMinutes}
                              onChange={(e) =>
                                updateAction(action.id, {
                                  delayMinutes: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Mensagem (use {"{{nome}}"} e {"{{email}}"})
                          </label>
                          <textarea
                            className="min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                            value={action.message}
                            onChange={(e) => updateAction(action.id, { message: e.target.value })}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button type="submit" className="w-full">
                  {editingId ? "Guardar alterações" : "Criar automação"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {automations.length === 0 ? (
          <EmptyState
            icon={Workflow}
            title="Nenhuma automação"
            description="Configure mensagens automáticas para WhatsApp, Instagram e chatbots quando entrar um lead."
            actionLabel="Nova automação"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="space-y-4">
            {automations.map((auto) => (
              <Card key={auto.id} className="glass">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green/10">
                        <Zap className="h-5 w-5 text-green" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{auto.name}</CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Gatilho: {triggerLabel(auto.trigger as string)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={auto.status === "active" ? "green" : "secondary"}>
                        {auto.status === "active" ? "Ativa" : "Pausada"}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => loadForEdit(auto)}>
                        Editar
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleAutomation(auto.id)}>
                        {auto.status === "active" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteAutomation(auto.id)}>
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(auto.actions as AutomationAction[]).map((action) => {
                      const Icon = channelIcons[action.channel];
                      return (
                        <Badge key={action.id} variant="outline" className="gap-1.5 py-1">
                          <Icon className="h-3 w-3" />
                          {CHANNEL_OPTIONS.find((c) => c.value === action.channel)?.label}
                          {action.delayMinutes > 0 && ` (+${action.delayMinutes}min)`}
                        </Badge>
                      );
                    })}
                  </div>
                  <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
                    <span>{auto.runs.toLocaleString("pt-PT")} execuções</span>
                    {auto.lastRunAt && (
                      <span>Última: {new Date(auto.lastRunAt).toLocaleString("pt-PT")}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {messageLogs.length > 0 && (
          <Card className="glass mt-8">
            <CardHeader>
              <CardTitle className="text-base">Histórico de mensagens automáticas</CardTitle>
            </CardHeader>
            <CardContent className="max-h-64 space-y-2 overflow-y-auto">
              {messageLogs.slice(0, 20).map((log) => {
                const Icon = channelIcons[log.channel];
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 rounded-lg border border-border/60 p-3 text-sm"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-purple-bright" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {log.leadName ?? "Lead"} · {log.automationName}
                      </p>
                      <p className="truncate text-muted-foreground">{log.message}</p>
                      {(log.intent || log.sentiment) && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {log.intent && (
                            <Badge variant="outline" className="text-[9px] capitalize">
                              {log.intent}
                            </Badge>
                          )}
                          {log.sentiment && (
                            <Badge variant="outline" className="text-[9px] capitalize">
                              {log.sentiment}
                            </Badge>
                          )}
                          {log.buyingIntent && log.buyingIntent !== "low" && (
                            <Badge variant="green" className="text-[9px]">
                              compra {log.buyingIntent}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <Badge variant={log.status === "sent" ? "green" : "secondary"}>
                      {log.status === "sent" ? "Enviada" : "Agendada"}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
