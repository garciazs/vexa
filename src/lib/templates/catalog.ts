import type { PageBlock } from "@/lib/store/types";
import type { PlanId } from "@/lib/store/types";
import { TEMPLATE_IMAGES } from "@/lib/templates/template-images";

export type TemplateTheme = "midnight" | "clean" | "launch" | "saas";

export interface TemplateDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  premium: boolean;
  /** Template incluído no plano Free para testar antes de assinar */
  freeStarter?: boolean;
  minPlan: PlanId;
  theme: TemplateTheme;
  previewGradient: string;
  blocks: PageBlock[];
}

function block(type: string, label: string, content: Record<string, string>): PageBlock {
  return {
    id: `tpl-${type}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    label,
    content,
  };
}

/** Template gratuito — criado automaticamente no registro do plano Free */
export const FREE_STARTER_TEMPLATE_ID = "free-starter";

const FREE_STARTER: TemplateDefinition = {
  id: FREE_STARTER_TEMPLATE_ID,
  name: "Página de Teste Grátis",
  category: "Grátis",
  description:
    "Landing page profissional pronta para editar. Ideal para testar o VEXA antes de assinar.",
  premium: false,
  freeStarter: true,
  minPlan: "free",
  theme: "midnight",
  previewGradient: "from-purple/50 via-background to-green/30",
  blocks: [
    block("hero", "Hero", {
      badge: "Teste grátis no VEXA",
      headline: "A sua landing page profissional começa aqui",
      subtitle:
        "Edite textos, cores e blocos. Publique em minutos e veja como o VEXA captura leads de verdade — sem pagar nada para testar.",
      cta: "Publicar e testar agora",
      imageUrl: TEMPLATE_IMAGES.heroFree,
      animation: "fade-up",
    }),
    block("social-proof", "Provas sociais", {
      headline: "Feito para converter",
      stat1: "5 min",
      stat1label: "Para personalizar",
      stat2: "100%",
      stat2label: "Editável por você",
      stat3: "1",
      stat3label: "Página incluída no Free",
    }),
    block("testimonials", "Depoimentos", {
      headline: "O que dizem quem já testou",
      quote1: "Em 10 minutos tinha uma página no ar. Finalmente uma ferramenta que não complica.",
      author1: "Mariana R.",
      role1: "Consultora",
      avatar1: TEMPLATE_IMAGES.avatar1,
      quote2: "Testei no plano grátis e no dia seguinte já tinha leads no CRM.",
      author2: "Pedro S.",
      role2: "Agência digital",
      avatar2: TEMPLATE_IMAGES.avatar2,
    }),
    block("pricing", "Oferta", {
      headline: "Teste sem compromisso",
      price: "€0",
      period: "plano Free",
      feature1: "1 landing page editável",
      feature2: "Editor visual completo",
      feature3: "Publicação e captura de leads",
      button: "Continuar a editar",
    }),
    block("faq", "FAQ", {
      headline: "Perguntas frequentes",
      q1: "Posso editar tudo?",
      a1: "Sim. Todos os textos e blocos desta página são editáveis no builder.",
      q2: "Preciso de cartão para testar?",
      a2: "Não. O plano Free permite criar e publicar a sua página de teste.",
      q3: "E depois do teste?",
      a3: "Faça upgrade para desbloquear templates premium, mais páginas e automações.",
    }),
    block("form", "Formulário", {
      headline: "Teste a captura de leads",
      subtitle: "Preencha o formulário — o lead aparece no seu CRM automaticamente.",
      button: "Quero ser contactado",
      imageUrl: TEMPLATE_IMAGES.formDark,
      animation: "fade-up",
    }),
    block("cta", "CTA final", {
      headline: "Gostou? Desbloqueie o VEXA completo",
      subtitle: "Templates premium, CRM avançado, chatbots e automações.",
      button: "Ver planos pagos",
    }),
  ],
};

export const TEMPLATE_CATALOG: TemplateDefinition[] = [
  FREE_STARTER,
  {
    id: "launch",
    name: "High Ticket Launch",
    category: "Lançamento",
    description: "Funil completo para mentorias, cursos premium e high ticket.",
    premium: true,
    minPlan: "growth",
    theme: "launch",
    previewGradient: "from-amber-500/20 via-purple/30 to-background",
    blocks: [
      block("hero", "Hero", {
        badge: "Vagas limitadas",
        headline: "O método que escala o seu negócio para 6 dígitos",
        subtitle:
          "Programa intensivo para empreendedores que querem previsibilidade, funil validado e vendas todos os dias.",
        cta: "Quero garantir a minha vaga",
        imageUrl: TEMPLATE_IMAGES.heroLaunch,
        animation: "fade-up",
      }),
      block("features", "Features", {
        headline: "O que vai dominar",
        subtitle: "Metodologia completa do tráfego ao fecho.",
        feature1title: "Funil validado",
        feature1desc: "Estrutura testada em centenas de lançamentos.",
        feature1image: TEMPLATE_IMAGES.feature1,
        feature2title: "Copy que converte",
        feature2desc: "Scripts prontos para cada etapa da jornada.",
        feature2image: TEMPLATE_IMAGES.feature2,
        feature3title: "Automação total",
        feature3desc: "WhatsApp, email e CRM no automático.",
        feature3image: TEMPLATE_IMAGES.feature3,
        animation: "fade-up",
      }),
      block("social-proof", "Provas sociais", {
        headline: "Números reais de quem aplicou",
        stat1: "€2.4M+",
        stat1label: "Gerados pelos alunos",
        stat2: "4.9/5",
        stat2label: "Avaliação média",
        stat3: "850+",
        stat3label: "Empresas ativas",
      }),
      block("testimonials", "Depoimentos", {
        headline: "Histórias de transformação",
        quote1: "Faturei €47.000 no primeiro mês após implementar o funil.",
        author1: "Carla Mendes",
        role1: "Mentora de negócios",
        quote2: "Deixei de depender só de indicações. Hoje tenho tráfego e conversão.",
        author2: "João Ferreira",
        role2: "Infoprodutor",
      }),
      block("pricing", "Pricing", {
        headline: "Investimento",
        price: "€997",
        period: "pagamento único",
        feature1: "12 semanas de acompanhamento",
        feature2: "Templates e scripts prontos",
        feature3: "Grupo exclusivo + suporte",
        button: "Garantir vaga agora",
      }),
      block("faq", "FAQ", {
        headline: "Dúvidas comuns",
        q1: "Serve para o meu nicho?",
        a1: "Sim, se vende serviços, mentorias ou produtos digitais de ticket médio/alto.",
        q2: "Há garantia?",
        a2: "7 dias para testar. Se não fizer sentido, devolvemos 100%.",
        q3: "Quando começo?",
        a3: "Acesso imediato após confirmação do pagamento.",
      }),
      block("form", "Formulário", {
        headline: "Lista de espera VIP",
        subtitle: "Seja avisado quando abrirem novas vagas.",
        button: "Entrar na lista",
      }),
      block("cta", "CTA", {
        headline: "A próxima turma fecha em breve",
        subtitle: "Não fique de fora da lista de espera.",
        button: "Quero participar",
      }),
    ],
  },
  {
    id: "saas",
    name: "SaaS Waitlist",
    category: "SaaS",
    description: "Captura emails antes do lançamento com visual tech premium.",
    premium: false,
    minPlan: "starter",
    theme: "saas",
    previewGradient: "from-cyan-500/20 via-purple/20 to-background",
    blocks: [
      block("hero", "Hero", {
        badge: "Early access",
        headline: "O software que a sua equipa vai adorar usar",
        subtitle:
          "Automatize workflows, centralize dados e escale sem caos. Entre na waitlist e ganhe 3 meses grátis.",
        cta: "Entrar na waitlist",
      }),
      block("social-proof", "Provas sociais", {
        headline: "Confiado por equipas inovadoras",
        stat1: "2.000+",
        stat1label: "Na waitlist",
        stat2: "99.9%",
        stat2label: "Uptime garantido",
        stat3: "SOC2",
        stat3label: "Em certificação",
      }),
      block("form", "Formulário", {
        headline: "Reserve o seu lugar",
        subtitle: "Sem spam. Apenas updates de lançamento.",
        button: "Quero acesso antecipado",
      }),
      block("cta", "CTA", {
        headline: "Lançamento em Q3 2026",
        subtitle: "Vagas limitadas para beta testers.",
        button: "Garantir early access",
      }),
    ],
  },
  {
    id: "coaching",
    name: "Coaching Premium",
    category: "Mentoria",
    description: "Página elegante para programas de coaching 1:1.",
    premium: true,
    minPlan: "growth",
    theme: "clean",
    previewGradient: "from-green/30 via-background to-purple/20",
    blocks: [
      block("hero", "Hero", {
        badge: "Mentoria exclusiva",
        headline: "Clareza, estratégia e execução para o próximo nível",
        subtitle:
          "Programa 1:1 para founders e profissionais liberais que querem escalar com método, não sorte.",
        cta: "Agendar call estratégica",
      }),
      block("testimonials", "Depoimentos", {
        headline: "Clientes que transformaram resultados",
        quote1: "Dobrei a receita em 90 dias com o plano que construímos juntos.",
        author1: "Sofia Almeida",
        role1: "CEO",
        quote2: "Finalmente saí do operacional e foco no que importa.",
        author2: "Tiago Lopes",
        role2: "Fundador",
      }),
      block("pricing", "Pricing", {
        headline: "Programa 90 dias",
        price: "€3.500",
        period: "investimento único",
        feature1: "12 sessões 1:1",
        feature2: "Plano de ação personalizado",
        feature3: "Suporte WhatsApp",
        button: "Candidatar-me",
      }),
      block("guarantee", "Garantia", {
        headline: "Compromisso com resultados",
        text: "Se após 30 dias não tiver clareza total no plano, devolvemos o investimento.",
      }),
      block("form", "Formulário", {
        headline: "Candidatura",
        subtitle: "Conte-nos sobre o seu negócio. Respondemos em 24h.",
        button: "Enviar candidatura",
      }),
    ],
  },
  {
    id: "webinar",
    name: "Webinar Funnel",
    category: "Eventos",
    description: "Inscrições para webinars e masterclasses ao vivo.",
    premium: true,
    minPlan: "growth",
    theme: "launch",
    previewGradient: "from-purple/40 to-green/20",
    blocks: [
      block("hero", "Hero", {
        badge: "Webinar gratuito",
        headline: "Como triplicar leads em 30 dias (método passo a passo)",
        subtitle: "Masterclass ao vivo. Vagas limitadas. Gravação só para inscritos.",
        cta: "Inscrever-me grátis",
      }),
      block("video", "Vídeo", {
        headline: "O que vai aprender",
        url: "",
        description: "Funil, copy, automação e CRM num só sistema.",
      }),
      block("form", "Formulário", {
        headline: "Reserve o seu lugar",
        subtitle: "Receba o link da sala 1h antes do evento.",
        button: "Confirmar inscrição",
      }),
      block("testimonials", "Depoimentos", {
        headline: "Quem já participou",
        quote1: "Implementei no mesmo dia e capturei 40 leads.",
        author1: "Rita Costa",
        role1: "Marketing",
        quote2: "O melhor webinar que assisti este ano.",
        author2: "Miguel Santos",
        role2: "E-commerce",
      }),
      block("cta", "CTA", {
        headline: "Últimas vagas disponíveis",
        button: "Inscrever-me agora",
      }),
    ],
  },
  {
    id: "agency",
    name: "Agency Portfolio",
    category: "Agências",
    description: "Apresentação profissional de serviços e captação de projetos.",
    premium: false,
    minPlan: "starter",
    theme: "clean",
    previewGradient: "from-surface-hover to-purple/20",
    blocks: [
      block("hero", "Hero", {
        badge: "Agência full-service",
        headline: "Construímos máquinas de vendas que funcionam 24/7",
        subtitle: "Landing pages, funis, automação e CRM para marcas que querem crescer de forma previsível.",
        cta: "Pedir proposta",
      }),
      block("social-proof", "Provas sociais", {
        headline: "Entregas que geram ROI",
        stat1: "120+",
        stat1label: "Projetos entregues",
        stat2: "38%",
        stat2label: "Conversão média",
        stat3: "15",
        stat3label: "Países",
      }),
      block("form", "Formulário", {
        headline: "Vamos falar do seu projeto?",
        subtitle: "Resposta em até 48 horas úteis.",
        button: "Solicitar proposta",
      }),
    ],
  },
];

export function getTemplate(id: string) {
  return TEMPLATE_CATALOG.find((t) => t.id === id);
}

export function cloneTemplateBlocks(templateId: string): PageBlock[] {
  const tpl = getTemplate(templateId);
  if (!tpl) return [];
  return tpl.blocks.map((b) => ({
    ...b,
    id: `block-${crypto.randomUUID()}`,
    content: { ...b.content },
  }));
}

export function cloneTemplateToPage(
  templateId: string,
  name: string,
  slug: string
): Omit<import("@/lib/store/types").LandingPageRecord, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
} {
  const tpl = getTemplate(templateId);
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    slug,
    status: "draft",
    blocks: cloneTemplateBlocks(templateId),
    views: 0,
    leadsCount: 0,
    templateId,
    createdAt: now,
    updatedAt: now,
    ...(tpl ? { theme: tpl.theme } : {}),
  } as import("@/lib/store/types").LandingPageRecord;
}

export const PLAN_LIMITS: Record<
  PlanId,
  { maxPages: number; maxChatbots: number; premiumTemplates: boolean }
> = {
  free: { maxPages: 1, maxChatbots: 0, premiumTemplates: false },
  starter: { maxPages: 3, maxChatbots: 1, premiumTemplates: false },
  growth: { maxPages: Infinity, maxChatbots: 5, premiumTemplates: true },
  scale: { maxPages: Infinity, maxChatbots: Infinity, premiumTemplates: true },
};

export function canUseTemplate(plan: PlanId, template: TemplateDefinition): boolean {
  if (template.freeStarter) return true;
  if (template.premium && !PLAN_LIMITS[plan].premiumTemplates) return false;
  const order: PlanId[] = ["free", "starter", "growth", "scale"];
  return order.indexOf(plan) >= order.indexOf(template.minPlan);
}

const VALID_PLANS: PlanId[] = ["free", "starter", "growth", "scale"];

export function normalizePlanId(plan: PlanId | string | undefined | null): PlanId {
  if (plan && VALID_PLANS.includes(plan as PlanId)) return plan as PlanId;
  return "free";
}

export function canCreatePage(
  plan: PlanId | string | undefined | null,
  currentCount: number,
  publishedTotal?: number
): boolean {
  const id = normalizePlanId(plan);
  const max = PLAN_LIMITS[id].maxPages;
  if (max !== Infinity && currentCount >= max) return false;
  if (id === "free" && (publishedTotal ?? 0) >= PLAN_LIMITS.free.maxPages) return false;
  return max === Infinity || currentCount < max;
}

/** Permite IA só enquanto ainda não criou o site grátis (Free) ou há slot no plano */
export function canUseAIGeneration(
  plan: PlanId | string | undefined | null,
  currentCount: number,
  publishedTotal?: number,
  totalEverCreated?: number
): boolean {
  const id = normalizePlanId(plan);
  const max = PLAN_LIMITS[id].maxPages;

  if (id === "free") {
    const created = totalEverCreated ?? currentCount;
    return created < max && currentCount < max;
  }

  if (canCreatePage(plan, currentCount, publishedTotal)) return true;
  return false;
}

export function getRemainingPages(
  plan: PlanId | string | undefined | null,
  currentCount: number,
  publishedTotal?: number
): number {
  if (!canCreatePage(plan, currentCount, publishedTotal)) return 0;
  const id = normalizePlanId(plan);
  const max = PLAN_LIMITS[id].maxPages;
  if (max === Infinity) return Infinity;
  return Math.max(0, max - currentCount);
}

export function getPageLimitMessage(
  plan: PlanId | string | undefined | null,
  atLimit: boolean,
  opts?: { hasDraft?: boolean; publishedTotal?: number }
): string {
  const id = normalizePlanId(plan);
  const published = opts?.publishedTotal ?? 0;

  if (!atLimit) {
    const max = PLAN_LIMITS[id].maxPages;
    if (max === 1) {
      return "Plano Free: 1 site com IA — depois de criar, assine o VEXA para continuar.";
    }
    if (max === Infinity) return "Sites ilimitados neste plano.";
    return `Pode criar até ${max} sites neste plano.`;
  }

  if (id === "free") {
    if (opts?.hasDraft || (opts?.publishedTotal ?? 0) === 0) {
      return "Plano Free: 1 site criado. Assine o VEXA para gerar mais sites com IA, chatbots e automações.";
    }
    return "Site grátis publicado. Assine o VEXA para criar mais landing pages.";
  }
  const max = PLAN_LIMITS[id].maxPages;
  return `Limite atingido (${max} sites). Faça upgrade para criar mais.`;
}
