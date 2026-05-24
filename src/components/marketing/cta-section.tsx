import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-purple/30 bg-gradient-to-br from-purple/20 via-surface to-green/10 p-12 text-center lg:p-16">
          <div className="absolute inset-0 bg-radial-purple opacity-50" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Pronto para fechar mais negócios?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Junte-se a centenas de empresas portuguesas que já usam o VEXA para escalar vendas.
            </p>
            <Button size="xl" variant="green" className="mt-8" asChild>
              <Link href="/cadastro">
                Começar grátis — 14 dias
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Sem cartão de crédito • Cancele quando quiser
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
