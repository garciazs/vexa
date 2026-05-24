import type { VisualStrategy } from "@/lib/ai/visual-strategy";
import { getIndustryProfile } from "@/lib/ai/industry-copy";
import { isLocalBusiness } from "@/lib/ai/industry-images";

export interface PageCopy {
  navbar: { brand: string; links: string; cta: string };
  hero: {
    badge: string;
    headline: string;
    subtitle: string;
    cta: string;
    ctaSecondary: string;
  };
  logos: { headline: string; logo1: string; logo2: string; logo3: string; logo4: string; logo5: string };
  problemSolution: {
    headline: string;
    problem: string;
    solution: string;
    beforeLabel: string;
    afterLabel: string;
    before1: string;
    before2: string;
    before3: string;
    after1: string;
    after2: string;
    after3: string;
  };
  bento: {
    headline: string;
    subtitle: string;
    cell1title: string;
    cell1desc: string;
    cell2title: string;
    cell2desc: string;
    cell3title: string;
    cell3desc: string;
    cell4title: string;
    cell4desc: string;
  };
  features: {
    headline: string;
    subtitle: string;
    feature1title: string;
    feature1desc: string;
    feature2title: string;
    feature2desc: string;
    feature3title: string;
    feature3desc: string;
  };
  socialProof: {
    headline: string;
    stat1: string;
    stat1label: string;
    stat2: string;
    stat2label: string;
    stat3: string;
    stat3label: string;
  };
  testimonials: {
    headline: string;
    quote1: string;
    author1: string;
    role1: string;
    quote2: string;
    author2: string;
    role2: string;
    quote3: string;
    author3: string;
    role3: string;
  };
  pricing: {
    headline: string;
    subtitle: string;
    price: string;
    period: string;
    feature1: string;
    feature2: string;
    feature3: string;
    feature4: string;
    button: string;
  };
  faq: { headline: string; q1: string; a1: string; q2: string; a2: string; q3: string; a3: string };
  form: { headline: string; subtitle: string; button: string };
  cta: { headline: string; subtitle: string; button: string };
  footer: { tagline: string; col1: string; col2: string; col3: string };
  about?: { headline: string; text: string };
  services?: {
    headline: string;
    subtitle: string;
    service1title: string;
    service1desc: string;
    service1price: string;
    service2title: string;
    service2desc: string;
    service2price: string;
    service3title: string;
    service3desc: string;
    service3price: string;
  };
  guarantee?: { headline: string; text: string };
}

function isAiSupport(prompt: string) {
  return /ia de atendimento|atendimento automático|atendimento automatico|chatbot|suporte ai|ai de suporte|assistente virtual|atendimento com ia|atendimento 24/.test(
    prompt.toLowerCase()
  );
}

/** Extrai frase específica do prompt — evita headlines genéricas */
function extractPowerPhrase(prompt: string, fallback: string): string {
  const cleaned = prompt
    .replace(/#[0-9a-f]{3,8}\b/gi, "")
    .replace(/\b(cor|cores|tom|estilo|design|moderno|premium|minimalista)\b/gi, "")
    .trim();
  const sentences = cleaned.split(/[.!?\n]+/).map((s) => s.trim()).filter(Boolean);
  const best = sentences.find((s) => s.length >= 12 && s.length <= 90) ?? sentences[0];
  if (!best || best.length < 8) return fallback;
  return best.charAt(0).toUpperCase() + best.slice(1);
}

function aiSupportCopy(name: string, strategy: VisualStrategy): PageCopy {
  return {
    navbar: { brand: name, links: "Produto|Integrações|Preços|Docs", cta: "Começar grátis" },
    hero: {
      badge: "IA que responde em < 3 segundos",
      headline: `${name} — suporte que nunca dorme`,
      subtitle: `Automatize 80% dos tickets no WhatsApp, email e chat. ${strategy.valueProposition}. Sem contratar. Sem filas.`,
      cta: "Testar 14 dias grátis",
      ctaSecondary: "Ver demo ao vivo",
    },
    logos: {
      headline: "Equipas que já eliminaram filas de suporte",
      logo1: "Stripe",
      logo2: "Notion",
      logo3: "Linear",
      logo4: "Vercel",
      logo5: "Raycast",
    },
    problemSolution: {
      headline: "O suporte manual não escala. A IA sim.",
      problem: strategy.painPoint,
      solution: `${name} entende contexto, resolve dúvidas recorrentes e escala para humanos só quando necessário.`,
      beforeLabel: "Sem IA",
      afterLabel: `Com ${name}`,
      before1: "Tempo médio de resposta: 4h+",
      before2: "Equipa sobrecarregada",
      before3: "Clientes abandonam no meio",
      after1: "Resposta em segundos, 24/7",
      after2: "80% dos tickets resolvidos auto",
      after3: "NPS sobe. Churn desce.",
    },
    bento: {
      headline: "Tudo o que precisa para suporte de classe mundial",
      subtitle: "Construído para equipas que levam experiência a sério.",
      cell1title: "Multicanal nativo",
      cell1desc: "WhatsApp, Instagram, email e chat web — uma inbox, zero caos.",
      cell2title: "Contexto total",
      cell2desc: "A IA lê histórico, pedidos e perfil antes de responder.",
      cell3title: "Handoff inteligente",
      cell3desc: "Transfere para humano com resumo completo da conversa.",
      cell4title: "Analytics em tempo real",
      cell4desc: "CSAT, tempo de resolução e tópicos — tudo num dashboard.",
    },
    features: {
      headline: "Feito para escalar sem perder qualidade",
      subtitle: "Cada funcionalidade existe para converter e reter.",
      feature1title: "Setup em 15 minutos",
      feature1desc: "Importe FAQs, conecte canais e publique. Sem código.",
      feature2title: "Tom da sua marca",
      feature2desc: "Treine a IA com o vocabulário e personalidade da empresa.",
      feature3title: "Segurança enterprise",
      feature3desc: "GDPR, encriptação e logs auditáveis incluídos.",
    },
    socialProof: {
      headline: "Números que falam por si",
      stat1: "80%",
      stat1label: "Tickets resolvidos sem humano",
      stat2: "<3s",
      stat2label: "Tempo médio de resposta",
      stat3: "4.9★",
      stat3label: "Satisfação média",
    },
    testimonials: {
      headline: "O que dizem quem já escala suporte com IA",
      quote1: "Reduzimos o tempo de resposta de 6 horas para 8 segundos. O churn caiu 23%.",
      author1: "Mariana Costa",
      role1: "Head of CX · SaaS B2B",
      quote2: "Implementámos numa tarde. Na semana seguinte a equipa focava só em casos complexos.",
      author2: "Tiago Mendes",
      role2: "COO · E-commerce",
      quote3: "Finalmente suporte que parece humano — mas disponível às 3h da manhã.",
      author3: "Ana Rodrigues",
      role3: "Founder · Startup",
    },
    pricing: {
      headline: "Investimento que se paga na primeira semana",
      subtitle: "Sem contrato. Cancele quando quiser.",
      price: "€79",
      period: "/mês · até 2.000 conversas",
      feature1: "Trial 14 dias grátis",
      feature2: "WhatsApp + Instagram + Web",
      feature3: "Handoff para humanos",
      feature4: "Dashboard analytics",
      button: "Iniciar trial grátis",
    },
    faq: {
      headline: "Perguntas frequentes",
      q1: "Substitui a minha equipa?",
      a1: "Não — liberta-a. A IA trata do repetitivo; humanos focam no que importa.",
      q2: "Funciona em português?",
      a2: "Sim — PT-PT, PT-BR e 40+ idiomas nativamente.",
      q3: "Quanto tempo para implementar?",
      a3: "Média de 15 minutos do registo à primeira conversa automatizada.",
    },
    form: {
      headline: "Veja a IA em acção",
      subtitle: "Demo personalizada em 20 minutos — sem compromisso.",
      button: "Agendar demo",
    },
    cta: {
      headline: "Cada minuto sem IA é receita a fugir",
      subtitle: "Comece hoje. Setup grátis. Resultados esta semana.",
      button: "Começar trial grátis",
    },
    footer: {
      tagline: `${name} — suporte inteligente para equipas ambiciosas.`,
      col1: "Produto|Integrações|API|Changelog",
      col2: "Empresa|Sobre|Blog|Carreiras",
      col3: "Legal|Privacidade|Termos|GDPR",
    },
  };
}

export function generateCopy(strategy: VisualStrategy, prompt: string): PageCopy {
  const { brandName } = strategy;
  const name = brandName;

  if (isAiSupport(prompt)) return aiSupportCopy(name, strategy);

  if (isLocalBusiness(strategy.industry)) {
    const profile = getIndustryProfile(strategy.industry);
    return {
      navbar: { brand: name, links: "Serviços|Sobre|Galeria|Contacto", cta: profile.cta },
      hero: {
        badge: profile.badge,
        headline: profile.headline(name),
        subtitle: profile.subtitle(name, strategy.valueProposition),
        cta: profile.cta,
        ctaSecondary: "Ver serviços",
      },
      logos: {
        headline: "Recomendado por quem exige o melhor",
        logo1: "Google 4.9★",
        logo2: "500+ clientes",
        logo3: "Desde 2018",
        logo4: "Agendamento online",
        logo5: "Premium",
      },
      problemSolution: {
        headline: "Porque clientes escolhem-nos",
        problem: strategy.painPoint,
        solution: strategy.valueProposition,
        beforeLabel: "Alternativa comum",
        afterLabel: `Em ${name}`,
        before1: "Atendimento impessoal",
        before2: "Sem agendamento fácil",
        before3: "Resultados inconsistentes",
        after1: "Experiência personalizada",
        after2: "Reserva em 30 segundos",
        after3: "Qualidade comprovada",
      },
      bento: {
        headline: profile.featuresHeadline,
        subtitle: profile.featuresSubtitle,
        cell1title: profile.features[0],
        cell1desc: profile.featureDescs[0],
        cell2title: profile.features[1],
        cell2desc: profile.featureDescs[1],
        cell3title: profile.features[2],
        cell3desc: profile.featureDescs[2],
        cell4title: "Localização premium",
        cell4desc: "Ambiente pensado para o seu conforto.",
      },
      features: {
        headline: profile.featuresHeadline,
        subtitle: profile.featuresSubtitle,
        feature1title: profile.features[0],
        feature1desc: profile.featureDescs[0],
        feature2title: profile.features[1],
        feature2desc: profile.featureDescs[1],
        feature3title: profile.features[2],
        feature3desc: profile.featureDescs[2],
      },
      socialProof: {
        headline: "Confiança construída todos os dias",
        stat1: profile.stats[0],
        stat1label: profile.statLabels[0],
        stat2: profile.stats[1],
        stat2label: profile.statLabels[1],
        stat3: profile.stats[2],
        stat3label: profile.statLabels[2],
      },
      testimonials: {
        headline: "O que dizem os clientes",
        quote1: profile.testimonials[0].quote,
        author1: profile.testimonials[0].author,
        role1: profile.testimonials[0].role,
        quote2: profile.testimonials[1].quote,
        author2: profile.testimonials[1].author,
        role2: profile.testimonials[1].role,
        quote3: profile.testimonials[2]?.quote ?? profile.testimonials[0].quote,
        author3: profile.testimonials[2]?.author ?? profile.testimonials[0].author,
        role3: profile.testimonials[2]?.role ?? profile.testimonials[0].role,
      },
      pricing: {
        headline: "Investimento transparente",
        subtitle: "Sem surpresas. Qualidade garantida.",
        price: profile.services?.[0]?.price ?? "€25",
        period: "a partir de",
        feature1: profile.services?.[0]?.title ?? "Serviço principal",
        feature2: profile.services?.[1]?.title ?? "Serviço premium",
        feature3: "Agendamento online",
        feature4: "Atendimento personalizado",
        button: profile.cta,
      },
      faq: {
        headline: "Perguntas frequentes",
        q1: profile.faq[0],
        a1: profile.faq[1],
        q2: profile.faq[2],
        a2: profile.faq[3],
        q3: profile.faq[4],
        a3: profile.faq[5],
      },
      form: {
        headline: profile.formHeadline,
        subtitle: profile.formSubtitle,
        button: profile.cta,
      },
      cta: {
        headline: profile.ctaFinal.headline,
        subtitle: profile.ctaFinal.subtitle,
        button: profile.ctaFinal.button,
      },
      footer: {
        tagline: `${name} — ${strategy.tagline}`,
        col1: "Serviços|Galeria|Preços|Contacto",
        col2: "Sobre|Equipa|Blog|Carreiras",
        col3: "Privacidade|Termos|Cookies",
      },
      about: profile.about,
      services: profile.services
        ? {
            headline: "Os nossos serviços",
            subtitle: "Preços claros. Qualidade em cada detalhe.",
            service1title: profile.services[0].title,
            service1desc: profile.services[0].desc,
            service1price: profile.services[0].price,
            service2title: profile.services[1].title,
            service2desc: profile.services[1].desc,
            service2price: profile.services[1].price,
            service3title: profile.services[2].title,
            service3desc: profile.services[2].desc,
            service3price: profile.services[2].price,
          }
        : undefined,
    };
  }

  // Default SaaS / tech premium copy
  const heroHook = extractPowerPhrase(prompt, strategy.valueProposition.split("—")[0].trim());
  return {
    navbar: { brand: name, links: "Produto|Clientes|Preços|Docs", cta: "Começar grátis" },
    hero: {
      badge: strategy.tagline,
      headline: `${name} — ${heroHook}`,
      subtitle: strategy.valueProposition,
      cta: "Começar grátis",
      ctaSecondary: "Ver como funciona",
    },
    logos: {
      headline: "Confiado por equipas ambiciosas",
      logo1: "Vercel",
      logo2: "Linear",
      logo3: "Stripe",
      logo4: "Notion",
      logo5: "Framer",
    },
    problemSolution: {
      headline: "O problema é claro. A solução também.",
      problem: strategy.painPoint,
      solution: strategy.valueProposition,
      beforeLabel: "Antes",
      afterLabel: `Com ${name}`,
      before1: "Processos manuais e lentos",
      before2: "Dados espalhados em 5 tools",
      before3: "Decisões sem visibilidade",
      after1: "Automação end-to-end",
      after2: "Uma plataforma. Zero caos.",
      after3: "Dashboards em tempo real",
    },
    bento: {
      headline: "Projetado para equipas que movem rápido",
      subtitle: "Cada detalhe pensado para velocidade, clareza e conversão.",
      cell1title: "Setup instantâneo",
      cell1desc: "Operacional em minutos. Integrações nativas incluídas.",
      cell2title: "Workflows visuais",
      cell2desc: "Automatize sem código. Arraste, conecte, publique.",
      cell3title: "Insights acionáveis",
      cell3desc: "Métricas que importam — não vanity metrics.",
      cell4title: "Escala segura",
      cell4desc: "Infra enterprise. Uptime 99.9%. GDPR ready.",
    },
    features: {
      headline: "Tudo num só lugar",
      subtitle: "Pare de pagar por 6 ferramentas que não conversam.",
      feature1title: "Integrações nativas",
      feature1desc: "Slack, WhatsApp, Stripe, HubSpot — conecte em cliques.",
      feature2title: "Automação inteligente",
      feature2desc: "Triggers, condições e acções — sem limites.",
      feature3title: "Analytics avançado",
      feature3desc: "Funis, cohorts e conversão — dados que convertem.",
    },
    socialProof: {
      headline: "Resultados reais. Não promessas.",
      stat1: "2.400+",
      stat1label: "Equipas activas",
      stat2: "40%",
      stat2label: "Menos tempo manual",
      stat3: "99.9%",
      stat3label: "Uptime garantido",
    },
    testimonials: {
      headline: "Histórias de quem já escala",
      quote1: "Substituímos 4 ferramentas. ROI positivo na primeira semana.",
      author1: "Ricardo Alves",
      role1: "CTO · Scale-up",
      quote2: "A equipa adoptou no dia 1. Raro acontecer com SaaS.",
      author2: "Sofia Martins",
      role2: "Head of Ops",
      quote3: "Parece produto de Silicon Valley. Funciona como prometido.",
      author3: "João Ferreira",
      role3: "Founder",
    },
    pricing: {
      headline: "Planos que crescem consigo",
      subtitle: "Sem surpresas. Sem contrato longo.",
      price: "€49",
      period: "/mês · facturado mensalmente",
      feature1: "Trial 14 dias grátis",
      feature2: "Integrações ilimitadas",
      feature3: "Suporte prioritário",
      feature4: "Export total de dados",
      button: "Iniciar trial",
    },
    guarantee: {
      headline: "Garantia sem risco",
      text: "14 dias para testar tudo. Se não sentir impacto real, cancelamos — sem perguntas, export total incluído.",
    },
    faq: {
      headline: "Perguntas frequentes",
      q1: "Preciso de cartão para o trial?",
      a1: "Não. 14 dias completos, zero compromisso.",
      q2: "Integra com o que já uso?",
      a2: "Sim — Zapier, API REST e integrações nativas.",
      q3: "Posso cancelar quando quiser?",
      a3: "Sim. Export completo incluído.",
    },
    form: {
      headline: "Pronto para escalar?",
      subtitle: "Comece em 5 minutos. Sem cartão.",
      button: "Criar conta grátis",
    },
    cta: {
      headline: "O concorrente não vai esperar",
      subtitle: "Cada dia sem automação é margem que perde.",
      button: "Começar agora",
    },
    footer: {
      tagline: `${name} — ${strategy.tagline}`,
      col1: "Produto|Features|Integrações|API",
      col2: "Empresa|Sobre|Blog|Carreiras",
      col3: "Legal|Privacidade|Termos|Status",
    },
  };
}
