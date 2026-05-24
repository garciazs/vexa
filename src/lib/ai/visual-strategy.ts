import { extractColorsFromPrompt } from "@/lib/ai/color-parser";
import {
  PREMIUM_ONLY_SECTIONS,
  STARTER_SECTIONS_SKIP,
  getGenerationTier,
} from "@/lib/ai/generation-tiers";
import type { PlanId } from "@/lib/store/types";
import { detectIndustry, INDUSTRY_LABELS, isLocalBusiness, type Industry } from "@/lib/ai/industry-images";

export type PageType =
  | "saas"
  | "local"
  | "infoproduct"
  | "agency"
  | "app"
  | "portfolio"
  | "funnel"
  | "institutional";

export type VisualStyle =
  | "linear-dark"
  | "stripe-minimal"
  | "apple-clean"
  | "neon-ai"
  | "luxury-serif"
  | "vibrant-marketing"
  | "warm-local";

export type PrimaryEmotion =
  | "trust"
  | "innovation"
  | "luxury"
  | "speed"
  | "exclusivity"
  | "warmth"
  | "authority";

export interface VisualPalette {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  gradient: string;
  mode: "dark" | "light";
}

export interface VisualStrategy {
  industry: Industry;
  industryLabel: string;
  pageType: PageType;
  audience: string;
  valueProposition: string;
  painPoint: string;
  emotion: PrimaryEmotion;
  visualStyle: VisualStyle;
  palette: VisualPalette;
  typography: "sans-modern" | "sans-display" | "serif-luxury";
  brandName: string;
  tagline: string;
  narrative: string;
  sections: string[];
  isPremium: boolean;
}

const STYLE_PALETTES: Record<VisualStyle, VisualPalette> = {
  "linear-dark": {
    primary: "#5E6AD2",
    accent: "#8B5CF6",
    background: "#08090A",
    surface: "#111214",
    text: "#F4F4F5",
    muted: "#71717A",
    gradient: "linear-gradient(135deg, #5E6AD2 0%, #8B5CF6 50%, #06B6D4 100%)",
    mode: "dark",
  },
  "stripe-minimal": {
    primary: "#635BFF",
    accent: "#0AEFFF",
    background: "#0A0A0B",
    surface: "#141416",
    text: "#FFFFFF",
    muted: "#A1A1AA",
    gradient: "linear-gradient(135deg, #635BFF 0%, #0AEFFF 100%)",
    mode: "dark",
  },
  "apple-clean": {
    primary: "#0071E3",
    accent: "#2997FF",
    background: "#FBFBFD",
    surface: "#FFFFFF",
    text: "#1D1D1F",
    muted: "#6E6E73",
    gradient: "linear-gradient(180deg, #FBFBFD 0%, #F5F5F7 100%)",
    mode: "light",
  },
  "neon-ai": {
    primary: "#22D3EE",
    accent: "#A855F7",
    background: "#030712",
    surface: "#0F172A",
    text: "#F8FAFC",
    muted: "#94A3B8",
    gradient: "linear-gradient(135deg, #22D3EE 0%, #A855F7 50%, #EC4899 100%)",
    mode: "dark",
  },
  "luxury-serif": {
    primary: "#C9A227",
    accent: "#E8D5A3",
    background: "#0C0C0C",
    surface: "#161616",
    text: "#FAFAFA",
    muted: "#A3A3A3",
    gradient: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
    mode: "dark",
  },
  "vibrant-marketing": {
    primary: "#FF4D4D",
    accent: "#FF8A00",
    background: "#0F0F0F",
    surface: "#1A1A1A",
    text: "#FFFFFF",
    muted: "#B3B3B3",
    gradient: "linear-gradient(135deg, #FF4D4D 0%, #FF8A00 100%)",
    mode: "dark",
  },
  "warm-local": {
    primary: "#B45309",
    accent: "#D97706",
    background: "#FFFBF5",
    surface: "#FFFFFF",
    text: "#292524",
    muted: "#78716C",
    gradient: "linear-gradient(180deg, #FFFBF5 0%, #FEF3C7 100%)",
    mode: "light",
  },
};

function detectPageType(prompt: string, industry: Industry): PageType {
  const p = prompt.toLowerCase();
  if (/portfolio|portfólio|designer|criativo|fotógrafo|fotografo/.test(p)) return "portfolio";
  if (/app|mobile|ios|android|download|play store/.test(p)) return "app";
  if (/fintech|pagamento|payment|bank|cartão|cartao|pix/.test(p)) return "saas";
  if (/funil|funnel|lançamento|lancamento|infoproduto|curso|mentoria|webinar/.test(p)) return "infoproduct";
  if (/agência|agencia|marketing|consultoria/.test(p)) return "agency";
  if (isLocalBusiness(industry)) return "local";
  if (industry === "saas" || /ia|ai|software|plataforma|saas|automação|automacao|chatbot|atendimento/.test(p))
    return "saas";
  if (/institucional|empresa|corporativ/.test(p)) return "institutional";
  return "saas";
}

function detectEmotion(pageType: PageType, prompt: string): PrimaryEmotion {
  const p = prompt.toLowerCase();
  if (/luxo|premium|exclusiv|high ticket|vip/.test(p)) return "luxury";
  if (/rápido|rapido|veloc|instant|agora|24h|urgente/.test(p)) return "speed";
  if (/confiança|confianca|segur|saúde|saude|clínica|clinica|advocacia|fintech/.test(p)) return "trust";
  if (/ia|ai|tech|inovação|inovacao|futuro|automação/.test(p)) return "innovation";
  if (pageType === "local") return "warmth";
  if (pageType === "infoproduct") return "exclusivity";
  return "innovation";
}

function detectVisualStyle(pageType: PageType, emotion: PrimaryEmotion, prompt: string): VisualStyle {
  const p = prompt.toLowerCase();
  if (/ia|ai|chatbot|atendimento automático|gpt|machine learning/.test(p)) return "neon-ai";
  if (emotion === "luxury" || pageType === "portfolio" || /advocacia|luxo|premium/.test(p)) return "luxury-serif";
  if (pageType === "local") return "warm-local";
  if (pageType === "infoproduct" || pageType === "agency") return "vibrant-marketing";
  if (emotion === "trust" || /fintech|saúde|health/.test(p)) return "stripe-minimal";
  if (emotion === "innovation") return "linear-dark";
  if (/clean|minimal|apple|branco|claro/.test(p)) return "apple-clean";
  return "linear-dark";
}

function extractBrandName(prompt: string, industry: Industry): string {
  const quoted = prompt.match(/["'«]([^"'»]+)["'»]/);
  if (quoted) return quoted[1].trim().slice(0, 48);

  const named = prompt.match(
    /(?:chamad[oa]|nome)\s+([A-ZÀ-Ú][\wÀ-ú\s]{2,24})/i
  );
  if (named) return named[1].trim();

  const forMatch = prompt.match(/(?:para|da|do)\s+(?:a\s+|o\s+)?([A-ZÀ-Ú][\wÀ-ú\s]{2,28})/);
  if (forMatch) return forMatch[1].trim();

  const defaults: Partial<Record<Industry, string>> = {
    saas: "Flowdesk",
    barbearia: "Barber Studio",
    restaurante: "Sabor & Co",
    coaching: "Elevate",
    agency: "Scale Agency",
    generic: "Nova",
  };
  return defaults[industry] ?? "Nova";
}

function audienceFor(pageType: PageType, industry: Industry): string {
  const map: Record<PageType, string> = {
    saas: "equipas de operações, founders e PMEs que precisam escalar sem contratar",
    local: "clientes locais que valorizam qualidade, conveniência e experiência premium",
    infoproduct: "profissionais ambiciosos prontos para investir em resultados reais",
    agency: "marcas B2B e startups que querem crescimento previsível",
    app: "utilizadores mobile que esperam UX impecável e valor instantâneo",
    portfolio: "clientes exigentes à procura de talento criativo de elite",
    funnel: "leads quentes no momento de decisão de compra",
    institutional: "decisores corporativos e parceiros estratégicos",
  };
  if (isLocalBusiness(industry)) return map.local;
  return map[pageType];
}

function valueProp(pageType: PageType, prompt: string, name: string): string {
  const p = prompt.toLowerCase();
  if (/ia de atendimento|atendimento automático|chatbot|suporte ai/.test(p)) {
    return `${name} resolve 80% dos tickets em segundos — sem filas, sem espera, sem custo de equipa extra`;
  }
  if (pageType === "local") return `Experiência memorável em ${name} — do primeiro contacto ao resultado final`;
  if (pageType === "saas") return `${name} elimina o caos operacional e devolve horas à sua equipa todas as semanas`;
  if (pageType === "infoproduct") return `Método comprovado para ir de zero a resultados mensuráveis em semanas, não anos`;
  return `${name} entrega o que promete — com clareza, velocidade e resultados mensuráveis`;
}

function painPoint(pageType: PageType, prompt: string): string {
  const p = prompt.toLowerCase();
  if (/atendimento|suporte|chatbot|ia/.test(p))
    return "Equipas sobrecarregadas, clientes à espera horas e oportunidades perdidas a cada minuto";
  if (pageType === "local") return "Alternativas genéricas que não transmitem confiança nem criam ligação emocional";
  if (pageType === "saas") return "Ferramentas desconectadas, processos manuais e decisões às cegas";
  if (pageType === "infoproduct") return "Informação gratuita everywhere — zero clareza sobre o próximo passo";
  return "Soluções genéricas que não convertem e não transmitem credibilidade";
}

function sectionStack(pageType: PageType, planId: PlanId): string[] {
  const saas = [
    "navbar",
    "hero",
    "logos",
    "social-proof",
    "problem-solution",
    "bento",
    "features",
    "gallery",
    "testimonials",
    "pricing",
    "guarantee",
    "faq",
    "form",
    "cta",
    "footer",
  ];
  const local = [
    "navbar",
    "hero",
    "logos",
    "social-proof",
    "about",
    "problem-solution",
    "services",
    "bento",
    "gallery",
    "testimonials",
    "pricing",
    "faq",
    "form",
    "cta",
    "footer",
  ];
  const infoproduct = [
    "navbar",
    "hero",
    "logos",
    "social-proof",
    "problem-solution",
    "bento",
    "features",
    "testimonials",
    "pricing",
    "guarantee",
    "faq",
    "form",
    "cta",
    "footer",
  ];

  let stack: string[];
  if (pageType === "local") stack = local;
  else if (pageType === "infoproduct" || pageType === "funnel") stack = infoproduct;
  else stack = saas;

  const tier = getGenerationTier(planId);

  if (tier.fullQuality) return stack;

  if (planId === "starter") {
    return stack.filter((s) => !STARTER_SECTIONS_SKIP.includes(s as (typeof STARTER_SECTIONS_SKIP)[number]));
  }

  return stack.filter((s) => !PREMIUM_ONLY_SECTIONS.includes(s as (typeof PREMIUM_ONLY_SECTIONS)[number]));
}

function mergePalette(style: VisualStyle, prompt: string): VisualPalette {
  const base = { ...STYLE_PALETTES[style] };
  const parsed = extractColorsFromPrompt(prompt);
  if (parsed.primary) base.primary = parsed.primary;
  if (parsed.accent) base.accent = parsed.accent;
  if (parsed.background) base.background = parsed.background;
  if (parsed.mode === "light") base.mode = "light";
  return base;
}

export function analyzePrompt(prompt: string, planId: PlanId = "free"): VisualStrategy {
  const industry = detectIndustry(prompt);
  const pageType = detectPageType(prompt, industry);
  const emotion = detectEmotion(pageType, prompt);
  const visualStyle = detectVisualStyle(pageType, emotion, prompt);
  const palette = mergePalette(visualStyle, prompt);
  const brandName = extractBrandName(prompt, industry);

  const typography: VisualStrategy["typography"] =
    visualStyle === "luxury-serif" ? "serif-luxury" : visualStyle === "apple-clean" ? "sans-display" : "sans-modern";

  const taglines: Record<PrimaryEmotion, string> = {
    trust: "Construído para quem não aceita compromissos",
    innovation: "O futuro do seu negócio começa aqui",
    luxury: "Onde excelência deixa de ser opcional",
    speed: "Resultados antes do concorrente acordar",
    exclusivity: "Acesso reservado. Resultados reais.",
    warmth: "Feito para si, pensado em cada detalhe",
    authority: "Referência no mercado. Sem exceções.",
  };

  return {
    industry,
    industryLabel: INDUSTRY_LABELS[industry],
    pageType,
    audience: audienceFor(pageType, industry),
    valueProposition: valueProp(pageType, prompt, brandName),
    painPoint: painPoint(pageType, prompt),
    emotion,
    visualStyle,
    palette,
    typography,
    brandName,
    tagline: taglines[emotion],
    narrative: `Página ${pageType} para ${audienceFor(pageType, industry)} — estilo ${visualStyle}, emoção ${emotion}`,
    sections: sectionStack(pageType, planId),
    isPremium: getGenerationTier(planId).fullQuality,
  };
}
