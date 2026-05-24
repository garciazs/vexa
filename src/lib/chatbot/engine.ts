import { PLANS } from "@/lib/constants";
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
  buildAugmentedQuery,
  findPlanInHistory,
  indexFlowAsKnowledge,
  INTENT_HANDLERS,
  resolveFollowUpAnswer,
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
    if (n.includes(label) || label.split(" ").some((w) => w.length > 3 && n.includes(w))) {
      return opt;
    }
    if (/^[1-3]$/.test(n) && String(i + 1) === n) return opt;
  }
  return null;
}

function findNode(flows: BotFlowNode[], id?: string): BotFlowNode | undefined {
  if (!id) return undefined;
  return flows.find((f) => f.id === id);
}

function getPlanAnswer(planId: string, questionIntent: DetectedIntent): string {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return "Temos **Free**, **Starter** (€29), **Growth** (€79) e **Scale** (€199). Qual quer conhecer?";

  if (questionIntent === "pricing" || questionIntent === "follow_up") {
    return `O plano **${plan.name}** custa **€${plan.price}/mês**. ${plan.description}. Inclui: ${plan.features.join(", ")}.`;
  }
  if (questionIntent === "features" || questionIntent === "compare") {
    return `O **${plan.name}** inclui: ${plan.features.join(", ")}.`;
  }
  return `**${plan.name}** — €${plan.price}/mês: ${plan.features.slice(0, 5).join(", ")}.`;
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

function searchAndAnswer(
  userText: string,
  history: ConversationTurn[],
  context: ConversationContext,
  knowledgeIndex: ReturnType<typeof buildSearchIndex>,
  minScore = 1.2
): string | null {
  const augmented = buildAugmentedQuery(userText, history, context);
  const hits = retrieveKnowledgeEnhanced(userText, knowledgeIndex, {
    augmentedQuery: augmented,
    minScore,
    limit: 3,
  });
  if (hits.length === 0) return null;
  return synthesizeKnowledgeAnswer(hits);
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

  const followUp = resolveFollowUpAnswer(userText, state.context, history, knowledgeIndex);
  if (followUp) {
    return {
      text: applyPersonality(followUp, personality, { includeOpener: true }),
      intent: "follow_up",
      sentiment,
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

  const referencedPlan =
    resolveReferencedPlan(userText, state.context, entities, history) ?? findPlanInHistory(history);

  if ((intent === "pricing" || intent === "follow_up" || intent === "features") && referencedPlan) {
    const featureQ = /tem|inclui|vem|possui|automa|chatbot|crm|dominio|domínio|ia|site/i.test(userText.toLowerCase());
    const answer = getPlanAnswer(referencedPlan, featureQ ? "features" : intent);
    return {
      text: applyPersonality(answer, personality, { includeOpener: intent === "follow_up" }),
      intent: featureQ ? "features" : "pricing",
      sentiment,
      suggestFollowUp: "Quer comparar com outro plano ou assinar?",
    };
  }

  const handler = INTENT_HANDLERS[intent];
  if (handler) {
    const handled = handler(userText, state.context);
    if (handled) {
      return {
        text: applyPersonality(handled, personality, { includeOpener: true }),
        intent,
        sentiment,
      };
    }
  }

  if (intent === "pricing" || intent === "compare") {
    const compareHit = searchAndAnswer(userText, history, state.context, knowledgeIndex, 1);
    if (compareHit) {
      return { text: applyPersonality(compareHit, personality, { includeOpener: true }), intent, sentiment };
    }
    return {
      text: applyPersonality(
        "**Free** (1 site IA grátis) · **Starter** €29 · **Growth** €79 · **Scale** €199/mês. Qual encaixa no seu negócio?",
        personality,
        { includeOpener: true }
      ),
      intent,
      sentiment,
      suggestFollowUp: "Posso comparar Growth vs Starter?",
    };
  }

  if (intent === "domain" || (intent === "support" && /site|dom|entra|abre|offline/i.test(userText))) {
    return {
      text: applyPersonality(buildDomainSupportReply(userText), personality, {
        includeOpener: sentiment === "negative" || sentiment === "urgent",
      }),
      intent: intent === "domain" ? "domain" : "support",
      sentiment,
    };
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

  if (intent === "demo") {
    return {
      text: applyPersonality(
        "Ótimo! Qual dia e horário funcionam para uma demo de 15 min? (ex: terça 15h)",
        personality,
        { includeOpener: true }
      ),
      intent,
      sentiment,
    };
  }

  if (intent === "cancel") {
    return {
      text: applyPersonality(
        "Para cancelar: vá em **Planos** → **Gerir subscrição** (portal Stripe) → cancelar plano. O acesso mantém-se até fim do período pago. Precisa de ajuda com isso?",
        personality,
        { includeOpener: true }
      ),
      intent,
      sentiment,
    };
  }

  const ragAnswer = searchAndAnswer(userText, history, state.context, knowledgeIndex, 1);
  if (ragAnswer) {
    return {
      text: applyPersonality(ragAnswer, personality, { includeOpener: intent === "unknown" }),
      intent: intent === "unknown" ? "features" : intent,
      sentiment,
    };
  }

  for (const node of flows) {
    if (!node.text) continue;
    const overlap = searchAndAnswer(node.text + " " + userText, history, state.context, [
      { id: node.id, title: "fluxo", content: node.text, keywords: [] },
    ]);
    if (overlap && node.text.length > 20) {
      const userOverlap = userText.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      const nodeWords = node.text.toLowerCase().split(/\s+/);
      const matches = userOverlap.filter((w) => nodeWords.some((nw) => nw.includes(w) || w.includes(nw)));
      if (matches.length >= 1) {
        return {
          text: applyPersonality(node.text, personality),
          intent,
          sentiment,
          nextNodeId: node.nextId ?? node.id,
        };
      }
    }
  }

  const suggestions = suggestTopicsFromQuery(userText);
  const fallback = bot.fallbackMessage ?? DEFAULT_FALLBACK;
  const optionsNode = flows.find((f) => f.type === "options");

  return {
    text: applyPersonality(
      avoidRepetition(
        `${fallback}\n\nPosso ajudar com: **${suggestions.join("**, **")}**. Reformule a pergunta ou escolha abaixo.`,
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
  const referencedPlan =
    resolveReferencedPlan(trimmed, state.context, entities, history) ?? findPlanInHistory(history);

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
