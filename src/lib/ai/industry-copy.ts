import type { Industry } from "@/lib/ai/industry-images";

export interface IndustryProfile {
  badge: string;
  headline: (name: string) => string;
  subtitle: (name: string, hint: string) => string;
  cta: string;
  featuresHeadline: string;
  featuresSubtitle: string;
  features: [string, string, string];
  featureDescs: [string, string, string];
  stats: [string, string, string];
  statLabels: [string, string, string];
  testimonials: [
    { quote: string; author: string; role: string },
    { quote: string; author: string; role: string },
    { quote: string; author: string; role: string },
  ];
  services?: [
    { title: string; desc: string; price: string },
    { title: string; desc: string; price: string },
    { title: string; desc: string; price: string },
  ];
  pricing?: { headline: string; price: string; period: string; features: string[]; button: string };
  faq: [string, string, string, string, string, string];
  formHeadline: string;
  formSubtitle: string;
  ctaFinal: { headline: string; subtitle: string; button: string };
  about?: { headline: string; text: string };
}

function base(
  partial: Omit<IndustryProfile, "subtitle"> & {
    subtitle?: (name: string, hint: string) => string;
  }
): IndustryProfile {
  return {
    subtitle: (n, h) => h || `Experiência premium e atendimento humano em ${n}.`,
    ...partial,
  };
}

const PROFILES: Partial<Record<Industry, IndustryProfile>> = {
  barbearia: base({
    badge: "Agendamento online",
    headline: (n) => `${n} — o corte que define o seu estilo`,
    subtitle: (n, h) =>
      h ||
      `Ambiente masculino, barbeiros experientes e acabamento impecável. Em ${n}, cada detalhe importa — do fade ao ritual da barba.`,
    cta: "Marcar horário",
    featuresHeadline: "Mais do que um corte",
    featuresSubtitle: "Serviços pensados para quem valoriza presença e estilo.",
    features: ["Corte & fade", "Barba clássica", "Tratamento completo"],
    featureDescs: [
      "Consultoria de estilo, lavagem premium e acabamento com navalha.",
      "Toalha quente, óleos naturais e contornos precisos.",
      "Combo corte + barba + hidratação — a experiência completa.",
    ],
    stats: ["4.9★", "8+ anos", "2.400+"],
    statLabels: ["Avaliação Google", "De experiência", "Clientes atendidos"],
    testimonials: [
      { quote: "Melhor fade da cidade. Saio sempre com confiança renovada.", author: "Ricardo M.", role: "Cliente há 3 anos" },
      { quote: "Profissionais atentos, pontuais e ambiente impecável.", author: "André Silva", role: "Empresário" },
      { quote: "Tradição e modernidade no mesmo lugar.", author: "Paulo H.", role: "Cliente regular" },
    ],
    services: [
      { title: "Corte clássico", desc: "Lavagem, corte e finalização", price: "€18" },
      { title: "Barba", desc: "Toalha quente + contorno navalha", price: "€12" },
      { title: "Combo premium", desc: "Corte + barba + hidratação", price: "€28" },
    ],
    faq: [
      "Preciso marcar?",
      "Recomendamos agendamento, mas aceitamos walk-in conforme disponibilidade.",
      "Quanto tempo demora?",
      "Corte simples ~30 min. Combo premium até 50 min.",
      "Aceitam cartão?",
      "Sim — MB Way, cartão e dinheiro.",
    ],
    formHeadline: "Reserve o seu horário",
    formSubtitle: "Escolha o dia ideal — confirmamos por SMS em minutos.",
    ctaFinal: { headline: "O espelho vai agradecer", subtitle: "Vagas limitadas ao fim de semana.", button: "Agendar agora" },
    about: {
      headline: "Tradição com olhar contemporâneo",
      text: "Nascemos da paixão pelo ofício. Cada cadeira é um ritual — ferramentas afiadas e barbeiros que ouvem antes de cortar.",
    },
  }),
  restaurante: base({
    badge: "Reservas abertas",
    headline: (n) => `${n} — sabores que ficam na memória`,
    subtitle: (n, h) => h || `Ingredientes frescos, carta sazonal e ambiente acolhedor em ${n}.`,
    cta: "Reservar mesa",
    featuresHeadline: "A nossa proposta",
    featuresSubtitle: "Do amuse-bouche à sobremesa, cada prato conta uma história.",
    features: ["Ingredientes locais", "Carta sazonal", "Ambiente único"],
    featureDescs: [
      "Produtores da região entregam frescos diariamente.",
      "Menu que muda com as estações.",
      "Decoração pensada para jantares memoráveis.",
    ],
    stats: ["4.7★", "15 anos", "80"],
    statLabels: ["TripAdvisor", "De história", "Lugares"],
    testimonials: [
      { quote: "Melhor jantar de aniversário. Serviço impecável.", author: "Miguel A.", role: "Cliente" },
      { quote: "Carta de vinhos surpreendente e harmonização perfeita.", author: "Sofia P.", role: "Cliente" },
      { quote: "Voltamos toda vez que visitamos a cidade.", author: "Família Costa", role: "Clientes fiéis" },
    ],
    faq: [
      "Aceitam reservas?",
      "Sim — online ou telefone.",
      "Menu vegetariano?",
      "Opções completas disponíveis.",
      "Estacionamento?",
      "Parque gratuito a 50m.",
    ],
    formHeadline: "Garanta a sua mesa",
    formSubtitle: "Indique data, hora e número de pessoas.",
    ctaFinal: { headline: "A mesa está quase pronta", subtitle: "Fins de semana esgotam rápido.", button: "Reservar agora" },
  }),
  saas: base({
    badge: "Trial 14 dias grátis",
    headline: (n) => `${n} — a plataforma que escala consigo`,
    subtitle: (n, h) => h || `Automatize processos, reduza custos e tome decisões com dados reais.`,
    cta: "Começar grátis",
    featuresHeadline: "Tudo num só lugar",
    featuresSubtitle: "Sem integrações frágeis — stack completo.",
    features: ["Setup rápido", "Automação", "Analytics"],
    featureDescs: [
      "Operacional em minutos, não meses.",
      "Workflows visuais sem código.",
      "Dashboards em tempo real.",
    ],
    stats: ["2.000+", "40%", "99.9%"],
    statLabels: ["Equipas", "Menos tempo manual", "Uptime"],
    testimonials: [
      { quote: "ROI positivo no primeiro mês.", author: "CTO", role: "Startup" },
      { quote: "Substituímos 4 ferramentas por uma.", author: "Ops Lead", role: "Scale-up" },
      { quote: "Onboarding impecável.", author: "Founder", role: "SaaS" },
    ],
    pricing: {
      headline: "Planos simples",
      price: "€49",
      period: "/mês por utilizador",
      features: ["Trial 14 dias", "Integrações incluídas", "Suporte prioritário", "Sem contrato"],
      button: "Iniciar trial",
    },
    faq: [
      "Trial grátis?",
      "14 dias, sem cartão de crédito.",
      "Integrações?",
      "Slack, Zapier e API REST incluídos.",
      "Cancelar?",
      "A qualquer momento, com export total.",
    ],
    formHeadline: "Comece o trial",
    formSubtitle: "Email corporativo — setup em 5 minutos.",
    ctaFinal: { headline: "Pare de perder tempo", subtitle: "Equipas que adoptam crescem 2x mais rápido.", button: "Trial grátis" },
  }),
  coaching: base({
    badge: "Vagas limitadas",
    headline: (n) => `${n} — resultados reais, método comprovado`,
    subtitle: (n, h) => h || `Programa intensivo para quem quer escalar receita e clareza estratégica.`,
    cta: "Candidatar-me",
    featuresHeadline: "O que vai conquistar",
    featuresSubtitle: "Framework testado com centenas de alunos.",
    features: ["Estratégia", "Implementação", "Comunidade"],
    featureDescs: [
      "Plano de 90 dias personalizado.",
      "Sessões semanais + accountability.",
      "Rede de empreendedores de alto nível.",
    ],
    stats: ["€2M+", "200+", "4.9★"],
    statLabels: ["Gerados por alunos", "Graduados", "Avaliação"],
    testimonials: [
      { quote: "Dobrei faturação em 6 meses seguindo o método.", author: "Empreendedor", role: "Alumni" },
      { quote: "Clareza que não tinha há anos.", author: "Coach", role: "Aluna" },
      { quote: "Investimento que se pagou na primeira semana.", author: "Consultor", role: "Aluno" },
    ],
    pricing: {
      headline: "Investimento",
      price: "€997",
      period: "programa completo",
      features: ["12 semanas", "Sessões 1:1", "Templates exclusivos", "Garantia 7 dias"],
      button: "Garantir vaga",
    },
    faq: [
      "Para quem é?",
      "Empreendedores com negócio activo.",
      "Garantia?",
      "7 dias — devolução total.",
      "Formato?",
      "Online ao vivo + gravações.",
    ],
    formHeadline: "Candidate-se",
    formSubtitle: "Conte sobre o seu negócio — analisamos fit.",
    ctaFinal: { headline: "Próxima turma a encher", subtitle: "Candidatura leva 2 minutos.", button: "Quero vaga" },
  }),
};

const GENERIC: IndustryProfile = base({
  badge: "Disponível agora",
  headline: (n) => `${n} — excelência que converte`,
  cta: "Contactar",
  featuresHeadline: "Porquê escolher-nos",
  featuresSubtitle: "Compromisso com qualidade em cada detalhe.",
  features: ["Experiência", "Qualidade", "Confiança"],
  featureDescs: [
    "Anos de dedicação ao cliente.",
    "Padrões elevados, sempre.",
    "Transparência e resultados.",
  ],
  stats: ["500+", "98%", "4.9★"],
  statLabels: ["Clientes", "Satisfação", "Avaliação"],
  testimonials: [
    { quote: "Superou expectativas do início ao fim.", author: "Cliente", role: "Verificado" },
    { quote: "Profissionalismo raro de encontrar.", author: "Parceiro", role: "Empresa" },
    { quote: "Recomendo sem hesitar.", author: "Cliente", role: "Regular" },
  ],
  faq: [
    "Como funciona?",
    "Contacte-nos — respondemos em 24h.",
    "Orçamento?",
    "Grátis e sem compromisso.",
    "Prazos?",
    "Definidos em conjunto consigo.",
  ],
  formHeadline: "Fale connosco",
  formSubtitle: "Deixe os seus dados — respondemos rapidamente.",
  ctaFinal: { headline: "Não deixe para depois", subtitle: "O momento ideal é agora.", button: "Começar" },
});

const LOCAL_OVERRIDES: Partial<Record<Industry, Partial<IndustryProfile>>> = {
  salon: {
    badge: "Transformação & bem-estar",
    headline: (n) => `${n} — realce a sua melhor versão`,
    cta: "Agendar consulta",
    features: ["Coloração", "Tratamentos", "Styling eventos"],
  },
  cafe: {
    badge: "Grãos especiais",
    headline: (n) => `${n} — o café que começa o dia certo`,
    cta: "Ver menu",
    features: ["Grãos de origem", "Brunch artesanal", "Espaço cowork"],
  },
  gym: {
    badge: "Aula experimental grátis",
    headline: (n) => `${n} — o corpo que você quer, com método`,
    cta: "Aula grátis",
    features: ["Musculação", "Aulas grupo", "Personal trainer"],
  },
  dentista: {
    badge: "Sorrisos saudáveis",
    headline: (n) => `${n} — sorria com confiança`,
    cta: "Marcar consulta",
    features: ["Clareamento", "Ortodontia", "Implantes"],
  },
  estetica: {
    badge: "Resultados visíveis",
    headline: (n) => `${n} — beleza com ciência e cuidado`,
    cta: "Avaliação gratuita",
    features: ["Facial", "Corporal", "Laser & tech"],
  },
  clinica: {
    badge: "Agendamento rápido",
    headline: (n) => `${n} — cuidado de saúde com confiança`,
    cta: "Marcar consulta",
    features: ["Equipa experiente", "Tecnologia", "Atendimento humano"],
  },
  petshop: {
    badge: "Amor por pets",
    headline: (n) => `${n} — o melhor para o seu melhor amigo`,
    cta: "Agendar banho",
    features: ["Banho & tosa", "Veterinário", "Loja premium"],
  },
  hotel: {
    badge: "Melhor tarifa directa",
    headline: (n) => `${n} — a estadia que você merece`,
    cta: "Ver disponibilidade",
    features: ["Quartos premium", "Gastronomia", "Localização"],
  },
  pizza: {
    badge: "Forno a lenha",
    headline: (n) => `${n} — pizza autêntica, sabor italiano`,
    cta: "Pedir delivery",
    features: ["Massa 48h", "Forno lenha", "Delivery rápido"],
  },
  padaria: {
    badge: "Forno artesanal",
    headline: (n) => `${n} — pão quente, tradição viva`,
    cta: "Ver encomendas",
    features: ["Pão artesanal", "Pastelaria", "Encomendas eventos"],
  },
};

function mergeProfile(industry: Industry): IndustryProfile {
  const specific = PROFILES[industry];
  if (specific) return specific;

  const override = LOCAL_OVERRIDES[industry];
  if (override) {
    return {
      ...GENERIC,
      ...override,
      headline: override.headline ?? GENERIC.headline,
      features: (override.features as IndustryProfile["features"]) ?? GENERIC.features,
    };
  }

  return GENERIC;
}

export function getIndustryProfile(industry: Industry): IndustryProfile {
  return mergeProfile(industry);
}
