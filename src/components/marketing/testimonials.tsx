import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Ana Costa",
    role: "Fundadora, FitLife Studio",
    content:
      "Aumentámos a conversão em 340% no primeiro mês. O VEXA substituiu 4 ferramentas diferentes.",
    rating: 5,
  },
  {
    name: "Ricardo Mendes",
    role: "CEO, NovaScale",
    content:
      "O chatbot de WhatsApp qualifica leads enquanto dormimos. ROI de 8x em 90 dias.",
    rating: 5,
  },
  {
    name: "Sofia Almeida",
    role: "Mentora de Negócios",
    content:
      "Criei a minha landing page em 12 minutos. A IA escreveu copy melhor que eu.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            O que dizem os nossos clientes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Empresas portuguesas que escalam com o VEXA.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="glass">
              <CardContent className="p-6">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-green text-green" />
                  ))}
                </div>
                <p className="mt-4 text-foreground">&ldquo;{t.content}&rdquo;</p>
                <div className="mt-6 border-t border-border pt-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
