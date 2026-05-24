import { PLANS } from "@/lib/constants";
import type { KnowledgeItem } from "@/lib/ai/conversation-brain";

export function createDefaultKnowledge(): KnowledgeItem[] {
  const planFaqs: KnowledgeItem[] = PLANS.map((plan) => ({
    id: `plan-${plan.id}`,
    title: `Plano ${plan.name}`,
    content: `${plan.name} — ${plan.description}. Preço: €${plan.price}/mês. Inclui: ${plan.features.join(", ")}.`,
    keywords: [
      plan.name.toLowerCase(),
      plan.id,
      ...plan.features.map((f) => f.toLowerCase()),
      "plano",
      "preco",
      "assinatura",
    ],
    source: "system" as const,
  }));

  return [
    ...planFaqs,
    {
      id: "faq-publish",
      title: "Como publicar uma landing page",
      content:
        "Para publicar: 1) Abra o **Builder** ou **Criar site** com IA, 2) Edite os blocos, 3) Clique **Guardar**, 4) Clique **Publicar**. O site fica em `seusite.com/p/seu-slug`. No plano Free pode criar 1 site completo com IA e publicar grátis.",
      keywords: ["publicar", "landing", "pagina", "site", "online", "live", "subir", "colocar"],
      source: "faq",
    },
    {
      id: "faq-ai-builder",
      title: "Criar site com IA",
      content:
        "Vá em **Criar site** → descreva o negócio (nome, serviços, cores, estilo) → pode enviar fotos → a IA gera a landing completa → **Editar e publicar** no builder. Free: 1 site grátis com qualidade 100%. Pode regenerar com IA até publicar.",
      keywords: ["ia", "inteligencia", "criar site", "gerador", "gerar", "prompt", "foto"],
      source: "faq",
    },
    {
      id: "faq-domain",
      title: "Domínio personalizado e DNS",
      content:
        "Domínios personalizados: planos **Growth** e **Scale**. Em **Domínios** → ligue ou compre domínio → configure registos DNS (A/CNAME) → verifique. Se o site não abre: confirme publicação, teste `/p/slug`, verifique DNS (propagação 24-48h).",
      keywords: ["dominio", "dns", "url", "personalizado", "site nao entra", "nao abre", "offline", "fora do ar", "hospedagem"],
      source: "faq",
    },
    {
      id: "faq-automation",
      title: "Automações multicanal",
      content:
        "Em **Automações**: escolha gatilho (novo lead, lead qualificado, formulário, chat iniciado) → adicione passos WhatsApp/Instagram/chat/email → use `{{nome}}` e `{{email}}` → ative. Modo IA inteligente personaliza mensagens por intenção e sentimento.",
      keywords: ["automacao", "workflow", "whatsapp", "instagram", "mensagem", "automatico", "gatilho", "trigger"],
      source: "faq",
    },
    {
      id: "faq-chatbot",
      title: "Configurar chatbot",
      content:
        "Em **Chatbots** → criar bot (WhatsApp, Instagram ou Web) → editar fluxo → definir personalidade e FAQs → testar no simulador → simular conexão. A IA entende contexto, memória e responde com base na knowledge base.",
      keywords: ["chatbot", "bot", "whatsapp", "instagram", "widget", "assistente", "fluxo", "simulador"],
      source: "faq",
    },
    {
      id: "faq-crm",
      title: "CRM e leads",
      content:
        "O **CRM** mostra pipeline kanban (Novos → Qualificados → Proposta → Ganhos/Perdidos). Leads de landing pages entram automaticamente. Mova leads com setas, adicione manualmente, veja métricas no topo. Automações disparam ao qualificar lead.",
      keywords: ["crm", "lead", "leads", "pipeline", "venda", "cliente", "kanban", "qualificar"],
      source: "faq",
    },
    {
      id: "faq-billing",
      title: "Planos e pagamentos",
      content:
        "Planos: **Free** (1 site IA grátis), **Starter** €29/mês, **Growth** €79/mês, **Scale** €199/mês. Assine em **Planos** → pagamento Stripe seguro. Gerir cartão e faturas no portal Stripe. Cancelamento via portal.",
      keywords: ["billing", "pagamento", "cartao", "stripe", "fatura", "assinar", "upgrade", "cancelar", "reembolso"],
      source: "faq",
    },
    {
      id: "faq-account",
      title: "Conta e login",
      content:
        "Crie conta em **Cadastro** (grátis, sem cartão). Login com email registado. Dados ficam no seu workspace local. Para recuperar acesso, use o mesmo email no login.",
      keywords: ["login", "entrar", "cadastro", "conta", "registar", "senha", "password", "email"],
      source: "faq",
    },
    {
      id: "faq-templates",
      title: "Templates de landing",
      content:
        "Em **Templates** escolha funis prontos (SaaS, curso, serviço…). Free: template grátis. Starter+: templates premium. Pode editar tudo no builder ou usar **Criar site** com IA para gerar do zero.",
      keywords: ["template", "modelo", "tema", "funil", "premium"],
      source: "faq",
    },
    {
      id: "faq-analytics",
      title: "Analytics e métricas",
      content:
        "Em **Analytics** veja views, leads e conversão das landing pages. Dashboard mostra receita pipeline, leads recentes e taxa de conversão. Growth+: analytics avançado.",
      keywords: ["analytics", "metricas", "relatorio", "views", "conversao", "dados", "estatistica"],
      source: "faq",
    },
    {
      id: "faq-support",
      title: "Suporte e problemas técnicos",
      content:
        "Problemas comuns: site não abre → publicou? slug correcto? DNS verificado? IA não gera → limite do plano? Pagamento → verifique Stripe. Para ajuda humana: digite **humano** ou contacte suporte@vexa.pt.",
      keywords: ["suporte", "problema", "erro", "nao funciona", "bug", "ajuda", "help", "travou"],
      source: "faq",
    },
    {
      id: "faq-compare",
      title: "Comparar planos",
      content:
        "**Free**: 1 site IA grátis. **Starter** €29: 3 sites, 1 chatbot, CRM básico. **Growth** €79: ilimitado, 5 chatbots, automação, domínio. **Scale** €199: tudo ilimitado, IA avançada, API. Recomendamos Growth para empresas em crescimento.",
      keywords: ["comparar", "diferenca", "qual plano", "melhor", "recomenda", "escolher"],
      source: "faq",
    },
    {
      id: "faq-hours",
      title: "Horário de atendimento",
      content:
        "Assistente IA: **24/7**. Equipa humana: horário comercial (seg-sex, 9h-18h Lisboa). Urgências: digite **humano** no chat.",
      keywords: ["horario", "horário", "funciona", "24", "atendimento", "disponivel", "disponível"],
      source: "faq",
    },
    {
      id: "faq-free-limit",
      title: "Limites do plano Free",
      content:
        "Free: 1 site grátis com IA premium — crie, edite, regenere e **publique**. Só após publicar 1 site é que precisa assinar para criar outro. Editor e publicação completos incluídos.",
      keywords: ["free", "gratis", "limite", "gratuito", "quantos sites", "1 site"],
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

/** Pesquisa em todo o conhecimento incluindo fluxo do bot */
export function buildSearchIndex(
  custom: KnowledgeItem[] | undefined,
  flowKnowledge: KnowledgeItem[],
  includeDefaults = true
): KnowledgeItem[] {
  return [...mergeKnowledge(custom, includeDefaults), ...flowKnowledge];
}
