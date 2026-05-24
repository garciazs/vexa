import type {
  AutomationAction,
  AutomationRecord,
  AutomationTrigger,
  LeadRecord,
  MessageLog,
} from "@/lib/store/types";

export const TRIGGER_OPTIONS: { value: AutomationTrigger; label: string; description: string }[] = [
  { value: "new_lead", label: "Novo lead", description: "Quando um lead entra no CRM" },
  { value: "lead_qualified", label: "Lead qualificado", description: "Quando move para Qualificados" },
  { value: "form_submit", label: "Formulário enviado", description: "Quando alguém preenche uma landing page" },
  { value: "chat_started", label: "Chat iniciado", description: "Quando alguém fala com o chatbot" },
];

export const CHANNEL_OPTIONS: { value: AutomationAction["channel"]; label: string; icon: string }[] = [
  { value: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
  { value: "instagram", label: "Instagram DM", icon: "instagram" },
  { value: "web_chat", label: "Chatbot Web", icon: "web" },
  { value: "email", label: "Email", icon: "email" },
];

export function createDefaultAction(channel: AutomationAction["channel"] = "whatsapp"): AutomationAction {
  const templates: Record<AutomationAction["channel"], string> = {
    whatsapp: "Olá {{nome}}! 👋 Obrigado pelo interesse. Sou da equipa e quero ajudar você a avançar. Posso enviar mais detalhes?",
    instagram: "Oi {{nome}}! Vi seu interesse. Responda aqui que te mando tudo sobre a oferta ✨",
    web_chat: "Bem-vindo(a), {{nome}}! Estou aqui para tirar dúvidas e agendar uma conversa.",
    email: "Olá {{nome}},\n\nObrigado por entrar em contacto. Em breve a nossa equipa irá responder.\n\nEquipa VEXA",
  };
  return {
    id: crypto.randomUUID(),
    channel,
    message: templates[channel],
    delayMinutes: channel === "whatsapp" ? 0 : 2,
  };
}

export function renderMessage(template: string, lead: Pick<LeadRecord, "name" | "email">): string {
  return template
    .replace(/\{\{nome\}\}/gi, lead.name.split(" ")[0] || lead.name)
    .replace(/\{\{email\}\}/gi, lead.email);
}

export function runAutomationsForTrigger(
  automations: AutomationRecord[],
  trigger: AutomationTrigger,
  lead: Pick<LeadRecord, "id" | "name" | "email">
): MessageLog[] {
  const now = Date.now();
  const logs: MessageLog[] = [];

  for (const auto of automations) {
    if (auto.status !== "active" || auto.trigger !== trigger) continue;

    const steps = auto.actions as AutomationAction[];
    for (const action of steps) {
      if (typeof action === "string") continue;
      logs.push({
        id: crypto.randomUUID(),
        automationId: auto.id,
        automationName: auto.name,
        leadId: lead.id,
        leadName: lead.name,
        channel: action.channel,
        message: renderMessage(action.message, lead),
        delayMinutes: action.delayMinutes,
        status: action.delayMinutes === 0 ? "sent" : "queued",
        scheduledFor: new Date(now + action.delayMinutes * 60_000).toISOString(),
        sentAt: action.delayMinutes === 0 ? new Date().toISOString() : undefined,
      });
    }
  }

  return logs;
}

export function normalizeAutomation(auto: AutomationRecord): AutomationRecord {
  if (Array.isArray(auto.actions) && auto.actions.length > 0 && typeof auto.actions[0] === "string") {
    const legacy = auto.actions as unknown as string[];
    return {
      ...auto,
      trigger: (auto.trigger as AutomationTrigger) || "new_lead",
      actions: legacy.map((msg) => ({
        id: crypto.randomUUID(),
        channel: "whatsapp" as const,
        message: msg,
        delayMinutes: 0,
      })),
    };
  }
  return {
    ...auto,
    trigger: auto.trigger ?? "new_lead",
    actions: auto.actions?.length ? auto.actions : [createDefaultAction()],
  };
}
