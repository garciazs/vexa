import { PLANS } from "@/lib/constants";
import type { KnowledgeItem } from "@/lib/ai/conversation-brain";

export function createDefaultKnowledge(): KnowledgeItem[] {
  const planFaqs: KnowledgeItem[] = PLANS.map((plan) => ({
    id: `plan-${plan.id}`,
    title: `Plano ${plan.name}`,
    content: `${plan.name} — ${plan.description}. Preço: €${plan.price}/mês. Inclui: ${plan.features.join(", ")}.`,
    keywords: [plan.name.toLowerCase(), plan.id, ...plan.features.slice(0, 3).map((f) => f.toLowerCase())],
    source: "system" as const,
  }));

  return [
    ...planFaqs,
    {
      id: "faq-publish",
      title: "Publicar landing page",
      content:
        "Para publicar: abra o Builder, edite os blocos, clique em Guardar e depois Publicar. A página fica disponível em /p/seu-slug.",
      keywords: ["publicar", "landing", "pagina", "site", "online"],
      source: "faq",
    },
    {
      id: "faq-ai",
      title: "Criar site com IA",
      content:
        "No plano Free pode usar a IA para criar 1 site completo, editar e publicar. Vá em Criar site, descreva o negócio e a IA gera a landing page.",
      keywords: ["ia", "inteligencia", "criar site", "gerador"],
      source: "faq",
    },
    {
      id: "faq-domain",
      title: "Domínio personalizado",
      content:
        "Domínios personalizados estão disponíveis nos planos Growth e Scale. Configure em Domínios, aponte o DNS e verifique a ligação.",
      keywords: ["dominio", "dns", "url", "personalizado isso", "site nao entra"],
      source: "faq",
    },
    {
      id: "faq-automation",
      title: "Automações multicanal",
      content:
        "Automações disparam mensagens no WhatsApp, Instagram, chat web ou email quando ocorre um gatilho: novo lead, lead qualificado, formulário enviado ou chat iniciado.",
      keywords: ["automacao", "workflow", "whatsapp", "instagram", "mensagem"],
      source: "faq",
    },
    {
      id: "faq-support",
      title: "Suporte técnico",
      content:
        "Se o site não abre, verifique: 1) se foi publicado, 2) se o slug está correto, 3) se o domínio personalizado tem DNS apontado. Para ajuda humana, digite 'humano'.",
      keywords: ["suporte", "problema", "erro", "nao funciona", "nao abre", "offline"],
      source: "faq",
    },
  ];
}

export function mergeKnowledge(
  custom: KnowledgeItem[] | undefined,
  includeDefaults = true
): KnowledgeItem[] {
  const defaults = includeDefaults ? createDefaultKnowledge() : [];
  const customItems = custom ?? [];
  const seen = new Set<string>();
  const merged: KnowledgeItem[] = [];

  for (const item of [...customItems, ...defaults]) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    merged.push(item);
  }
  return merged;
}
