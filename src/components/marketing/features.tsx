import {
  BarChart3,
  Bot,
  Kanban,
  Layers,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Layers,
    title: "Landing Pages com IA",
    description:
      "Crie páginas de alta conversão em minutos. Templates premium e copy gerada por IA.",
  },
  {
    icon: Kanban,
    title: "CRM Visual",
    description:
      "Pipeline kanban com scoring automático. Nunca perca um lead quente.",
  },
  {
    icon: Bot,
    title: "Chatbots Inteligentes",
    description:
      "Web, WhatsApp e Instagram. Qualifique e feche vendas 24/7.",
  },
  {
    icon: Workflow,
    title: "Automações Visuais",
    description:
      "Fluxos sem código: follow-ups, notificações e movimentação no pipeline.",
  },
  {
    icon: BarChart3,
    title: "Analytics Avançado",
    description:
      "Funil completo, ROI e métricas em tempo real para decisões rápidas.",
  },
  {
    icon: Sparkles,
    title: "Templates Premium",
    description:
      "Funis testados para lançamentos, SaaS, mentoria e e-commerce.",
  },
  {
    icon: Zap,
    title: "Integrações Nativas",
    description: "WhatsApp, Stripe, calendário e webhooks prontos para escalar.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tudo o que precisa para{" "}
            <span className="text-gradient-purple">vender mais</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Infraestrutura comercial completa. Sem ferramentas dispersas.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="glass border-border transition hover:border-purple/30 hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]"
            >
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple/10 text-purple-bright">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
