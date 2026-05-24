"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  Camera,
  MessageCircle,
  Plus,
  Save,
  Send,
  Trash2,
  Wifi,
} from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/lib/store/workspace-provider";
import type { BotFlowNode, BotChannel } from "@/lib/store/types";
import { DEFAULT_FALLBACK, DEFAULT_WELCOME } from "@/lib/chatbot/defaults";

const channelLabels: Record<BotChannel, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  web: "Chat Web",
};

export default function ChatbotEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, updateChatbot, connectChatbot } = useWorkspace();
  const bot = data?.chatbots.find((b) => b.id === id);

  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [fallbackMessage, setFallbackMessage] = useState("");
  const [flows, setFlows] = useState<BotFlowNode[]>([]);
  const [connectAccount, setConnectAccount] = useState("");
  const [saved, setSaved] = useState(false);
  const [previewInput, setPreviewInput] = useState("");
  const [previewMessages, setPreviewMessages] = useState<{ role: "bot" | "user"; text: string }[]>(
    []
  );

  useEffect(() => {
    if (!bot) return;
    setWelcomeMessage(bot.welcomeMessage ?? DEFAULT_WELCOME);
    setFallbackMessage(bot.fallbackMessage ?? DEFAULT_FALLBACK);
    setFlows(bot.flows ?? []);
    setConnectAccount(bot.connectedAccount ?? "");
    setPreviewMessages([{ role: "bot", text: bot.welcomeMessage ?? DEFAULT_WELCOME }]);
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

  function updateNode(nodeId: string, patch: Partial<BotFlowNode>) {
    setFlows((prev) => prev.map((n) => (n.id === nodeId ? { ...n, ...patch } : n)));
    setSaved(false);
  }

  function addMessageNode() {
    const node: BotFlowNode = {
      id: crypto.randomUUID(),
      type: "message",
      text: "Nova mensagem automática do bot",
    };
    setFlows((prev) => [...prev, node]);
    setSaved(false);
  }

  function addOptionsNode() {
    const node: BotFlowNode = {
      id: crypto.randomUUID(),
      type: "options",
      text: "Escolha uma opção:",
      options: [
        { label: "Opção 1", nextId: "" },
        { label: "Opção 2", nextId: "" },
      ],
    };
    setFlows((prev) => [...prev, node]);
    setSaved(false);
  }

  function removeNode(nodeId: string) {
    setFlows((prev) => prev.filter((n) => n.id !== nodeId));
    setSaved(false);
  }

  function handleSave() {
    updateChatbot(id, {
      welcomeMessage,
      fallbackMessage,
      flows,
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

  function sendPreview() {
    if (!previewInput.trim()) return;
    const userText = previewInput.trim();
    setPreviewMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      {
        role: "bot",
        text:
          flows.find((f) => f.type === "message" && f.text && f.id !== flows[0]?.id)?.text ??
          fallbackMessage,
      },
    ]);
    setPreviewInput("");
  }

  const ChannelIcon =
    bot.channel === "whatsapp" ? MessageCircle : bot.channel === "instagram" ? Camera : Bot;

  return (
    <>
      <Header
        title={bot.name}
        description={`Editor de fluxo · ${channelLabels[bot.channel]}`}
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
            <Button size="sm" onClick={handleSave} className="ml-auto">
              <Save className="h-4 w-4" /> Guardar fluxo
            </Button>
          </div>

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
                        <Input
                          key={oi}
                          value={opt.label}
                          onChange={(e) => {
                            const options = [...(node.options ?? [])];
                            options[oi] = { ...options[oi], label: e.target.value };
                            updateNode(node.id, { options });
                          }}
                          placeholder={`Botão ${oi + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <aside className="hidden w-80 shrink-0 flex-col border-l border-border bg-surface lg:flex">
          <div className="border-b border-border p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Simulador
            </p>
            <p className="text-sm text-muted-foreground">{channelLabels[bot.channel]}</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {previewMessages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "bot"
                    ? "bg-purple/20 text-foreground"
                    : "ml-auto bg-green/20 text-foreground"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-border p-3">
            <Input
              placeholder="Testar resposta..."
              value={previewInput}
              onChange={(e) => setPreviewInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendPreview()}
            />
            <Button size="icon" onClick={sendPreview}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}
