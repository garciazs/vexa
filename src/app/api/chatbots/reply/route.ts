import { NextResponse } from "next/server";
import {
  createInitialState,
  resolveChatbotReply,
  type ConversationState,
} from "@/lib/chatbot/engine";
import { normalizeChatbot } from "@/lib/chatbot/defaults";
import type { ChatbotRecord } from "@/lib/store/types";
import type { ConversationTurn } from "@/lib/ai/conversation-brain";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message as string | undefined;
    const botRaw = body.bot as Partial<ChatbotRecord> | undefined;
    const history = (body.history ?? []) as ConversationTurn[];
    const state = (body.state ?? createInitialState()) as ConversationState;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Mensagem obrigatória" }, { status: 400 });
    }
    if (!botRaw?.flows?.length && !botRaw?.welcomeMessage) {
      return NextResponse.json({ error: "Configuração do bot inválida" }, { status: 400 });
    }

    const bot = normalizeChatbot({
      id: botRaw.id ?? "preview",
      name: botRaw.name ?? "Bot",
      status: botRaw.status ?? "active",
      channel: botRaw.channel ?? "web",
      welcomeMessage: botRaw.welcomeMessage,
      fallbackMessage: botRaw.fallbackMessage,
      flows: botRaw.flows,
      personality: botRaw.personality,
      knowledgeBase: botRaw.knowledgeBase,
      useCustomKnowledgeOnly: botRaw.useCustomKnowledgeOnly,
      smartMode: botRaw.smartMode,
      conversations: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString(),
    });

    if (bot.smartMode === false) {
      return NextResponse.json({
        text: bot.fallbackMessage,
        typingDelayMs: 400,
        newState: state,
      });
    }

    await new Promise((r) => setTimeout(r, Math.min(800, 200 + message.length * 8)));

    const { reply, newState } = resolveChatbotReply(bot, message, history, state);

    return NextResponse.json({
      text: reply.text,
      options: reply.options,
      intent: reply.intent,
      sentiment: reply.sentiment,
      typingDelayMs: reply.typingDelayMs,
      escalateHuman: reply.escalateHuman,
      suggestFollowUp: reply.suggestFollowUp,
      newState,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao processar mensagem";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
