import type { PageBlock } from "@/lib/store/types";

export const BLOCK_CATALOG = [
  { type: "features", label: "Features", icon: "Sparkles" },
  { type: "gallery", label: "Galeria", icon: "Users" },
  { type: "hero", label: "Hero Section", icon: "Sparkles" },
  { type: "cta", label: "CTA", icon: "MousePointerClick" },
  { type: "social-proof", label: "Provas sociais", icon: "Users" },
  { type: "testimonials", label: "Depoimentos", icon: "Quote" },
  { type: "faq", label: "FAQ", icon: "HelpCircle" },
  { type: "countdown", label: "Countdown", icon: "Timer" },
  { type: "pricing", label: "Pricing", icon: "CreditCard" },
  { type: "form", label: "Formulário", icon: "FormInput" },
  { type: "video", label: "Vídeo", icon: "Play" },
  { type: "guarantee", label: "Garantia", icon: "Shield" },
] as const;

export const DEFAULT_BLOCK_CONTENT: Record<string, Record<string, string>> = {
  hero: {
    headline: "O seu título principal aqui",
    subtitle: "Descreva a sua oferta em uma frase clara e persuasiva.",
    cta: "Quero começar agora",
  },
  cta: {
    headline: "Pronto para dar o próximo passo?",
    button: "Garantir a minha vaga",
  },
  "social-proof": {
    headline: "Empresas que confiam",
    stat1: "500+ clientes",
    stat2: "98% satisfação",
  },
  testimonials: {
    quote: "Depoimento do seu cliente aqui.",
    author: "Nome do cliente",
  },
  faq: {
    q1: "Como funciona?",
    a1: "Resposta clara para a objeção mais comum.",
  },
  countdown: {
    headline: "Oferta por tempo limitado",
    date: "2026-12-31",
  },
  pricing: {
    headline: "Escolha o seu plano",
    price: "€97",
  },
  form: {
    headline: "Receba mais informações",
    button: "Enviar",
  },
  video: {
    headline: "Veja como funciona",
    url: "",
  },
  guarantee: {
    headline: "Garantia de 7 dias",
    text: "Se não gostar, devolvemos o valor integral.",
  },
  features: {
    headline: "Porquê escolher-nos",
    subtitle: "Tudo o que precisa para converter visitantes em clientes.",
    feature1title: "Conversão otimizada",
    feature1desc: "Páginas desenhadas para maximizar leads e vendas.",
    feature1image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    feature2title: "Setup em minutos",
    feature2desc: "Publique sem código e sem complicações.",
    feature2image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    feature3title: "Suporte dedicado",
    feature3desc: "Equipa pronta para ajudar em cada passo.",
    feature3image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80",
    animation: "fade-up",
  },
  gallery: {
    headline: "Galeria",
    subtitle: "Veja o nosso trabalho e resultados.",
    image1: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    image2: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    image3: "https://images.unsplash.com/photo-1556760543-740958af8cc0?w=800&q=80",
    image4: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
    animation: "scale",
  },
};

export function createBlock(type: string, label: string): PageBlock {
  return {
    id: `block-${crypto.randomUUID()}`,
    type,
    label,
    content: { ...(DEFAULT_BLOCK_CONTENT[type] ?? { text: "Conteúdo do bloco" }) },
  };
}
