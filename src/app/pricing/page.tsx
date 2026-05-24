import { Navbar } from "@/components/marketing/navbar";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { CtaSection } from "@/components/marketing/cta-section";
import { Footer } from "@/components/marketing/footer";

export const metadata = {
  title: "Preços",
  description: "Planos VEXA — Free €0, Starter €29, Growth €79, Scale €199. Todos em EUR.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Escolha o plano ideal
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Preços transparentes em euros. 14 dias grátis em todos os planos.
          </p>
        </div>
        <PricingCards showHeader={false} />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
