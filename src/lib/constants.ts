export const BRAND = {
  name: "VEXA",
  tagline: "Você cria páginas. O VEXA fecha negócios.",
  description:
    "Plataforma all-in-one de vendas, automação e conversão. Infraestrutura comercial pronta em minutos.",
} as const;

export const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "1 site grátis com IA 100% — crie, publique e só depois assine para mais.",
    popular: false,
    features: [
      "1 site grátis com IA premium (criar + publicar)",
      "Regenerar com IA até publicar",
      "Todas as secções premium incluídas",
      "Até 3 fotos suas",
      "Editor e publicação completos",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    description: "Ideal para iniciantes.",
    popular: false,
    features: [
      "3 landing pages",
      "1 chatbot",
      "CRM básico",
      "Templates premium",
      "Analytics básico",
      "1 usuário",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    description: "Ideal para empresas em crescimento.",
    popular: true,
    features: [
      "Landing pages ilimitadas",
      "5 chatbots",
      "CRM avançado",
      "Automação visual",
      "IA para copy",
      "Domínio personalizado",
      "Analytics avançado",
      "Integração WhatsApp",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    price: 199,
    description: "Para operações avançadas.",
    popular: false,
    features: [
      "Tudo ilimitado",
      "IA avançada",
      "Equipes & multiusuários",
      "White label parcial",
      "API completa",
      "A/B testing com IA",
      "Prioridade no suporte",
      "Automações avançadas",
    ],
  },
] as const;

export const NAV_LINKS = [
  { href: "#features", label: "Funcionalidades" },
  { href: "#how-it-works", label: "Como funciona" },
  { href: "/pricing", label: "Preços" },
  { href: "#testimonials", label: "Clientes" },
] as const;

export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Visão geral", icon: "LayoutDashboard" },
  { href: "/builder", label: "Landing Pages", icon: "Layers" },
  { href: "/builder/ai", label: "Criar site", icon: "Sparkles" },
  { href: "/domains", label: "Domínios", icon: "Globe" },
  { href: "/crm", label: "CRM", icon: "Kanban" },
  { href: "/chatbots", label: "Chatbots", icon: "MessageSquare" },
  { href: "/automations", label: "Automações", icon: "Workflow" },
  { href: "/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/templates", label: "Templates", icon: "Sparkles" },
  { href: "/billing", label: "Planos", icon: "CreditCard" },
  { href: "/settings", label: "Configurações", icon: "Settings" },
  { href: "/help", label: "Ajuda", icon: "HelpCircle" },
] as const;
