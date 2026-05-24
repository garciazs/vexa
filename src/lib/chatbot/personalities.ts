export type BotPersonalityId =
  | "support"
  | "sales"
  | "consultant"
  | "onboarding"
  | "closer"
  | "premium";

export interface BotPersonality {
  id: BotPersonalityId;
  label: string;
  description: string;
  tone: "formal" | "friendly" | "casual" | "premium";
  emoji: boolean;
  opener: string;
  closer: string;
}

export const BOT_PERSONALITIES: Record<BotPersonalityId, BotPersonality> = {
  support: {
    id: "support",
    label: "Suporte técnico",
    description: "Claro, paciente e resolutivo",
    tone: "friendly",
    emoji: false,
    opener: "Entendi.",
    closer: "Se precisar de mais alguma coisa, estou aqui.",
  },
  sales: {
    id: "sales",
    label: "Vendedor",
    description: "Persuasivo e orientado a conversão",
    tone: "friendly",
    emoji: true,
    opener: "Boa pergunta!",
    closer: "Quer que eu te mostre o melhor plano para o teu caso?",
  },
  consultant: {
    id: "consultant",
    label: "Consultor",
    description: "Especialista que educa e orienta",
    tone: "formal",
    emoji: false,
    opener: "Com base no que partilhou,",
    closer: "Posso detalhar a estratégia ideal para o seu negócio.",
  },
  onboarding: {
    id: "onboarding",
    label: "Onboarding",
    description: "Acolhedor e guia passo a passo",
    tone: "friendly",
    emoji: true,
    opener: "Vamos lá!",
    closer: "Estou contigo em cada passo.",
  },
  closer: {
    id: "closer",
    label: "Closer",
    description: "Directo, confiante e focado em fechar",
    tone: "casual",
    emoji: false,
    opener: "Perfeito —",
    closer: "Posso reservar um slot para avançarmos hoje?",
  },
  premium: {
    id: "premium",
    label: "Atendimento premium",
    description: "Sofisticado, personalizado e VIP",
    tone: "premium",
    emoji: false,
    opener: "Com prazer.",
    closer: "Estou à disposição para qualquer detalhe adicional.",
  },
};

export function getPersonality(id?: BotPersonalityId): BotPersonality {
  return BOT_PERSONALITIES[id ?? "support"];
}

export function applyPersonality(
  text: string,
  personality: BotPersonality,
  opts?: { includeOpener?: boolean; includeCloser?: boolean }
): string {
  let result = text.trim();

  if (opts?.includeOpener && personality.opener && !result.startsWith(personality.opener)) {
    result = `${personality.opener} ${result.charAt(0).toLowerCase()}${result.slice(1)}`;
  }

  if (personality.tone === "casual") {
    result = result.replace(/Por favor,/g, "").replace(/  +/g, " ");
  }

  if (personality.tone === "premium") {
    result = result.replace(/!/g, ".");
  }

  if (opts?.includeCloser && personality.closer) {
    result = `${result} ${personality.closer}`;
  }

  if (personality.emoji && !/[\u{1F300}-\u{1FAFF}]/u.test(result)) {
    if (personality.id === "sales") result += " 🚀";
    if (personality.id === "onboarding") result += " ✨";
  }

  return result;
}
