import type { BotFlowNode } from "@/lib/store/types";
import type { ConversationContext, ConversationTurn, DetectedIntent, KnowledgeItem } from "@/lib/ai/conversation-brain";
import { normalizeText, tokenize } from "@/lib/ai/conversation-brain";
import { tokensMatchQuery } from "@/lib/ai/synonyms";

const RAG_STOPWORDS = new Set([
  "de", "da", "do", "das", "dos", "uma", "um", "uns", "umas",
  "o", "a", "os", "as", "para", "com", "preciso", "quero", "como", "que",
  "em", "no", "na", "meu", "minha", "seu", "sua", "the", "is", "are",
  "eu", "voce", "você", "por", "sobre", "isso",
]);

/** Converte nós do fluxo em entradas pesquisáveis */
export function indexFlowAsKnowledge(flows: BotFlowNode[]): KnowledgeItem[] {
  return flows
    .filter((n) => n.text?.trim())
    .map((n) => ({
      id: `flow-${n.id}`,
      title: n.type === "options" ? "Opções do fluxo" : "Mensagem do fluxo",
      content: n.text!,
      keywords: tokenize(n.text!),
      source: "document" as const,
    }));
}

/** Enriquece query com contexto recente da conversa */
export function buildAugmentedQuery(
  userText: string,
  history: ConversationTurn[],
  context: ConversationContext
): string {
  const parts = [userText];
  const recentUser = history.filter((h) => h.role === "user").slice(-2);
  const recentBot = history.filter((h) => h.role !== "user").slice(-1);
  parts.push(...recentUser.map((h) => h.text));
  parts.push(...recentBot.map((h) => h.text));
  if (context.lastMentionedPlan) parts.push(`plano ${context.lastMentionedPlan}`);
  if (context.lastTopic) parts.push(context.lastTopic.replace("plan:", "plano "));
  return parts.join(" ");
}

/** RAG melhorado com sinónimos e query expandida */
export function retrieveKnowledgeEnhanced(
  query: string,
  items: KnowledgeItem[],
  opts?: { limit?: number; minScore?: number; augmentedQuery?: string }
): { item: KnowledgeItem; score: number }[] {
  const limit = opts?.limit ?? 3;
  const minScore = opts?.minScore ?? 1.5;
  const fullQuery = opts?.augmentedQuery ?? query;
  const queryTokens = tokenize(fullQuery).filter(
    (t) => !RAG_STOPWORDS.has(t) && t.length > 2
  );

  if (queryTokens.length === 0) return [];

  const scored = items
    .map((item) => {
      const titleTokens = tokenize(item.title);
      const contentTokens = tokenize(item.content);
      const keywordTokens = (item.keywords ?? []).flatMap((k) => tokenize(k));

      let score = tokensMatchQuery(queryTokens, titleTokens) * 1.5;
      score += tokensMatchQuery(queryTokens, keywordTokens) * 2;
      score += tokensMatchQuery(queryTokens, contentTokens);

      const nq = normalizeText(fullQuery);
      const nc = normalizeText(item.content);
      if (nc.includes(nq) || nq.includes(normalizeText(item.title))) score += 6;

      for (const kw of item.keywords ?? []) {
        if (nq.includes(normalizeText(kw))) score += 3;
      }

      return { item, score };
    })
    .filter((s) => s.score >= minScore)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}

/** Sintetiza resposta — um único chunk, sem misturar tópicos */
export function synthesizeKnowledgeAnswer(
  hits: { item: KnowledgeItem; score: number }[],
  opts?: { maxLength?: number }
): string {
  if (hits.length === 0) return "";
  let answer = hits[0].item.content;

  if (opts?.maxLength && answer.length > opts.maxLength) {
    answer = answer.slice(0, opts.maxLength).trim() + "…";
  }
  return answer;
}

/** Responde sim/não a perguntas anteriores do bot */
export function tryAnswerYesNo(
  userText: string,
  context: ConversationContext
): string | null {
  const n = normalizeText(userText);
  const isYes = /^(sim|s|yes|claro|pode ser|quero|ok|isso|exato|exacto|confirmo)\b/.test(n);
  const isNo = /^(nao|não|n|no|negativo|depois|agora nao|agora não)\b/.test(n);
  if (!isYes && !isNo) return null;

  const lastQ = context.lastBotQuestion?.toLowerCase() ?? "";
  if (isYes) {
    if (/automac|chatbot|inclui|plano/.test(lastQ)) {
      return "Perfeito! Posso detalhar cada funcionalidade ou comparar planos — o que prefere?";
    }
    if (/demo|horario|horário|agendar/.test(lastQ)) {
      return "Ótimo! Indique o melhor dia e hora (ex: terça 15h) que registo a demo.";
    }
    if (/humano|equipa|transferir/.test(lastQ)) {
      return "A equipa foi notificada. Aguarde — respondemos em até 5 minutos no horário comercial.";
    }
    return "Combinado! Em que mais posso ajudar?";
  }
  if (isNo) {
    return "Sem problema. Posso ajudar com outra coisa — preços, criar site, CRM ou suporte técnico.";
  }
  return null;
}

/** Extrai plano mencionado no histórico recente */
export function findPlanInHistory(history: ConversationTurn[]): string | undefined {
  const planPattern = /\b(free|starter|growth|scale|gratis|grátis|premium|pro|enterprise)\b/i;
  for (const turn of [...history].reverse()) {
    const match = turn.text.match(planPattern);
    if (match) {
      const m = match[1].toLowerCase();
      if (["gratis", "grátis", "free"].includes(m)) return "free";
      if (["premium", "pro"].includes(m)) return "growth";
      if (m === "enterprise") return "scale";
      return m;
    }
  }
  return undefined;
}

/** Resolve follow-up usando plano em contexto — sem RAG amplo */
export function resolveFollowUpAnswer(
  userText: string,
  context: ConversationContext,
  history: ConversationTurn[]
): string | null {
  const n = normalizeText(userText);
  const isFollowUp =
    /^(ele|ela|esse|essa|isso|aquilo|nele|nela|disso|o plano|la|lá|tb|tambem|também)\b/.test(n) ||
    (/\b(tem|inclui|vem|possui|da|dá|da para|dá para)\b/.test(n) && context.lastMentionedPlan);

  if (!isFollowUp) return null;

  const plan = context.lastMentionedPlan ?? findPlanInHistory(history);
  if (!plan) return null;

  return null;
}

export function suggestTopicsFromQuery(userText: string): string[] {
  const n = normalizeText(userText);
  const suggestions: string[] = [];
  if (/pre|plan|euro|custo/.test(n)) suggestions.push("preços e planos");
  if (/site|landing|public|ia|criar/.test(n)) suggestions.push("criar e publicar site");
  if (/dom|dns|url|entra|abre/.test(n)) suggestions.push("domínios e site offline");
  if (/auto|whats|insta|bot/.test(n)) suggestions.push("chatbots e automações");
  if (/crm|lead|venda/.test(n)) suggestions.push("CRM e leads");
  if (/login|conta|cad/.test(n)) suggestions.push("conta e login");
  if (/pag|cart|fatur|stripe/.test(n)) suggestions.push("pagamentos");
  if (suggestions.length === 0) {
    return ["preços", "criar site com IA", "publicar landing", "chatbots", "suporte"];
  }
  return suggestions.slice(0, 4);
}

export type IntentHandler = (text: string, context: ConversationContext) => string | null;

export const INTENT_HANDLERS: Partial<Record<DetectedIntent, IntentHandler>> = {
  automation: () =>
    "Automações enviam mensagens automáticas no **WhatsApp**, **Instagram**, **chat web** ou **email** quando ocorre um gatilho: novo lead, lead qualificado, formulário ou chat iniciado. Configure em **Automações** → escolha gatilho → adicione passos → ative.",
  features: () =>
    "O VEXA inclui: **landing pages com IA**, **editor visual**, **CRM**, **chatbots** multicanal, **automações**, **templates**, **analytics** e **domínios** (Growth+). Qual área quer explorar?",
  complaint: (text) => {
    if (/demora|lento/.test(normalizeText(text))) {
      return "Lamento a demora. Estou a tratar disto agora — descreva o problema em 1 frase ou digite **humano** para prioridade.";
    }
    return "Peço desculpa pela experiência. Quero resolver — conte o que aconteceu ou digite **humano** para falar com a equipa.";
  },
};
