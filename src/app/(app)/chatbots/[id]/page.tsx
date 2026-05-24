"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Wifi,
} from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { ChatSimulator } from "@/components/chatbot/chat-simulator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BOT_PERSONALITIES } from "@/lib/chatbot/personalities";
import { useWorkspace } from "@/lib/store/workspace-provider";
import type { BotFlowNode, BotChannel, BotKnowledgeItem, BotPersonalityId, ChatbotRecord } from "@/lib/store/types";
import { DEFAULT_FALLBACK, DEFAULT_WELCOME, normalizeChatbot } from "@/lib/chatbot/defaults";

const channelLabels: Record<BotChannel, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  web: "Chat Web",
};

export default function ChatbotEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, updateChatbot, connectChatbot, addLead } = useWorkspace();
  const bot = data?.chatbots.find((b) => b.id === id);

  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [flows, setFlows] = useState<BotFlowNode[]>([]);
  const [personality, setPersonality] = useState<BotPersonalityId>("support");
  const [smartMode, setSmartMode] = useState(true);
  const [knowledgeBase, setKnowledgeBase] = useState<BotKnowledgeItem[]>([]);
  const [connectAccount, setConnectAccount] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!bot) return;
    setWelcomeMessage(bot.welcomeMessage ?? DEFAULT_WELCOME);
    setFallbackMessage(bot.fallbackMessage ?? DEFAULT_FALLBACK);
    setFlows(bot.flows ?? []);
    setPersonality(bot.personality ?? "support");
    setSmartMode(bot.smartMode !== false);
    setKnowledgeBase(bot.knowledgeBase ?? []);
    setConnectAccount(bot.connectedAccount ?? "");
  }, [bot?.id]);

  if (!bot) {
    return (
      <>
        <Header title="Chatbot não encontrado" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <Button asChild>
            <Link href="/chatbots">← Voltar</Link>
          </Button>
        </div>
      </>
    );
  }

  const previewBot: ChatbotRecord = normalizeChatbot({
    ...bot,
    welcomeMessage,
    fallbackMessage,
    flows,
    personality,
    smartMode,
    knowledgeBase,
  });

  function updateNode(nodeId: string, patch: Partial<BotFlowNode>) {
    setFlows((prev) => prev.map((n) => (n.id === nodeId ? { ...n, ...patch } : n)));
    setSaved(false);
  }

  function addMessageNode() {
    setFlows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type: "message", text: "Nova mensagem automática do bot" },
    ]);
    setSaved(false);
  }

  function addOptionsNode() {
    setFlows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "options",
        text: "Escolha uma opção:",
        options: [
          { label: "Opção 1", nextId: "" },
          { label: "Opção 2", nextId: "" },
        ],
      },
    ]);
    setSaved(false);
  }

  function removeNode(nodeId: string) {
    setFlows((prev) => prev.filter((n) => n.id !== nodeId));
    setSaved(false);
  }

  function addKnowledgeItem() {
    setKnowledgeBase((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "Nova FAQ",
        content: "Resposta da base de conhecimento…",
        keywords: [],
        source: "faq",
      },
    ]);
    setSaved(false);
  }

  function handleSave() {
    updateChatbot(id, {
      welcomeMessage,
      fallbackMessage,
      flows,
      personality,
      smartMode,
      knowledgeBase,
      status: "active",
    });
    setSaved(true);
  }

  function handleConnect() {
    if (!bot) return;
    const account =
      connectAccount.trim() ||
      (bot.channel === "whatsapp"
        ? "+351 9XX XXX XXX"
        : bot.channel === "instagram"
          ? "@sua_empresa"
          : "widget.vexa.pt");
    connectChatbot(id, account);
  }

  function handleConversationStart() {
    if (!bot) return;
    addLead(
      {
        name: "Visitante chat",
        email: "chat@visitante.local",
        score: 10,
        value: 0,
        status: "new",
        source: `Chatbot: ${bot.name}`,
        tags: ["chatbot", bot.channel],
      },
      "chat_started"
    );
    updateChatbot(id, { conversations: bot.conversations + 1 });
  }

  const messageNodes = flows.filter((f) => f.type === "message" || f.type === "options");

  return (
    <>
      <Header
        title={bot.name}
        description={`IA conversacional · ${channelLabels[bot.channel]}`}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/chatbots">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Link>
            </Button>
            {saved && <span className="text-xs text-green">Guardado</span>}
            <Badge variant="green" className="gap-1">
              <Sparkles className="h-3 w-3" />
              IA inteligente
            </Badge>
            <Button size="sm" onClick={handleSave} className="ml-auto">
              <Save className="h-4 w-4" /> Guardar
            </Button>
          </div>

          <Card className="glass mb-6 border-purple/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-4 w-4 text-purple-bright" />
                Inteligência do bot
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Personalidade
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                  value={personality}
                  onChange={(e) => {
                    setPersonality(e.target.value as BotPersonalityId);
                    setSaved(false);
                  }}
                >
                  {Object.values(BOT_PERSONALITIES).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} — {p.description}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={smartMode}
                    onChange={(e) => {
                      setSmartMode(e.target.checked);
                      setSaved(false);
                    }}
                    className="rounded border-border"
                  />
                  Modo IA inteligente (memória, contexto, RAG)
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="glass mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wifi className="h-4 w-4 text-green" />
                Conectar {channelLabels[bot.channel]}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Input
                placeholder={
                  bot.channel === "whatsapp"
                    ? "Número WhatsApp Business"
                    : bot.channel === "instagram"
                      ? "@conta_instagram"
                      : "URL do widget"
                }
                value={connectAccount}
                onChange={(e) => setConnectAccount(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="green" onClick={handleConnect}>
                {bot.connected ? "Atualizar conexão" : "Simular conexão"}
              </Button>
              {bot.connected && (
                <Badge variant="green">Conectado · {bot.connectedAccount}</Badge>
              )}
            </CardContent>
          </Card>

          <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base">Mensagem de boas-vindas</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="min-h-[100px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  value={welcomeMessage}
                  onChange={(e) => {
                    setWelcomeMessage(e.target.value);
                    setSaved(false);
                  }}
                />
              </CardContent>
            </Card>
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-base">Resposta padrão (fallback)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="min-h-[100px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                  value={fallbackMessage}
                  onChange={(e) => {
                    setFallbackMessage(e.target.value);
                    setSaved(false);
                  }}
                />
              </CardContent>
            </Card>
          </div>

          <Card className="glass mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Base de conhecimento (FAQ / RAG)</CardTitle>
              <Button variant="outline" size="sm" onClick={addKnowledgeItem}>
                <Plus className="h-3 w-3" /> FAQ
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                A IA usa estes conteúdos para responder com precisão — além dos planos e fluxo VEXA.
              </p>
              {knowledgeBase.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sem FAQs custom — a IA usa conhecimento padrão VEXA (planos, domínios, automações).
                </p>
              ) : (
                knowledgeBase.map((item, idx) => (
                  <div key={item.id} className="rounded-lg border border-border p-3 space-y-2">
                    <Input
                      value={item.title}
                      onChange={(e) => {
                        const next = [...knowledgeBase];
                        next[idx] = { ...item, title: e.target.value };
                        setKnowledgeBase(next);
                        setSaved(false);
                      }}
                      placeholder="Título / pergunta"
                    />
                    <textarea
                      className="min-h-[60px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                      value={item.content}
                      onChange={(e) => {
                        const next = [...knowledgeBase];
                        next[idx] = { ...item, content: e.target.value };
                        setKnowledgeBase(next);
                        setSaved(false);
                      }}
                      placeholder="Resposta"
                    />
                    <Input
                      value={(item.keywords ?? []).join(", ")}
                      onChange={(e) => {
                        const next = [...knowledgeBase];
                        next[idx] = {
                          ...item,
                          keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean),
                        };
                        setKnowledgeBase(next);
                        setSaved(false);
                      }}
                      placeholder="Palavras-chave (separadas por vírgula)"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setKnowledgeBase((prev) => prev.filter((k) => k.id !== item.id));
                        setSaved(false);
                      }}
                    >
                      <Trash2 className="h-3 w-3" /> Remover
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Fluxo de conversa</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addMessageNode}>
                <Plus className="h-3 w-3" /> Mensagem
              </Button>
              <Button variant="outline" size="sm" onClick={addOptionsNode}>
                <Plus className="h-3 w-3" /> Botões
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {flows.map((node, idx) => (
              <Card key={node.id} className="glass border-purple/10">
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge variant="secondary">
                      {idx + 1}. {node.type === "options" ? "Botões" : "Mensagem"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => removeNode(node.id)}>
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                  {node.type === "message" && (
                    <textarea
                      className="min-h-[80px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                      value={node.text ?? ""}
                      onChange={(e) => updateNode(node.id, { text: e.target.value })}
                      placeholder="O que o bot diz neste passo..."
                    />
                  )}
                  {node.type === "options" && (
                    <div className="space-y-3">
                      <Input
                        value={node.text ?? ""}
                        onChange={(e) => updateNode(node.id, { text: e.target.value })}
                        placeholder="Texto antes dos botões"
                      />
                      {(node.options ?? []).map((opt, oi) => (
                        <div key={oi} className="flex gap-2">
                          <Input
                            value={opt.label}
                            onChange={(e) => {
                              const options = [...(node.options ?? [])];
                              options[oi] = { ...options[oi], label: e.target.value };
                              updateNode(node.id, { options });
                            }}
                            placeholder={`Botão ${oi + 1}`}
                            className="flex-1"
                          />
                          <select
                            className="h-10 rounded-lg border border-border bg-surface px-2 text-xs"
                            value={opt.nextId}
                            onChange={(e) => {
                              const options = [...(node.options ?? [])];
                              options[oi] = { ...options[oi], nextId: e.target.value };
                              updateNode(node.id, { options });
                            }}
                          >
                            <option value="">→ Próximo passo</option>
                            {messageNodes
                              .filter((n) => n.id !== node.id)
                              .map((n, ni) => (
                                <option key={n.id} value={n.id}>
                                  {ni + 1}. {n.text?.slice(0, 30) ?? n.type}
                                </option>
                              ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <aside className="hidden w-96 shrink-0 flex-col border-l border-border bg-surface lg:flex">
          <div className="border-b border-border p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Simulador IA
            </p>
            <p className="text-sm text-muted-foreground">
              Teste memória, contexto e intenção
            </p>
          </div>
          <ChatSimulator
            bot={previewBot}
            className="flex-1"
            onConversationStart={handleConversationStart}
          />
        </aside>
      </div>
    </>
  );
}
