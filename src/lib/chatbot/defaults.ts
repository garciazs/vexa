import type { BotFlowNode, ChatbotRecord } from "@/lib/store/types";

export const DEFAULT_WELCOME =
  "Olá! 👋 Sou o assistente virtual. Como posso ajudar hoje?";

export const DEFAULT_FALLBACK =
  "Não entendi bem. Escolha uma das opções abaixo ou digite *humano* para falar com alguém da equipa.";

export function createDefaultFlow(): BotFlowNode[] {
  const optPrices = crypto.randomUUID();
  const optHuman = crypto.randomUUID();
  const optDemo = crypto.randomUUID();

  return [
    {
      id: crypto.randomUUID(),
      type: "message",
      text: DEFAULT_WELCOME,
      nextId: optPrices,
    },
    {
      id: optPrices,
      type: "options",
      text: "Escolha uma opção:",
      options: [
        { label: "💰 Ver preços", nextId: crypto.randomUUID() },
        { label: "📅 Agendar demo", nextId: optDemo },
        { label: "👤 Falar com humano", nextId: optHuman },
      ],
    },
    {
      id: optDemo,
      type: "message",
      text: "Perfeito! Qual o melhor horário para uma demo rápida de 15 minutos? Responda com dia e hora.",
    },
    {
      id: optHuman,
      type: "message",
      text: "Vou transferir para a equipa comercial. Aguarde — respondemos em até 5 minutos no horário comercial.",
    },
  ];
}

export function normalizeChatbot(bot: ChatbotRecord): ChatbotRecord {
  return {
    ...bot,
    welcomeMessage: bot.welcomeMessage ?? DEFAULT_WELCOME,
    fallbackMessage: bot.fallbackMessage ?? DEFAULT_FALLBACK,
    flows: bot.flows?.length ? bot.flows : createDefaultFlow(),
    connected: bot.connected ?? false,
  };
}
