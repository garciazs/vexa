import { PLANS } from "@/lib/constants";
import { normalizeText } from "@/lib/ai/conversation-brain";
import type { DetectedIntent } from "@/lib/ai/conversation-brain";

const PLAN_ALIASES: Record<string, string> = {
  free: "free",
  gratis: "free",
  grátis: "free",
  starter: "starter",
  basico: "starter",
  básico: "starter",
  growth: "growth",
  premium: "growth",
  pro: "growth",
  scale: "scale",
  enterprise: "scale",
};

export function extractPlanId(text: string): string | undefined {
  const n = normalizeText(text);
  for (const [alias, id] of Object.entries(PLAN_ALIASES)) {
    if (n.includes(alias)) return id;
  }
  return undefined;
}

function planFeatures(planId: string): readonly string[] {
  return PLANS.find((p) => p.id === planId)?.features ?? [];
}

function featureMatch(features: readonly string[], query: string): string | undefined {
  const n = normalizeText(query);
  for (const f of features) {
    const fn = normalizeText(f);
    const words = fn.split(" ").filter((w) => w.length > 3);
    if (words.some((w) => n.includes(w))) return f;
  }
  return undefined;
}

/** Resposta 100% baseada nos dados reais dos planos — sem alucinação */
export function answerPlanQuestion(
  planId: string,
  userText: string,
  intent: DetectedIntent
): string | null {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return null;

  const n = normalizeText(userText);
  const isPrice = intent === "pricing" || /preco|quanto|custo|valor|€|euro|mensal/.test(n);
  const isFeature =
    intent === "features" ||
    intent === "follow_up" ||
    /\b(tem|inclui|vem|possui|da para|dá para|white label|api|automa|chatbot|crm|dominio|domínio|ia)\b/.test(n);

  if (isPrice && !isFeature) {
    return `O plano **${plan.name}** custa **€${plan.price}/mês**. ${plan.description}`;
  }

  if (isFeature) {
    if (/white label|whitelabel/.test(n)) {
      const has = planFeatures(planId).some((f) => /white label/i.test(f));
      return has
        ? `Sim — o plano **${plan.name}** inclui **white label parcial**.`
        : `Não — white label está disponível no plano **Scale** (€199/mês).`;
    }
    if (/\bapi\b/.test(n)) {
      const has = planFeatures(planId).some((f) => /\bapi\b/i.test(f));
      return has
        ? `Sim — o plano **${plan.name}** inclui **API completa**.`
        : `API completa está no plano **Scale** (€199/mês). Starter e Growth não incluem API.`;
    }
    if (/automa/.test(n)) {
      const match = featureMatch(planFeatures(planId), "automa");
      return match
        ? `Sim — o **${plan.name}** inclui: ${match}.`
        : planId === "free"
          ? `Automações avançadas começam no **Starter** (€29/mês). O Free inclui editor e publicação.`
          : `Automação visual completa está no **Growth** (€79/mês).`;
    }
    if (/chatbot/.test(n)) {
      const match = featureMatch(planFeatures(planId), "chatbot");
      return match
        ? `Sim — o **${plan.name}** inclui: ${match}.`
        : planId === "free"
          ? `Chatbots multicanal começam no **Starter** (1 chatbot).`
          : `Verifique os recursos do **${plan.name}**: ${plan.features.join(", ")}.`;
    }
    if (/dominio|domínio/.test(n)) {
      const has = planFeatures(planId).some((f) => /domínio|dominio/i.test(f));
      return has
        ? `Sim — o **${plan.name}** inclui domínio personalizado.`
        : `Domínio personalizado está nos planos **Growth** e **Scale**.`;
    }
    if (/crm/.test(n)) {
      const match = featureMatch(planFeatures(planId), "crm");
      return match
        ? `Sim — o **${plan.name}** inclui: ${match}.`
        : `CRM básico a partir do **Starter**.`;
    }
    if (/ia|inteligencia|landing|site/.test(n)) {
      return `O **${plan.name}** inclui: ${plan.features.join(", ")}.`;
    }

    const matched = featureMatch(planFeatures(planId), userText);
    if (matched) return `Sim — o **${plan.name}** inclui: ${matched}.`;
    return `O plano **${plan.name}** (€${plan.price}/mês) inclui: ${plan.features.join(", ")}.`;
  }

  if (isPrice) {
    return `O plano **${plan.name}** custa **€${plan.price}/mês**.`;
  }

  return null;
}

/** Mapeia intenção → IDs de FAQ permitidos (evita respostas fora de contexto) */
export const INTENT_FAQ_FILTER: Partial<Record<DetectedIntent, string[]>> = {
  pricing: ["plan-free", "plan-starter", "plan-growth", "plan-scale", "faq-billing", "faq-compare"],
  features: ["plan-free", "plan-starter", "plan-growth", "plan-scale", "faq-ai-builder", "faq-templates"],
  domain: ["faq-domain", "faq-support"],
  support: ["faq-support", "faq-publish"],
  automation: ["faq-automation", "faq-chatbot"],
  chatbot: ["faq-chatbot", "faq-automation"],
  crm: ["faq-crm"],
  billing: ["faq-billing", "plan-free", "plan-starter", "plan-growth", "plan-scale"],
  account: ["faq-account"],
  compare: ["faq-compare", "plan-free", "plan-starter", "plan-growth", "plan-scale"],
  cancel: ["faq-billing"],
};

export function safeUnknownAnswer(userText: string): string {
  const n = normalizeText(userText);
  if (/preco|plano|quanto/.test(n)) {
    return "Sobre preços: **Free** (grátis), **Starter** €29, **Growth** €79, **Scale** €199/mês. Qual plano quer conhecer?";
  }
  return "Não tenho essa informação com certeza. Pode reformular ou perguntar sobre **preços**, **planos**, **criar site**, **domínios** ou **suporte**? Digite **humano** para falar com a equipa.";
}
