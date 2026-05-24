"use client";

import { useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; text: string };

const KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["publicar", "landing", "página"],
    answer:
      "Para publicar: vá ao **Builder**, edite os blocos, clique em **Guardar** e depois **Publicar**. A página ficará em `/p/seu-slug`.",
  },
  {
    keywords: ["whatsapp", "conectar", "chatbot"],
    answer:
      "Em **Chatbots**, crie um bot WhatsApp, abra **Editar fluxo**, configure mensagens e clique em **Simular conexão**. Na produção, ligue a API oficial do WhatsApp Business.",
  },
  {
    keywords: ["instagram", "dm"],
    answer:
      "Crie um chatbot com canal **Instagram** no editor de fluxo. Configure boas-vindas e botões — as mensagens automáticas disparam como no BotConversa.",
  },
  {
    keywords: ["automação", "automático", "mensagem"],
    answer:
      "Em **Automações**, escolha o gatilho (ex: Novo lead), adicione passos para WhatsApp, Instagram ou Chat Web, e ative o fluxo. Use `{{nome}}` na mensagem.",
  },
  {
    keywords: ["crm", "lead", "pipeline"],
    answer:
      "O **CRM** mostra um mini dashboard no topo e o pipeline kanban. Mova leads com as setas ou adicione manualmente. Leads de landing pages entram automaticamente.",
  },
  {
    keywords: ["plano", "preço", "upgrade", "free"],
    answer:
      "O plano **Free** inclui 1 landing editável. **Starter** €29, **Growth** €79 e **Scale** €199 — veja detalhes em **Billing** ou `/pricing`.",
  },
  {
    keywords: ["domínio", "personalizado"],
    answer:
      "Domínio personalizado está disponível nos planos **Growth** e **Scale**. Configure em **Configurações > Workspace**.",
  },
];

function getReply(input: string): string {
  const lower = input.toLowerCase();
  for (const item of KNOWLEDGE) {
    if (item.keywords.some((k) => lower.includes(k))) return item.answer;
  }
  if (lower.includes("olá") || lower.includes("oi") || lower.includes("bom dia")) {
    return "Olá! Sou o assistente VEXA, disponível **24/7**. Pergunte sobre landing pages, chatbots, automações ou CRM.";
  }
  return "Posso ajudar com: publicar landing pages, conectar WhatsApp/Instagram, criar automações, usar o CRM ou planos. Reformule a pergunta ou escolha um tópico abaixo.";
}

export function HelpAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Olá! Sou o assistente VEXA — disponível 24 horas por dia. Como posso ajudar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function send(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText) return;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", text: getReply(userText) }]);
      setTyping(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 600);
  }

  const quickTopics = [
    "Como publicar uma landing?",
    "Conectar WhatsApp",
    "Criar automação",
    "Ver planos",
  ];

  return (
    <Card className="glass flex h-[min(520px,70vh)] flex-col overflow-hidden border-purple/20">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple/20">
            <Bot className="h-5 w-5 text-purple-bright" />
          </div>
          <div>
            <p className="font-semibold">Assistente VEXA</p>
            <p className="text-xs text-muted-foreground">Suporte inteligente 24/7</p>
          </div>
        </div>
        <Badge variant="green" className="gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
          Online
        </Badge>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              m.role === "assistant"
                ? "bg-surface-elevated border border-border"
                : "ml-auto bg-purple/20"
            )}
          >
            {m.text.split("**").map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </div>
        ))}
        {typing && (
          <div className="flex gap-1 rounded-2xl bg-surface-elevated px-4 py-3 w-fit">
            <span className="h-2 w-2 animate-bounce rounded-full bg-purple" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-purple [animation-delay:0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-purple [animation-delay:0.3s]" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {quickTopics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => send(t)}
              className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition hover:border-purple/40 hover:text-foreground"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Escreva a sua dúvida..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button onClick={() => send()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          Respostas instantâneas — para casos urgentes: suporte@vexa.pt
        </p>
      </div>
    </Card>
  );
}
