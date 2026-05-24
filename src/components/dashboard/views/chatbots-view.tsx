"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Camera,
  MessageCircle,
  MessageSquare,
  Plus,
  Settings,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useWorkspace } from "@/lib/store/workspace-provider";
import type { BotChannel } from "@/lib/store/types";
import { formatPercent } from "@/lib/utils";

const channelIcons: Record<BotChannel, typeof Bot> = {
  web: Bot,
  whatsapp: MessageCircle,
  instagram: Camera,
};

const statusLabels = {
  active: "Ativo",
  paused: "Pausado",
  training: "Em configuração",
};

export function ChatbotsView() {
  const router = useRouter();
  const { data, createChatbot, toggleChatbotStatus } = useWorkspace();
  const chatbots = data?.chatbots ?? [];
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<BotChannel>("whatsapp");

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const id = createChatbot(name.trim(), channel);
    setName("");
    setShowForm(false);
    if (id) router.push(`/chatbots/${id}`);
  }

  return (
    <>
      <Header
        title="Chatbots"
        description="Assistentes multicanal com aparência premium — WhatsApp, Instagram e Web"
      />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? "Cancelar" : "Novo chatbot"}
          </Button>
        </div>

        {showForm && (
          <Card className="glass mb-6 max-w-md">
            <CardContent className="p-4">
              <form onSubmit={handleCreate} className="space-y-3">
                <Input
                  placeholder="Nome do chatbot"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <select
                  className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as BotChannel)}
                >
                  <option value="whatsapp">WhatsApp Business</option>
                  <option value="instagram">Instagram DM</option>
                  <option value="web">Chat Web (widget)</option>
                </select>
                <Button type="submit" className="w-full">
                  Criar e configurar fluxo
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {chatbots.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Nenhum chatbot"
            description="Crie um bot multicanal, edite mensagens e opções de resposta automática."
            actionLabel="Novo chatbot"
            onAction={() => setShowForm(true)}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {chatbots.map((bot) => {
              const Icon = channelIcons[bot.channel];
              return (
                <Card key={bot.id} className="glass">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10">
                          <Icon className="h-5 w-5 text-purple-bright" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{bot.name}</CardTitle>
                          <p className="text-xs capitalize text-muted-foreground">{bot.channel}</p>
                        </div>
                      </div>
                      <Badge variant={bot.status === "active" ? "green" : "secondary"}>
                        {statusLabels[bot.status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-3 flex items-center gap-2 text-xs">
                      {bot.connected ? (
                        <>
                          <Wifi className="h-3.5 w-3.5 text-green" />
                          <span className="text-green">Conectado · {bot.connectedAccount}</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">Aguardando conexão</span>
                        </>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Conversas</p>
                        <p className="font-semibold">{bot.conversations.toLocaleString("pt-PT")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversão</p>
                        <p className="font-semibold text-green">
                          {bot.conversionRate > 0 ? formatPercent(bot.conversionRate) : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="green" size="sm" className="flex-1" asChild>
                        <Link href={`/chatbots/${bot.id}`}>
                          <Settings className="h-4 w-4" />
                          Editar fluxo
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleChatbotStatus(bot.id)}
                      >
                        {bot.status === "active" ? "Pausar" : "Ativar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
