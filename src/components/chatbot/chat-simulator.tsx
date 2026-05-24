"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  createInitialState,
  getWelcomeReply,
  resolveChatbotReply,
  type ConversationState,
} from "@/lib/chatbot/engine";
import type { ChatbotRecord } from "@/lib/store/types";
import type { ConversationTurn } from "@/lib/ai/conversation-brain";
import { cn } from "@/lib/utils";

type PreviewMessage = {
  role: "user" | "bot";
  text: string;
  intent?: string;
};

type ChatSimulatorProps = {
  bot: ChatbotRecord;
  className?: string;
  onConversationStart?: () => void;
};

export function ChatSimulator({ bot, className, onConversationStart }: ChatSimulatorProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [history, setHistory] = useState<ConversationTurn[]>([]);
  const [state, setState] = useState<ConversationState>(() => createInitialState());
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const welcome = getWelcomeReply(bot);
    setMessages([{ role: "bot", text: welcome.text, intent: welcome.intent }]);
    setHistory([{ role: "bot", text: welcome.text }]);
    setState(createInitialState(welcome.nextNodeId));
    setStarted(false);
  }, [bot.id, bot.welcomeMessage, bot.personality, bot.smartMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  async function send(userText?: string) {
    const text = (userText ?? input).trim();
    if (!text || typing) return;

    if (!started) {
      setStarted(true);
      onConversationStart?.();
    }

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    const nextHistory: ConversationTurn[] = [...history, { role: "user", text }];
    setHistory(nextHistory);
    setTyping(true);

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

    try {
      if (bot.smartMode !== false) {
        const res = await fetch("/api/chatbots/reply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bot, message: text, history: nextHistory, state }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Erro");

        await delay(json.typingDelayMs ?? 600);
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: json.text, intent: json.intent },
        ]);
        setHistory((h) => [...h, { role: "bot", text: json.text }]);
        if (json.newState) setState(json.newState);
      } else {
        const { reply, newState } = resolveChatbotReply(bot, text, nextHistory, state);
        await delay(reply.typingDelayMs);
        setMessages((prev) => [
          ...prev,
          { role: "bot", text: reply.text, intent: reply.intent },
        ]);
        setHistory((h) => [...h, { role: "bot", text: reply.text }]);
        setState(newState);
      }
    } catch {
      const { reply, newState } = resolveChatbotReply(bot, text, nextHistory, state);
      await delay(reply.typingDelayMs);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: reply.text, intent: reply.intent },
      ]);
      setHistory((h) => [...h, { role: "bot", text: reply.text }]);
      setState(newState);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className="space-y-1">
            <div
              className={cn(
                "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                m.role === "bot"
                  ? "bg-purple/20 text-foreground"
                  : "ml-auto bg-green/20 text-foreground"
              )}
            >
              {m.text.split("**").map((part, j) =>
                j % 2 === 1 ? <strong key={j}>{part}</strong> : part
              )}
            </div>
            {m.role === "bot" && m.intent && m.intent !== "unknown" && (
              <Badge variant="outline" className="text-[9px] capitalize">
                {m.intent.replace(/_/g, " ")}
              </Badge>
            )}
          </div>
        ))}
        {typing && (
          <div className="flex gap-1 rounded-2xl bg-purple/10 px-4 py-3 w-fit">
            <span className="h-2 w-2 animate-bounce rounded-full bg-purple" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-purple [animation-delay:0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-purple [animation-delay:0.3s]" />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-border p-3">
        <Input
          placeholder="Testar conversa…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={typing}
        />
        <Button size="icon" onClick={() => send()} disabled={typing || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
