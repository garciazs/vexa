import { PLANS } from "@/lib/constants";
import {
  analyzeSentiment,
  detectIntent,
  summarizeHistory,
  type ConversationTurn,
  type DetectedIntent,
  type Sentiment,
} from "@/lib/ai/conversation-brain";
import type { AutomationTrigger, LeadRecord } from "@/lib/store/types";

export interface AutomationContext {
  trigger: AutomationTrigger;
  lead: Pick<LeadRecord, "id" | "name" | "email" | "score" | "status" | "source" | "tags">;
  chatHistory?: ConversationTurn[];
  workspacePlan?: string;
}

export interface LeadInsight {
  intent: DetectedIntent;
  sentiment: Sentiment;
  buyingIntent: "low" | "medium" | "high";
  scoreDelta: number;
  summary?: string;
  suggestedFollowUp?: string;
  skipAutomation: boolean;
  skipReason?: string;
}

const TRIGGER_INTRO: Record<AutomationTrigger, string> = {
  new_lead: "Vi que entrou em contacto",
  lead_qualified: "Parabéns por avançar no funil",
  form_submit: "Recebi o seu formulário",
  chat_started: "Vi que iniciou uma conversa",
};

export function analyzeLeadContext(ctx: AutomationContext): LeadInsight {
  const lastUserMsg = [...(ctx.chatHistory ?? [])].reverse().find((m) => m.role === "user");
  const text = lastUserMsg?.text ?? ctx.lead.source ?? "";
  const { intent, sentiment } = detectIntent(text);

  let buyingIntent: LeadInsight["buyingIntent"] = "low";
  if (/demo|preço|preco|plano|comprar|assinar|upgrade|growth|scale/i.test(text)) buyingIntent = "high";
  else if (/interesse|informa|saber|como funciona|automa/i.test(text)) buyingIntent = "medium";

  let scoreDelta = 0;
  if (buyingIntent === "high") scoreDelta += 15;
  if (buyingIntent === "medium") scoreDelta += 8;
  if (sentiment === "positive") scoreDelta += 5;
  if (sentiment === "negative") scoreDelta -= 5;
  if (sentiment === "urgent") scoreDelta += 10;
  if (ctx.trigger === "lead_qualified") scoreDelta += 10;
  if (ctx.trigger === "form_submit") scoreDelta += 5;

  let skipAutomation = false;
  let skipReason: string | undefined;
  if (intent === "human" || intent === "complaint") {
    skipAutomation = true;
    skipReason = "Escalado para atendimento humano";
  }

  const summary =
    ctx.chatHistory && ctx.chatHistory.length > 1
      ? summarizeHistory(ctx.chatHistory, 4)
      : undefined;

  return {
    intent,
    sentiment,
    buyingIntent,
    scoreDelta,
    summary,
    suggestedFollowUp: suggestFollowUp(intent, buyingIntent, sentiment),
    skipAutomation,
    skipReason,
  };
}

function suggestFollowUp(
  intent: DetectedIntent,
  buyingIntent: LeadInsight["buyingIntent"],
  sentiment: Sentiment
): string | undefined {
  if (sentiment === "negative" || sentiment === "urgent") {
    return "Priorizar resposta humana nas próximas 5 minutos.";
  }
  if (buyingIntent === "high") return "Enviar proposta ou link de checkout personalizado.";
  if (intent === "pricing") return "Partilhar comparativo Starter vs Growth.";
  if (intent === "demo") return "Confirmar horário da demo em 24h.";
  return undefined;
}

export function enhanceAutomationMessage(
  template: string,
  ctx: AutomationContext,
  insight: LeadInsight
): string {
  const firstName = ctx.lead.name.split(" ")[0] || ctx.lead.name;
  let message = template
    .replace(/\{\{nome\}\}/gi, firstName)
    .replace(/\{\{email\}\}/gi, ctx.lead.email);

  const intro = TRIGGER_INTRO[ctx.trigger] ?? "Olá";
  const tonePrefix =
    insight.sentiment === "negative"
      ? `${firstName}, lamento o incómodo — `
      : insight.buyingIntent === "high"
        ? `${firstName}, excelente timing — `
        : `${intro}, ${firstName}! `;

  if (!message.toLowerCase().includes(firstName.toLowerCase())) {
    message = `${tonePrefix}${message.charAt(0).toLowerCase()}${message.slice(1)}`;
  }

  if (insight.buyingIntent === "high" && ctx.trigger === "new_lead") {
    message += " Posso reservar 15 min para mostrar como o VEXA acelera as suas vendas?";
  }

  if (insight.intent === "pricing" && !/€|euro|plano/i.test(message)) {
    const growth = PLANS.find((p) => p.id === "growth");
    message += ` O plano Growth (€${growth?.price}/mês) é o mais popular para equipas em crescimento.`;
  }

  if (insight.sentiment === "urgent") {
    message += " Respondo com prioridade.";
  }

  return message.trim();
}

export function computeSmartDelay(
  baseDelayMinutes: number,
  insight: LeadInsight
): number {
  if (insight.sentiment === "urgent") return 0;
  if (insight.buyingIntent === "high") return Math.min(baseDelayMinutes, 1);
  if (insight.sentiment === "negative") return 0;
  return baseDelayMinutes;
}

export function generateConversationSummary(history: ConversationTurn[]): string {
  if (history.length === 0) return "Sem mensagens na conversa.";
  const userMsgs = history.filter((h) => h.role === "user").map((h) => h.text);
  const lastIntent = userMsgs.length
    ? detectIntent(userMsgs[userMsgs.length - 1]).intent
    : "unknown";
  return `Conversa com ${history.length} mensagens. Última intenção: ${lastIntent}. Resumo: ${summarizeHistory(history, 3)}`;
}
