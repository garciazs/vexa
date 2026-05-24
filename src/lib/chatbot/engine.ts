import {
  analyzeSentiment,
  avoidRepetition,
  detectIntent,
  estimateTypingDelay,
  resolveContextTopic,
  resolveReferencedPlan,
  type ConversationContext,
  type ConversationTurn,
  type DetectedIntent,
} from "@/lib/ai/conversation-brain";
import { buildSearchIndex } from "@/lib/chatbot/knowledge-base";
import { applyPersonality, getPersonality } from "@/lib/chatbot/personalities";
import {
  answerPlanQuestion,
  extractPlanId,
  INTENT_FAQ_FILTER,
  safeUnknownAnswer,
} from "@/lib/chatbot/grounded-answers";
import { answerSchedulingRequest, isSchedulingRequest } from "@/lib/chatbot/scheduling";
import {
  indexFlowAsKnowledge,
  INTENT_HANDLERS,
  retrieveKnowledgeEnhanced,
  suggestTopicsFromQuery,
  synthesizeKnowledgeAnswer,
  tryAnswerYesNo,
} from "@/lib/chatbot/response-synthesizer";
import type { BotFlowNode, ChatbotRecord } from "@/lib/store/types";
import { DEFAULT_FALLBACK } from "@/lib/chatbot/defaults";

export interface ConversationState {
  currentNodeId?: string;
  context: ConversationContext;
  escalatedToHuman?: boolean;
  greeted?: boolean;
}

export interface ChatbotReply {
  text: string;
  options?: { label: string; nextId?: string }[];
  intent?: DetectedIntent;
  sentiment?: string;
  typingDelayMs: number;
  escalateHuman?: boolean;
  suggestFollowUp?: string;
  nextNodeId?: string;
}

export function createInitialState(welcomeNodeId?: string): ConversationState {
  return {
    currentNodeId: welcomeNodeId,
    context: {},
    greeted: false,
  };
}

function normalizeInput(text: string): string {
  return text.trim().toLowerCase();
}

function matchFlowOption(node: BotFlowNode, userText: string): { label: string; nextId: string } | null {
  if (node.type !== "options" || !node.options?.length) return null;
  const n = normalizeInput(userText);

  for (let i = 0; i < node.options.length; i++) {
    const opt = node.options[i];
    const label = normalizeInput(opt.label.replace(/[^\w\s]/g, ""));
    if (n === label || n.includes(label)) return opt;
    if (/^[1-3]$/.test(n) && String(i + 1) === n) return opt;
  }
  return null;
}

function findNode(flows: BotFlowNode[], id?: string): BotFlowNode | undefined {
  if (!id) return undefined;
  return flows.find((f) => f.id === id);
}

function buildDomainSupportReply(text: string): string {
  const urgent = /nao entra|não entra|nao abre|não abre|offline|fora do ar|mano|nao funciona|não funciona/i.test(text);
  if (urgent) {
    return (
      "Percebo — vamos resolver já. Checklist rápido:\n\n" +
      "1. **Publicou** a landing no Builder?\n" +
      "2. Testou o link `/p/seu-slug` directamente?\n" +
      "3. Domínio próprio → DNS apontado e **verificado** em Domínios?\n" +
      "4. Propagação DNS pode levar até 48h.\n\n" +
      "Se nada disto resolver, digite **humano** — escalamos com prioridade."
    );
  }
  return "Domínio personalizado (Growth/Scale): ligue em Domínios → configure DNS → verifique. Quer o passo-a-passo detalhado?";
}

/** RAG estrito — só FAQs, sem nós de fluxo (evita misturar mensagens do bot) */
function searchGroundedKnowledge(
  userText: string,
  intent: DetectedIntent,
  knowledgeIndex: ReturnType<typeof buildSearchIndex>,
  flowKnowledge: ReturnType<typeof indexFlowAsKnowledge>
): string | null {
  const faqOnly = knowledgeIndex.filter(
    (item) => !flowKnowledge.some((f) => f.id === item.id)
  );
  const allowedIds = INTENT_FAQ_FILTER[intent];
  const pool = allowedIds ? faqOnly.filter((item) => allowedIds.includes(item.id)) : faqOnly;

  const hits = retrieveKnowledgeEnhanced(userText, pool, {
    minScore: 3,
    limit: 1,
  });
  if (hits.length === 0) return null;
  if (hits[0].score < 4) return null;
  return synthesizeKnowledgeAnswer(hits, { maxLength: 500 });
}

function resolvePlanForQuestion(
  userText: string,
  context: ConversationContext,
  entities: string[],
  history: ConversationTurn[]
): string | undefined {
  return (
    extractPlanId(userText) ??
    resolveReferencedPlan(userText, context, entities, history) ??
    context.lastMentionedPlan
  );
}

function buildSmartReply(
  bot: ChatbotRecord,
  userText: string,
  history: ConversationTurn[],
  state: ConversationState
): Omit<ChatbotReply, "typingDelayMs"> {
  const personality = getPersonality(bot.personality);
  const flows = bot.flows ?? [];
  const flowKnowledge = indexFlowAsKnowledge(flows);
  const knowledgeIndex = buildSearchIndex(bot.knowledgeBase, flowKnowledge, bot.useCustomKnowledgeOnly !== true);
  const { intent, entities, sentiment } = detectIntent(userText, state.context);

  if (/humano|atendente|pessoa real|operador|equipa/i.test(userText)) {
    return {
      text: applyPersonality(
        "A transferir para a equipa agora. Tempo médio: até 5 minutos (horário comercial). Enquanto isso, posso ajudar em mais alguma coisa?",
        personality,
        { includeOpener: true }
      ),
      intent: "human",
      sentiment,
      escalateHuman: true,
    };
  }

  const yesNo = tryAnswerYesNo(userText, state.context);
  if (yesNo) {
    return { text: applyPersonality(yesNo, personality), intent: "follow_up", sentiment };
  }

  if (isSchedulingRequest(userText) || intent === "demo") {
    return {
      text: applyPersonality(answerSchedulingRequest(), personality),
      intent: "demo",
      sentiment,
      suggestFollowUp: "Indique dia e hora (ex: quinta 14h).",
    };
  }

  const currentNode = findNode(flows, state.currentNodeId);
  if (currentNode?.type === "options") {
    const matched = matchFlowOption(currentNode, userText);
    if (matched?.nextId) {
      const next = findNode(flows, matched.nextId);
      if (next?.text) {
        return {
          text: applyPersonality(next.text, personality),
          options: next.type === "options" ? next.options : undefined,
          intent,
          sentiment,
          nextNodeId: next.id,
        };
      }
    }
  }

  const planId = resolvePlanForQuestion(userText, state.context, entities, history);
  const planIntent: DetectedIntent =
    intent === "pricing" || intent === "compare" || intent === "features" || intent === "follow_up"
      ? intent
      : planId && /preco|quanto|custo|tem|inclui|white label|api|automa|chatbot|dominio|domínio/i.test(userText)
        ? "features"
        : intent;

  if (
    planId &&
    (planIntent === "pricing" ||
      planIntent === "features" ||
      planIntent === "follow_up" ||
      planIntent === "compare" ||
      extractPlanId(userText))
  ) {
    const grounded = answerPlanQuestion(planId, userText, planIntent);
    if (grounded) {
      return {
        text: applyPersonality(grounded, personality, { includeOpener: planIntent === "follow_up" }),
        intent: planIntent === "follow_up" ? "follow_up" : planIntent,
        sentiment,
        suggestFollowUp: planIntent === "pricing" ? "Quer comparar com outro plano?" : undefined,
      };
    }
  }

  if (intent === "pricing" || intent === "compare") {
    return {
      text: applyPersonality(
        "**Free** (grátis) · **Starter** €29 · **Growth** €79 · **Scale** €199/mês. Qual plano quer conhecer?",
        personality,
        { includeOpener: true }
      ),
      intent,
      sentiment,
      suggestFollowUp: "Ex.: quanto custa o plano Growth?",
    };
  }

  if (intent === "domain" || (intent === "support" && /site|dom|entra|abre|offline/i.test(userText))) {
    const domainKb = searchGroundedKnowledge(userText, "domain", knowledgeIndex, flowKnowledge);
    return {
      text: applyPersonality(domainKb ?? buildDomainSupportReply(userText), personality, {
        includeOpener: sentiment === "negative" || sentiment === "urgent",
      }),
      intent: intent === "domain" ? "domain" : "support",
      sentiment,
    };
  }

  const handler = INTENT_HANDLERS[intent];
  if (handler && intent !== "features") {
    const handled = handler(userText, state.context);
    if (handled) {
      return {
        text: applyPersonality(handled, personality, { includeOpener: true }),
        intent,
        sentiment,
      };
    }
  }

  if (intent === "greeting") {
    return {
      text: applyPersonality(
        state.greeted
          ? "Olá de novo! Em que posso ajudar — preços, criar site, CRM ou suporte?"
          : (bot.welcomeMessage ?? "Olá! Como posso ajudar hoje?"),
        personality
      ),
      options: flows.find((f) => f.type === "options")?.options,
      intent,
      sentiment,
    };
  }

  if (intent === "thanks") {
    return {
      text: applyPersonality("De nada! Estou aqui 24/7 se precisar.", personality),
      intent,
      sentiment,
    };
  }

  if (intent === "cancel" || intent === "billing") {
    const billingKb = searchGroundedKnowledge(userText, intent, knowledgeIndex, flowKnowledge);
    return {
      text: applyPersonality(
        billingKb ??
          "Para cancelar: vá em **Planos** → **Gerir subscrição** (portal Stripe) → cancelar plano. O acesso mantém-se até fim do período pago.",
        personality
      ),
      intent,
      sentiment,
    };
  }

  const ragAnswer = searchGroundedKnowledge(userText, intent, knowledgeIndex, flowKnowledge);
  if (ragAnswer) {
    return {
      text: applyPersonality(ragAnswer, personality),
      intent: intent === "unknown" ? "features" : intent,
      sentiment,
    };
  }

  const suggestions = suggestTopicsFromQuery(userText);
  const fallback = bot.fallbackMessage ?? DEFAULT_FALLBACK;
  const optionsNode = flows.find((f) => f.type === "options");

  return {
    text: applyPersonality(
      avoidRepetition(
        `${fallback}\n\n${safeUnknownAnswer(userText)}\n\nTambém posso ajudar com: **${suggestions.join("**, **")}**.`,
        history
      ),
      personality
    ),
    options: optionsNode?.options,
    intent: "unknown",
    sentiment,
    suggestFollowUp: `Experimente perguntar sobre ${suggestions[0]}.`,
  };
}

export function resolveChatbotReply(
  bot: ChatbotRecord,
  userText: string,
  history: ConversationTurn[],
  state: ConversationState
): { reply: ChatbotReply; newState: ConversationState } {
  const trimmed = userText.trim();
  if (!trimmed) {
    return {
      reply: { text: "Envie uma mensagem — estou pronto para ajudar.", typingDelayMs: 300 },
      newState: state,
    };
  }

  const raw = buildSmartReply(bot, trimmed, history, state);
  const { intent, entities } = detectIntent(trimmed, state.context);
  const referencedPlan = resolvePlanForQuestion(trimmed, state.context, entities, history);

  const newContext: ConversationContext = {
    ...state.context,
    lastTopic: resolveContextTopic(intent, entities, state.context),
    lastMentionedPlan: referencedPlan ?? state.context.lastMentionedPlan,
    lastMentionedEntity: entities[0] ?? state.context.lastMentionedEntity,
    lastBotQuestion: raw.suggestFollowUp ?? raw.text.slice(0, 200),
  };

  const newState: ConversationState = {
    ...state,
    context: newContext,
    currentNodeId: raw.nextNodeId ?? state.currentNodeId,
    escalatedToHuman: raw.escalateHuman ?? state.escalatedToHuman,
    greeted: state.greeted || intent === "greeting",
  };

  return {
    reply: {
      ...raw,
      typingDelayMs: estimateTypingDelay(raw.text),
      sentiment: raw.sentiment ?? analyzeSentiment(trimmed),
    },
    newState,
  };
}

export function getWelcomeReply(bot: ChatbotRecord): ChatbotReply {
  const personality = getPersonality(bot.personality);
  const flows = bot.flows ?? [];
  const welcomeNode = flows[0];
  const optionsNode = flows.find((f) => f.type === "options");

  const text = applyPersonality(
    bot.welcomeMessage ?? welcomeNode?.text ?? "Olá! Sou o assistente — posso ajudar com preços, sites, CRM e suporte. O que precisa?",
    personality
  );

  return {
    text,
    options: optionsNode?.options,
    nextNodeId: welcomeNode?.nextId ?? optionsNode?.id,
    typingDelayMs: estimateTypingDelay(text),
    intent: "greeting",
  };
}
