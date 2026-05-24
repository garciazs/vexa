import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PLANS } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";

interface PricingCardsProps {
  showHeader?: boolean;
}

export function PricingCards({ showHeader = true }: PricingCardsProps) {
  return (
    <section id="pricing" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Planos simples, resultados reais
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comece grátis. Escale quando estiver pronto. Todos os preços em EUR.
            </p>
          </div>
        )}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative glass transition",
                plan.popular &&
                  "border-purple/50 glow-purple scale-[1.02] lg:scale-105"
              )}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Mais popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  variant={plan.popular ? "green" : "default"}
                  asChild
                >
                  <Link href={`/cadastro?plan=${plan.id}`}>
                    {plan.id === "free"
                      ? "Começar grátis"
                      : plan.popular
                        ? "Começar com Growth"
                        : `Escolher ${plan.name}`}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
