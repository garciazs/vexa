import { MessageSquare, Rocket, Target } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Rocket,
    title: "Crie a sua landing page",
    description:
      "Escolha um template premium ou peça à IA. Publique em minutos com domínio personalizado.",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "Ative chatbots e automações",
    description:
      "Qualifique leads automaticamente via WhatsApp, web ou Instagram. Sem código.",
  },
  {
    step: "03",
    icon: Target,
    title: "Feche negócios no CRM",
    description:
      "Pipeline visual, scoring e follow-ups automáticos. Da visita à venda.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border bg-surface/50 py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Como funciona</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Três passos para ter a sua máquina de vendas a funcionar.
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((item, i) => (
            <div key={item.step} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-px w-full bg-gradient-to-r from-purple/50 to-transparent lg:block" />
              )}
              <div className="glass rounded-2xl p-8 text-center">
                <span className="text-5xl font-black text-purple/20">{item.step}</span>
                <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green/10 text-green">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
