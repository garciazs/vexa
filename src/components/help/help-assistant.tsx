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
  resolveContextTopic,
  resolveReferencedPlan,
  type ConversationContext,
  type ConversationTurn,
} from "@/lib/ai/conversation-brain";
import { createDefaultKnowledge } from "@/lib/chatbot/knowledge-base";
import { applyPersonality, getPersonality } from "@/lib/chatbot/personalities";
import {
  answerPlanQuestion,
  extractPlanId,
  INTENT_FAQ_FILTER,
  safeUnknownAnswer,
} from "@/lib/chatbot/grounded-answers";
import { answerSchedulingRequest, isSchedulingRequest } from "@/lib/chatbot/scheduling";
import {
  resolveFollowUpAnswer,
  retrieveKnowledgeEnhanced,
  synthesizeKnowledgeAnswer,
  tryAnswerYesNo,
} from "@/lib/chatbot/response-synthesizer";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; text: string; intent?: string };

const HELP_KNOWLEDGE = createDefaultKnowledge();

function getReply(
  userText: string,
  history: ConversationTurn[],
  context: ConversationContext
): { text: string; intent: string } {
  const personality = getPersonality("support");
  const { intent, entities, sentiment } = detectIntent(userText, context);

  const yesNo = tryAnswerYesNo(userText, context);
  if (yesNo) return { text: applyPersonality(yesNo, personality), intent: "follow_up" };

  if (isSchedulingRequest(userText) || intent === "demo") {
    return {
      text: applyPersonality(answerSchedulingRequest(), personality),
      intent: "demo",
    };
  }

  const followUp = resolveFollowUpAnswer(userText, context, history);
  if (followUp) {
    return { text: applyPersonality(followUp, personality, { includeOpener: true }), intent: "follow_up" };
  }

  const plan =
    extractPlanId(userText) ?? resolveReferencedPlan(userText, context, entities, history);
  if (plan && (intent === "pricing" || intent === "follow_up" || intent === "features" || intent === "compare")) {
    const grounded = answerPlanQuestion(plan, userText, intent);
    if (grounded) {
      return {
        text: applyPersonality(grounded, personality, { includeOpener: intent === "follow_up" }),
        intent: intent === "follow_up" ? "follow_up" : intent,
      };
    }
  }

  const allowedIds = INTENT_FAQ_FILTER[intent];
  const pool = allowedIds ? HELP_KNOWLEDGE.filter((k) => allowedIds.includes(k.id)) : HELP_KNOWLEDGE;
  const hits = retrieveKnowledgeEnhanced(userText, pool, {
    minScore: 4,
    limit: 1,
  });
  if (hits.length > 0 && hits[0].score >= 4) {
    return {
      text: applyPersonality(synthesizeKnowledgeAnswer(hits), personality),
      intent: intent === "unknown" ? "features" : intent,
    };
  }

  if (intent === "greeting") {
    return {
      text: "Olá! Posso ajudar com landing pages, chatbots, automações, CRM, planos ou suporte técnico.",
      intent,
    };
  }

  if (sentiment === "negative" || sentiment === "urgent" || intent === "support") {
    return {
      text: applyPersonality(
        "Entendo — vamos resolver. Descreva o problema (site, pagamento, login) ou digite **humano** para suporte directo.",
        personality
      ),
      intent: "support",
    };
  }

  return {
    text: applyPersonality(safeUnknownAnswer(userText), personality),
    intent: "unknown",
  };
}

export function HelpAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Olá! Sou o assistente VEXA — IA contextual, memória e respostas 24/7. Como posso ajudar?",
    },
  ]);
  const [history, setHistory] = useState<ConversationTurn[]>([
    { role: "assistant", text: "Olá! Sou o assistente VEXA." },
  ]);
  const [context, setContext] = useState<ConversationContext>({});
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

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
      const reply = getReply(userText, [...history, { role: "user", text: userText }], context);
      setMessages((prev) => [...prev, { role: "assistant", text: reply.text, intent: reply.intent }]);
      setHistory((h) => [...h, { role: "assistant", text: reply.text }]);
      setContext((c) => ({
        ...c,
        lastTopic: resolveContextTopic(intent, entities, c),
        lastMentionedPlan:
          resolveReferencedPlan(userText, c, entities, history) ?? c.lastMentionedPlan,
        lastBotQuestion: reply.text.slice(0, 200),
      }));
      setTyping(false);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, Math.max(350, delay));
  }

  const quickTopics = [
    "Quanto custa o Growth?",
    "Ele tem automações?",
    "Meu site não abre",
    "Como criar chatbot?",
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
            <p className="text-xs text-muted-foreground">Responde a tudo · contexto · memória</p>
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
            placeholder="Pergunte qualquer coisa…"
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
          Entende contexto — &quot;ele tem automações?&quot; após falar de planos
        </p>
      </div>
    </Card>
  );
}
