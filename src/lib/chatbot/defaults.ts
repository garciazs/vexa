import type { BotFlowNode, ChatbotRecord } from "@/lib/store/types";

export const DEFAULT_WELCOME =
  "Olá! 👋 Sou o assistente virtual. Como posso ajudar hoje?";

export const DEFAULT_FALLBACK =
  "Deixa-me ver… Posso ajudar com preços, funcionalidades ou agendar uma demo. Escolha uma opção ou digite *humano* para falar com a equipa.";

export function createDefaultFlow(): BotFlowNode[] {
  const welcomeId = crypto.randomUUID();
  const optionsId = crypto.randomUUID();
  const pricesId = crypto.randomUUID();
  const optDemo = crypto.randomUUID();
  const optHuman = crypto.randomUUID();

  return [
    {
      id: welcomeId,
      type: "message",
      text: DEFAULT_WELCOME,
      nextId: optionsId,
    },
    {
      id: optionsId,
      type: "options",
      text: "Escolha uma opção:",
      options: [
        { label: "💰 Ver preços", nextId: pricesId },
        { label: "📅 Agendar demo", nextId: optDemo },
        { label: "👤 Falar com humano", nextId: optHuman },
      ],
    },
    {
      id: pricesId,
      type: "message",
      text: "Temos Free (1 site grátis), Starter €29/mês, Growth €79/mês e Scale €199/mês. Qual plano quer conhecer melhor?",
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
    personality: bot.personality ?? "support",
    smartMode: bot.smartMode ?? true,
    connected: bot.connected ?? false,
  };
}
