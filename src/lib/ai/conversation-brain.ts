/** Camada de inteligência conversacional — contexto, intenção, memória e RAG local */

export type ConversationRole = "user" | "bot" | "assistant";

export interface ConversationTurn {
  role: ConversationRole;
  text: string;
}

export type DetectedIntent =
  | "greeting"
  | "pricing"
  | "features"
  | "support"
  | "domain"
  | "automation"
  | "chatbot"
  | "crm"
  | "billing"
  | "account"
  | "demo"
  | "human"
  | "thanks"
  | "follow_up"
  | "complaint"
  | "compare"
  | "cancel"
  | "unknown";

export type Sentiment = "positive" | "neutral" | "negative" | "urgent";

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  keywords?: string[];
  source?: "faq" | "url" | "document" | "system";
}

export interface ConversationContext {
  lastTopic?: string;
  lastMentionedPlan?: string;
  lastMentionedEntity?: string;
  lastBotQuestion?: string;
}

export interface IntentResult {
  intent: DetectedIntent;
  confidence: number;
  sentiment: Sentiment;
  entities: string[];
}

const PLAN_ALIASES: Record<string, string> = {
  free: "free",
  grátis: "free",
  gratis: "free",
  starter: "starter",
  básico: "starter",
  basico: "starter",
  growth: "growth",
  premium: "growth",
  pro: "growth",
  scale: "scale",
  enterprise: "scale",
};

const INTENT_PATTERNS: { intent: DetectedIntent; patterns: RegExp[] }[] = [
  { intent: "human", patterns: [/humano|atendente|pessoa real|operador|falar com algu|equipa humana/i] },
  { intent: "greeting", patterns: [/^(oi|olá|ola|hey|bom dia|boa tarde|boa noite|e aí|eai|salve|opa)\b/i] },
  { intent: "thanks", patterns: [/obrigad|valeu|agrade|thanks|thank you|brigad/i] },
  { intent: "cancel", patterns: [/cancel|desist|reembols|devolv|parar assin|unsubscribe/i] },
  { intent: "compare", patterns: [/compar|diferen|qual plano|melhor plano|recomend|escolher plano/i] },
  { intent: "pricing", patterns: [/preço|preco|quanto cust|custo|valor|€|euro|plano|assin|mensal|barato|caro/i] },
  { intent: "billing", patterns: [/pagamento|cart[aã]o|stripe|fatura|cobran|billing|pagar|subscri/i] },
  { intent: "account", patterns: [/login|entrar|cadastr|regist|conta|senha|password|email esqueci/i] },
  { intent: "crm", patterns: [/\bcrm\b|lead|pipeline|kanban|qualific|cliente|venda/i] },
  { intent: "chatbot", patterns: [/chatbot|\bbot\b|assistente virtual|widget|simulador/i] },
  { intent: "features", patterns: [/funcional|recurso|inclui|tem automa|landing|secç|secao|template|analytics|o que faz/i] },
  { intent: "domain", patterns: [/domínio|dominio|dns|site n[aã]o entra|n[aã]o abre|offline|fora do ar|hosped|url n/i] },
  { intent: "support", patterns: [/problema|erro|bug|ajuda|suporte|n[aã]o funciona|travou|quebr|mano meu/i] },
  { intent: "automation", patterns: [/automa|workflow|mensagem autom|whatsapp|instagram dm/i] },
  { intent: "demo", patterns: [/demo|agendar|reuni[aã]o|call|conversar|marcar|hor[aá]rio/i] },
  { intent: "complaint", patterns: [/p[eé]ssimo|horr[ií]vel|demora|frustrad|irritad|reclama|lixo|merda/i] },
  {
    intent: "follow_up",
    patterns: [
      /^(sim|n[aã]o|ok|claro|pode ser|isso|esse|essa|ele|ela|eles|aquilo|disso|la|lá)\b/i,
      /\b(tem|inclui|vem com|possui|da para|dá para|tb|tambem|também)\b/i,
    ],
  },
];

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s€@.+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(" ")
    .filter((t) => t.length > 1);
}

export function detectIntent(text: string, context?: ConversationContext): IntentResult {
  const normalized = normalizeText(text);
  const entities: string[] = [];

  for (const [alias, plan] of Object.entries(PLAN_ALIASES)) {
    if (normalized.includes(alias)) entities.push(plan);
  }

  let best: DetectedIntent = "unknown";
  let confidence = 0.3;

  for (const { intent, patterns } of INTENT_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(text) || pattern.test(normalized)) {
        if (intent === "follow_up" && context?.lastTopic) {
          best = intent;
          confidence = 0.75;
        } else if (intent !== "follow_up") {
          best = intent;
          confidence = 0.85;
        }
      }
    }
  }

  if (
    best === "unknown" &&
    context?.lastTopic &&
    /^(ele|ela|esse|essa|isso|aquilo|o plano|nele|nela|disso)\b/i.test(normalized)
  ) {
    best = "follow_up";
    confidence = 0.8;
  }

  const sentiment = analyzeSentiment(text);

  return { intent: best, confidence, sentiment, entities };
}

export function analyzeSentiment(text: string): Sentiment {
  const n = normalizeText(text);
  if (/urgente|agora|imediato|socorro|critico|critico/i.test(n)) return "urgent";
  if (/p[eé]ssimo|horr[ií]vel|frustrad|irritad|n[aã]o funciona|nao funciona|mano meu site/i.test(n))
    return "negative";
  if (/obrigad|excelente|otimo|ótimo|perfeito|adorei|top|massa/i.test(n)) return "positive";
  return "neutral";
}

export function resolveContextTopic(
  intent: DetectedIntent,
  entities: string[],
  context: ConversationContext
): string {
  if (entities.length > 0) return `plan:${entities[entities.length - 1]}`;
  if (intent === "follow_up" && context.lastTopic) return context.lastTopic;
  if (intent === "pricing") return "pricing";
  if (intent === "features") return "features";
  if (intent === "domain") return "domain";
  if (intent === "support") return "support";
  if (intent === "automation") return "automation";
  if (intent === "chatbot") return "chatbot";
  if (intent === "crm") return "crm";
  if (intent === "billing") return "billing";
  if (intent === "account") return "account";
  if (intent === "compare") return "compare";
  return context.lastTopic ?? "general";
}

export function resolveReferencedPlan(
  text: string,
  context: ConversationContext,
  entities: string[],
  history?: ConversationTurn[]
): string | undefined {
  if (entities.length > 0) return entities[entities.length - 1];
  const n = normalizeText(text);
  if (/^(ele|ela|esse|essa|nele|nela|o plano|disso|isso|aquilo)\b/.test(n)) {
    return context.lastMentionedPlan;
  }
  if (history?.length) {
    for (const turn of [...history].reverse()) {
      for (const [alias, plan] of Object.entries(PLAN_ALIASES)) {
        if (normalizeText(turn.text).includes(alias)) return plan;
      }
    }
  }
  return context.lastMentionedPlan;
}

/** RAG local — pontuação por overlap de tokens + keywords */
export function retrieveKnowledge(
  query: string,
  items: KnowledgeItem[],
  limit = 3
): { item: KnowledgeItem; score: number }[] {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return [];

  const scored = items
    .map((item) => {
      const titleTokens = tokenize(item.title);
      const contentTokens = tokenize(item.content);
      const keywordTokens = (item.keywords ?? []).flatMap((k) => tokenize(k));
      const allTokens = [...titleTokens, ...contentTokens, ...keywordTokens];

      let score = 0;
      for (const token of queryTokens) {
        if (titleTokens.includes(token)) score += 3;
        if (keywordTokens.includes(token)) score += 2.5;
        if (contentTokens.includes(token)) score += 1;
      }

      for (const kw of item.keywords ?? []) {
        if (normalizeText(query).includes(normalizeText(kw))) score += 4;
      }

      if (normalizeText(item.content).includes(normalizeText(query))) score += 5;

      return { item, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

export function summarizeHistory(history: ConversationTurn[], maxTurns = 6): string {
  return history
    .slice(-maxTurns)
    .map((t) => `${t.role === "user" ? "Cliente" : "Bot"}: ${t.text}`)
    .join("\n");
}

export function avoidRepetition(candidate: string, history: ConversationTurn[]): string {
  const recentBot = history
    .filter((h) => h.role !== "user")
    .slice(-3)
    .map((h) => normalizeText(h.text));

  if (recentBot.includes(normalizeText(candidate))) {
    return candidate.replace(/\.$/, "") + " Posso detalhar mais algum ponto?";
  }
  return candidate;
}

export function estimateTypingDelay(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.min(2200, Math.max(400, words * 45 + 200));
}
