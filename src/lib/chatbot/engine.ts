import { PLANS } from "@/lib/constants";
import {
  analyzeSentiment,
  avoidRepetition,
  detectIntent,
  estimateTypingDelay,
  retrieveKnowledge,
  resolveContextTopic,
  resolveReferencedPlan,
  type ConversationContext,
  type ConversationTurn,
  type DetectedIntent,
} from "@/lib/ai/conversation-brain";
import { mergeKnowledge } from "@/lib/chatbot/knowledge-base";
import { applyPersonality, getPersonality, type BotPersonalityId } from "@/lib/chatbot/personalities";
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

  for (const opt of node.options) {
    const label = normalizeInput(opt.label.replace(/[^\w\s]/g, ""));
    if (n.includes(label) || label.split(" ").some((w) => w.length > 3 && n.includes(w))) {
      return opt;
    }
  }
  return null;
}

function findNode(flows: BotFlowNode[], id?: string): BotFlowNode | undefined {
  if (!id) return undefined;
  return flows.find((f) => f.id === id);
}

function getPlanAnswer(planId: string, questionIntent: DetectedIntent): string {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return "Não encontrei esse plano. Temos Free, Starter (€29), Growth (€79) e Scale (€199).";

  if (questionIntent === "pricing" || questionIntent === "follow_up") {
    return `O plano **${plan.name}** custa **€${plan.price}/mês**. ${plan.description}. Quer saber o que inclui?`;
  }

  if (questionIntent === "features") {
    return `Sim — o **${plan.name}** inclui: ${plan.features.join(", ")}.`;
  }

  return `**${plan.name}** (€${plan.price}/mês): ${plan.features.slice(0, 4).join(", ")}.`;
}

function buildDomainSupportReply(text: string): string {
  const urgent = /nao entra|não entra|nao abre|não abre|offline|fora do ar|mano/i.test(text);
  if (urgent) {
    return (
      "Percebo a frustração — vamos resolver. Se o site não abre, verifique:\n\n" +
      "1. **Publicou** a landing no Builder?\n" +
      "2. O link `/p/seu-slug` abre no browser?\n" +
      "3. Se usa **domínio próprio**, o DNS está apontado e verificado em Domínios?\n\n" +
      "Se já fez isto e continua offline, digite **humano** que escalamos imediatamente."
    );
  }
  return "Para domínio personalizado (Growth/Scale): compre/ligue o domínio, configure os registos DNS e verifique em Domínios. Posso detalhar cada passo.";
}

function buildSmartReply(
  bot: ChatbotRecord,
  userText: string,
  history: ConversationTurn[],
  state: ConversationState
): Omit<ChatbotReply, "typingDelayMs"> {
  const personality = getPersonality(bot.personality);
  const knowledge = mergeKnowledge(bot.knowledgeBase, bot.useCustomKnowledgeOnly !== true);
  const { intent, entities, sentiment } = detectIntent(userText, state.context);
  const flows = bot.flows ?? [];

  if (/humano|atendente|pessoa real|operador/i.test(userText)) {
    return {
      text: applyPersonality(
        "Vou transferir para a equipa agora. Tempo médio de resposta: até 5 minutos no horário comercial.",
        personality,
        { includeOpener: true }
      ),
      intent: "human",
      sentiment,
      escalateHuman: true,
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

  const referencedPlan = resolveReferencedPlan(userText, state.context, entities);
  const topic = resolveContextTopic(intent, entities, state.context);

  if ((intent === "pricing" || intent === "follow_up") && referencedPlan) {
    const answer = getPlanAnswer(referencedPlan, intent);
    if (intent === "follow_up" && /tem|inclui|vem|possui|automa/i.test(userText.toLowerCase())) {
      const plan = PLANS.find((p) => p.id === referencedPlan);
      const hasAutomation = plan?.features.some((f) => /automa|chatbot|crm/i.test(f));
      const featureAnswer = hasAutomation
        ? `Sim! O plano **${plan?.name}** inclui automações e recursos avançados: ${plan?.features.filter((f) => /automa|chatbot|crm|ia/i.test(f)).join(", ")}.`
        : getPlanAnswer(referencedPlan, "features");
      return {
        text: applyPersonality(featureAnswer, personality, { includeOpener: intent === "follow_up" }),
        intent: "features",
        sentiment,
        suggestFollowUp: "Quer comparar com outro plano?",
      };
    }
    return {
      text: applyPersonality(answer, personality, { includeOpener: true }),
      intent: "pricing",
      sentiment,
      suggestFollowUp: "Quer saber se inclui automações ou chatbots?",
    };
  }

  if (intent === "pricing") {
    return {
      text: applyPersonality(
        "Temos **Free** (1 site grátis com IA), **Starter** €29/mês, **Growth** €79/mês e **Scale** €199/mês. Qual se encaixa melhor no seu negócio?",
        personality,
        { includeOpener: true }
      ),
      intent,
      sentiment,
    };
  }

  if (intent === "domain" || intent === "support") {
    const domainReply = buildDomainSupportReply(userText);
    return {
      text: applyPersonality(domainReply, personality, { includeOpener: sentiment === "negative" }),
      intent: intent === "domain" ? "domain" : "support",
      sentiment,
    };
  }

  if (intent === "greeting" && !state.greeted) {
    return {
      text: applyPersonality(
        bot.welcomeMessage ?? "Olá! Como posso ajudar hoje?",
        personality
      ),
      options: currentNode?.type === "options" ? currentNode.options : flows.find((f) => f.type === "options")?.options,
      intent,
      sentiment,
    };
  }

  if (intent === "thanks") {
    return {
      text: applyPersonality("De nada! Estou aqui se precisar de mais alguma coisa.", personality),
      intent,
      sentiment,
    };
  }

  if (intent === "demo") {
    return {
      text: applyPersonality(
        "Ótimo! Qual o melhor dia e horário para uma demo de 15 minutos? Responda com a sua disponibilidade.",
        personality,
        { includeOpener: true }
      ),
      intent,
      sentiment,
    };
  }

  const retrieved = retrieveKnowledge(userText, knowledge, 2);
  if (retrieved.length > 0 && retrieved[0].score >= 2) {
    const best = retrieved[0].item;
    let answer = best.content;
    if (retrieved.length > 1 && retrieved[1].score >= retrieved[0].score * 0.7) {
      answer += `\n\nTambém relevante: ${retrieved[1].item.title} — ${retrieved[1].item.content.slice(0, 120)}…`;
    }
    return {
      text: applyPersonality(answer, personality, { includeOpener: true }),
      intent: intent === "unknown" ? "features" : intent,
      sentiment,
    };
  }

  for (const node of flows) {
    if (node.type !== "message" || !node.text) continue;
    const nodeWords = node.text.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
    const userWords = userText.toLowerCase().split(/\s+/);
    const overlap = nodeWords.filter((w) => userWords.some((u) => u.includes(w) || w.includes(u)));
    if (overlap.length >= 2) {
      return {
        text: applyPersonality(node.text, personality),
        intent,
        sentiment,
        nextNodeId: node.nextId ?? node.id,
      };
    }
  }

  const fallback = bot.fallbackMessage ?? DEFAULT_FALLBACK;
  const optionsNode = flows.find((f) => f.type === "options");
  return {
    text: applyPersonality(
      avoidRepetition(
        `${fallback}\n\nPosso ajudar com **preços**, **funcionalidades**, **publicar o site** ou **domínios**. Reformule ou escolha uma opção.`,
        history
      ),
      personality
    ),
    options: optionsNode?.options,
    intent: "unknown",
    sentiment,
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
      reply: {
        text: "Envie uma mensagem — estou pronto para ajudar.",
        typingDelayMs: 300,
      },
      newState: state,
    };
  }

  const raw = buildSmartReply(bot, trimmed, history, state);
  const { intent, entities } = detectIntent(trimmed, state.context);
  const referencedPlan = resolveReferencedPlan(trimmed, state.context, entities);

  const newContext: ConversationContext = {
    ...state.context,
    lastTopic: resolveContextTopic(intent, entities, state.context),
    lastMentionedPlan: referencedPlan ?? state.context.lastMentionedPlan,
    lastMentionedEntity: entities[0] ?? state.context.lastMentionedEntity,
    lastBotQuestion: raw.suggestFollowUp ?? raw.text,
  };

  const newState: ConversationState = {
    ...state,
    context: newContext,
    currentNodeId: raw.nextNodeId ?? state.currentNodeId,
    escalatedToHuman: raw.escalateHuman ?? state.escalatedToHuman,
    greeted: state.greeted || intent === "greeting",
  };

  const reply: ChatbotReply = {
    ...raw,
    typingDelayMs: estimateTypingDelay(raw.text),
    sentiment: raw.sentiment ?? analyzeSentiment(trimmed),
  };

  return { reply, newState };
}

export function getWelcomeReply(bot: ChatbotRecord): ChatbotReply {
  const personality = getPersonality(bot.personality);
  const flows = bot.flows ?? [];
  const welcomeNode = flows[0];
  const optionsNode = flows.find((f) => f.type === "options");

  const text = applyPersonality(
    bot.welcomeMessage ?? welcomeNode?.text ?? "Olá! Como posso ajudar?",
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
