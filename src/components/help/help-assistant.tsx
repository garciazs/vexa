"use client";

import { useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  detectIntent,
  estimateTypingDelay,
  retrieveKnowledge,
  resolveReferencedPlan,
  type ConversationContext,
  type ConversationTurn,
} from "@/lib/ai/conversation-brain";
import { createDefaultKnowledge } from "@/lib/chatbot/knowledge-base";
import { applyPersonality, getPersonality } from "@/lib/chatbot/personalities";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; text: string; intent?: string };

const HELP_KNOWLEDGE = createDefaultKnowledge();

export function HelpAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Olá! Sou o assistente VEXA — disponível 24 horas por dia. Como posso ajudar?",
    },
  ]);
  const [history, setHistory] = useState<ConversationTurn[]>([
    { role: "assistant", text: "Olá! Sou o assistente VEXA." },
  ]);
  const [context, setContext] = useState<ConversationContext>({});
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function getReply(userText: string): { text: string; intent: string } {
    const personality = getPersonality("support");
    const { intent, entities, sentiment } = detectIntent(userText, context);
    const plan = resolveReferencedPlan(userText, context, entities);

    if (intent === "pricing" && plan) {
      const item = HELP_KNOWLEDGE.find((k) => k.id === `plan-${plan}`);
      if (item) {
        return {
          text: applyPersonality(item.content, personality, { includeOpener: true }),
          intent,
        };
      }
    }

    if (intent === "follow_up" && plan) {
      const item = HELP_KNOWLEDGE.find((k) => k.id === `plan-${plan}`);
      if (item && /tem|inclui|automa/i.test(userText.toLowerCase())) {
        return {
          text: applyPersonality(
            `Sim — ${item.content.split(".")[1] ?? item.content}`,
            personality,
            { includeOpener: true }
          ),
          intent: "features",
        };
      }
    }

    const retrieved = retrieveKnowledge(userText, HELP_KNOWLEDGE, 1);
    if (retrieved.length > 0) {
      return {
        text: applyPersonality(retrieved[0].item.content, personality, { includeOpener: true }),
        intent: intent === "unknown" ? "features" : intent,
      };
    }

    if (intent === "greeting") {
      return {
        text: "Olá! Posso ajudar com landing pages, chatbots, automações, CRM ou planos. O que precisa?",
        intent,
      };
    }

    if (sentiment === "negative" || intent === "support") {
      return {
        text: applyPersonality(
          "Entendo — vamos resolver. Descreva o problema (site, domínio, pagamento) ou digite **humano** para suporte directo.",
          personality
        ),
        intent: "support",
      };
    }

    return {
      text: "Posso ajudar com: publicar landing pages, conectar WhatsApp/Instagram, criar automações, usar o CRM ou planos. Reformule ou escolha um tópico abaixo.",
      intent: "unknown",
    };
  }

  function send(text?: string) {
    const userText = (text ?? input).trim();
    if (!userText || typing) return;

    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setHistory((h) => [...h, { role: "user", text: userText }]);
    setInput("");
    setTyping(true);

    const { intent, entities } = detectIntent(userText, context);
    const delay = estimateTypingDelay(userText);

    setTimeout(() => {
      const reply = getReply(userText);
      setMessages((prev) => [...prev, { role: "assistant", text: reply.text, intent: reply.intent }]);
      setHistory((h) => [...h, { role: "assistant", text: reply.text }]);
      setContext((c) => ({
        ...c,
        lastTopic: reply.intent,
        lastMentionedPlan: entities[entities.length - 1] ?? c.lastMentionedPlan,
      }));
      setTyping(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, Math.max(400, delay));
  }

  const quickTopics = [
    "Quanto custa o plano Growth?",
    "Como publicar uma landing?",
    "Conectar WhatsApp",
    "Criar automação",
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
            <p className="text-xs text-muted-foreground">IA contextual · memória · 24/7</p>
          </div>
        </div>
        <Badge variant="green" className="gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-green animate-pulse" />
          Online
        </Badge>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
        {messages.map((m, i) => (
          <div key={i}>
            <div
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
            disabled={typing}
          />
          <Button onClick={() => send()} disabled={typing}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          IA com contexto — entende &quot;ele tem automações?&quot; após falar de planos
        </p>
      </div>
    </Card>
  );
}
