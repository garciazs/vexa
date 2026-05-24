"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Play, Shield, Star } from "lucide-react";
import {
  BentoBlock,
  FooterBlock,
  LogosBlock,
  NavbarBlock,
  PremiumHeroBlock,
  CenteredPremiumHeroBlock,
  MinimalPremiumHeroBlock,
  ProblemSolutionBlock,
} from "@/components/builder/premium-blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PageBlock } from "@/lib/store/types";
import type { TemplateTheme } from "@/lib/templates/catalog";
import { cn } from "@/lib/utils";

const IMG = {
  hero: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1920&q=80",
  form: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&q=80",
  video: "https://images.unsplash.com/photo-1611162616305-c69b3fa7a132?w=1200&q=80",
  avatar1: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80",
  avatar2: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80",
};

type ThemeStyle = {
  page: string;
  muted: string;
  accent: string;
  card: string;
  input: string;
};

const themes: Record<TemplateTheme, ThemeStyle> = {
  midnight: {
    page: "bg-[#030304] text-white",
    muted: "text-zinc-400",
    accent: "text-green-bright",
    card: "bg-white/[0.04] border-white/10 backdrop-blur-md",
    input: "bg-black/40 border-white/15 text-white placeholder:text-zinc-500",
  },
  clean: {
    page: "bg-zinc-50 text-zinc-900",
    muted: "text-zinc-600",
    accent: "text-purple-700",
    card: "bg-white border-zinc-200 shadow-lg",
    input: "bg-white border-zinc-300",
  },
  launch: {
    page: "bg-[#08080a] text-white",
    muted: "text-zinc-400",
    accent: "text-amber-400",
    card: "bg-amber-500/5 border-amber-500/20",
    input: "bg-black/50 border-amber-500/30 text-white",
  },
  saas: {
    page: "bg-[#050810] text-white",
    muted: "text-zinc-400",
    accent: "text-cyan-400",
    card: "bg-cyan-500/5 border-cyan-500/20",
    input: "bg-black/50 border-cyan-500/20 text-white",
  },
};

const animVariants = {
  "fade-up": { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } },
  "fade-in": { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  "slide-left": { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } },
  "slide-right": { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } },
  blur: { hidden: { opacity: 0, filter: "blur(8px)" }, visible: { opacity: 1, filter: "blur(0px)" } },
} as const;

function AnimatedSection({
  animation,
  children,
  className,
}: {
  animation?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  if (!animation || animation === "none") {
    return <section className={className}>{children}</section>;
  }

  const variant = animVariants[animation as keyof typeof animVariants] ?? animVariants["fade-up"];

  return (
    <motion.section
      ref={ref}
      initial={variant.hidden}
      animate={inView ? variant.visible : variant.hidden}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function PageImage({
  src,
  alt = "",
  fill,
  className,
  sizes,
  priority,
  width,
  height,
}: {
  src: string;
  alt?: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}) {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={cn("absolute inset-0 h-full w-full object-cover", className)} />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} width={width} height={height} className={className} />
    );
  }
  if (fill) {
    return <Image src={src} alt={alt} fill className={className} sizes={sizes ?? "100vw"} priority={priority} />;
  }
  return <Image src={src} alt={alt} width={width ?? 48} height={height ?? 48} className={className} />;
}

type CustomColors = { primary?: string; accent?: string; background?: string };

function resolveSiteMeta(blocks: PageBlock[]) {
  const meta = blocks.find((b) => b.type === "navbar" || b.type === "hero")?.content ?? {};
  return {
    hideBranding: meta.hideBranding === "true",
    colors: {
      primary: meta.primaryColor,
      accent: meta.accentColor,
      background: meta.backgroundColor,
      text: meta.textColor,
    } as CustomColors,
  };
}

function AccentButton({
  children,
  className,
  accent,
  ...props
}: React.ComponentProps<typeof Button> & { accent?: string }) {
  if (accent) {
    return (
      <Button
        {...props}
        className={cn("border-0 text-white shadow-lg hover:opacity-90", className)}
        style={{ backgroundColor: accent, boxShadow: `0 0 40px ${accent}55` }}
      >
        {children}
      </Button>
    );
  }
  return (
    <Button {...props} className={className}>
      {children}
    </Button>
  );
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=0`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

export function PageRenderer({
  blocks,
  theme = "midnight",
  onFormSubmit,
}: {
  blocks: PageBlock[];
  theme?: TemplateTheme;
  onFormSubmit?: (name: string, email: string) => void;
}) {
  const t = themes[theme];
  const { hideBranding, colors } = resolveSiteMeta(blocks);
  const pageStyle = colors.background ? { backgroundColor: colors.background } : undefined;

  return (
    <div className={cn("min-h-screen w-full", !colors.background && t.page)} style={pageStyle}>
      {blocks.map((b) => (
        <Block key={b.id} block={b} t={t} colors={colors} onFormSubmit={onFormSubmit} />
      ))}
      {!hideBranding && (
        <footer className="border-t border-white/10 py-8 text-center text-sm text-zinc-500">
          Powered by <span className="font-semibold text-purple-bright">VEXA</span>
        </footer>
      )}
    </div>
  );
}

function Block({
  block,
  t,
  colors,
  onFormSubmit,
}: {
  block: PageBlock;
  t: ThemeStyle;
  colors?: CustomColors;
  onFormSubmit?: (n: string, e: string) => void;
}) {
  const c = block.content;
  const anim = c.animation;
  const accent = colors?.accent;

  if (block.type === "navbar") {
    return <NavbarBlock c={c} accent={accent} colors={colors} />;
  }

  if (block.type === "hero" && c.layout === "minimal") {
    return <MinimalPremiumHeroBlock c={c} accent={accent} colors={colors} />;
  }

  if (block.type === "hero" && c.layout === "centered") {
    return (
      <CenteredPremiumHeroBlock c={c} accent={accent} colors={colors} heroFallback={IMG.hero} />
    );
  }

  if (block.type === "hero" && c.layout === "premium-split") {
    return <PremiumHeroBlock c={c} accent={accent} colors={colors} heroFallback={IMG.hero} />;
  }

  if (block.type === "logos") {
    return <LogosBlock c={c} />;
  }

  if (block.type === "problem-solution") {
    return <ProblemSolutionBlock c={c} accent={accent} />;
  }

  if (block.type === "bento") {
    return <BentoBlock c={c} accent={accent} heroFallback={IMG.hero} />;
  }

  if (block.type === "footer") {
    return <FooterBlock c={c} colors={colors} />;
  }

  if (block.type === "hero") {
    const align = c.align === "left" ? "items-start text-left" : "items-center text-center";
    return (
      <section className="relative min-h-[95vh] overflow-hidden">
        <PageImage src={c.imageUrl || IMG.hero} alt="" fill className="object-cover scale-105" priority sizes="100vw" />
        <motion.div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/65 to-black/90" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.35),transparent_55%)]"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className={cn("relative z-10 mx-auto flex min-h-[95vh] max-w-6xl flex-col justify-center px-6 py-24", align)}>
          {c.badge && (
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-full border border-green/40 bg-green/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-green-bright"
            >
              {c.badge}
            </motion.span>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl text-4xl font-black leading-[1.05] md:text-6xl lg:text-7xl"
          >
            {c.headline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn("mt-8 max-w-2xl text-lg md:text-xl", t.muted)}
          >
            {c.subtitle}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <AccentButton size="xl" variant="green" accent={accent} className="mt-12" asChild={!!c.ctaLink}>
              {c.ctaLink ? (
                <a href={c.ctaLink}>{c.cta}</a>
              ) : (
                <a href="#vexa-form">{c.cta}</a>
              )}
            </AccentButton>
          </motion.div>
        </div>
      </section>
    );
  }

  if (block.type === "about") {
    return (
      <AnimatedSection animation={anim} className="px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <motion.div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
            <PageImage src={c.imageUrl || IMG.hero} alt="" fill className="object-cover" sizes="600px" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">{c.headline}</h2>
            <p className={cn("mt-6 text-lg leading-relaxed", t.muted)}>{c.text}</p>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (block.type === "services") {
    return (
      <AnimatedSection animation={anim} className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold">{c.headline}</h2>
          {c.subtitle && <p className={cn("mt-3 text-center", t.muted)}>{c.subtitle}</p>}
          <motion.div className="mt-12 divide-y divide-white/10 overflow-hidden rounded-3xl border border-white/10">
            {[1, 2, 3].map((i) =>
              c[`service${i}title`] ? (
                <motion.div
                  key={i}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  className="flex items-center justify-between gap-4 px-6 py-5"
                >
                  <div>
                    <p className="font-semibold">{c[`service${i}title`]}</p>
                    <p className={cn("text-sm", t.muted)}>{c[`service${i}desc`]}</p>
                  </div>
                  <p className="text-xl font-black" style={accent ? { color: accent } : undefined}>
                    {c[`service${i}price`]}
                  </p>
                </motion.div>
              ) : null
            )}
          </motion.div>
        </div>
      </AnimatedSection>
    );
  }

  if (block.type === "features") {
    return (
      <AnimatedSection animation={anim} className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold md:text-4xl">{c.headline}</h2>
          {c.subtitle && <p className={cn("mx-auto mt-4 max-w-2xl text-center text-lg", t.muted)}>{c.subtitle}</p>}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) =>
              c[`feature${i}title`] ? (
                <motion.div
                  key={i}
                  whileHover={{ y: -6 }}
                  className={cn("overflow-hidden rounded-3xl border", t.card)}
                >
                  {c[`feature${i}image`] && (
                    <div className="relative h-44 w-full">
                      <PageImage src={c[`feature${i}image`]} alt="" fill className="object-cover" sizes="400px" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold">{c[`feature${i}title`]}</h3>
                    <p className={cn("mt-2 text-sm leading-relaxed", t.muted)}>{c[`feature${i}desc`]}</p>
                  </div>
                </motion.div>
              ) : null
            )}
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (block.type === "gallery") {
    const images = [1, 2, 3, 4].map((i) => c[`image${i}`]).filter(Boolean);
    return (
      <AnimatedSection animation={anim} className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold">{c.headline}</h2>
          {c.subtitle && <p className={cn("mt-4 text-center", t.muted)}>{c.subtitle}</p>}
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {images.map((src, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
              >
                <PageImage src={src} alt="" fill className="object-cover" sizes="600px" />
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (block.type === "social-proof") {
    return (
      <AnimatedSection animation={anim} className="border-y border-white/5 bg-black/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">{c.headline}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                className={cn("rounded-2xl border p-8 text-center", t.card)}
              >
                <p className={cn("text-4xl font-black", t.accent)}>{c[`stat${i}`]}</p>
                <p className={cn("mt-2 text-sm uppercase tracking-wider", t.muted)}>{c[`stat${i}label`]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (block.type === "testimonials") {
    return (
      <AnimatedSection animation={anim} className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">{c.headline}</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2, 3].map((i) =>
              c[`quote${i}`] ? (
                <div key={i} className={cn("rounded-3xl border p-8", t.card)}>
                  <div className="mb-4 flex gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-green text-green" />
                    ))}
                  </div>
                  <p className="text-lg leading-relaxed">&ldquo;{c[`quote${i}`]}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-purple/40">
                      <PageImage
                        src={c[`avatar${i}`] || (i === 1 ? IMG.avatar1 : IMG.avatar2)}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{c[`author${i}`]}</p>
                      <p className={cn("text-sm", t.muted)}>{c[`role${i}`]}</p>
                    </div>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </div>
      </AnimatedSection>
    );
  }

  if (block.type === "pricing") {
    return (
      <AnimatedSection animation={anim} className="px-6 py-24">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mx-auto max-w-md rounded-3xl border border-purple/30 bg-gradient-to-b from-purple/15 to-transparent p-10 text-center shadow-[0_0_60px_rgba(168,85,247,0.15)]"
        >
          <h2 className="text-2xl font-bold">{c.headline}</h2>
          <p className={cn("mt-8 text-6xl font-black", t.accent)}>{c.price}</p>
          {c.period && <p className={cn("mt-2", t.muted)}>{c.period}</p>}
          <ul className="mt-8 space-y-3 text-left text-sm">
            {[1, 2, 3, 4].map((i) =>
              c[`feature${i}`] ? (
                <li key={i} className="flex items-center gap-2">
                  <Check className="h-4 w-4 shrink-0 text-green" />
                  {c[`feature${i}`]}
                </li>
              ) : null
            )}
          </ul>
          <Button className="mt-8 w-full" variant="green" size="lg">
            {c.button}
          </Button>
        </motion.div>
      </AnimatedSection>
    );
  }

  if (block.type === "faq") {
    return (
      <AnimatedSection animation={anim} className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold">{c.headline}</h2>
          {[1, 2, 3, 4, 5].map((i) =>
            c[`q${i}`] ? <Faq key={i} q={c[`q${i}`]} a={c[`a${i}`]} card={t.card} muted={t.muted} /> : null
          )}
        </div>
      </AnimatedSection>
    );
  }

  if (block.type === "form") {
    return <FormSection c={c} t={t} colors={colors} onFormSubmit={onFormSubmit} anim={anim} />;
  }

  if (block.type === "cta") {
    return (
      <AnimatedSection animation={anim} className="relative overflow-hidden px-6 py-24">
        <PageImage src={c.imageUrl || IMG.form} alt="" fill className="object-cover opacity-25" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple/60 to-green/40" />
        <div className="relative mx-auto max-w-3xl rounded-3xl border border-white/20 bg-black/60 p-12 text-center backdrop-blur-xl">
          <h2 className="text-3xl font-bold">{c.headline}</h2>
          {c.subtitle && <p className={cn("mt-4 text-lg", t.muted)}>{c.subtitle}</p>}
          <AccentButton className="mt-8" variant="green" size="xl" accent={accent} asChild>
            <a href={c.buttonLink || "#vexa-form"}>{c.button}</a>
          </AccentButton>
        </div>
      </AnimatedSection>
    );
  }

  if (block.type === "video") {
    return <VideoSection c={c} t={t} anim={anim} />;
  }

  if (block.type === "countdown") {
    return <CountdownSection c={c} t={t} anim={anim} />;
  }

  if (block.type === "guarantee") {
    return (
      <AnimatedSection animation={anim} className="px-6 py-20">
        <div className={cn("mx-auto flex max-w-2xl flex-col items-center rounded-3xl border p-10 text-center md:flex-row md:text-left", t.card)}>
          <div className="mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-green/20 md:mb-0 md:mr-8">
            {c.imageUrl ? (
              <Image src={c.imageUrl} alt="" width={48} height={48} className="rounded-full object-cover" />
            ) : (
              <Shield className="h-10 w-10 text-green" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{c.headline}</h2>
            <p className={cn("mt-3 leading-relaxed", t.muted)}>{c.text}</p>
          </div>
        </div>
      </AnimatedSection>
    );
  }

  return (
    <AnimatedSection animation={anim} className={cn("mx-6 my-8 rounded-2xl border p-10", t.card)}>
      <h2 className="text-xl font-bold">{c.headline || block.label}</h2>
      <p className={cn("mt-2", t.muted)}>{c.subtitle || c.text}</p>
    </AnimatedSection>
  );
}

function Faq({ q, a, card, muted }: { q: string; a: string; card: string; muted: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn("mb-3 w-full rounded-xl border p-5 text-left transition", card)}
    >
      <div className="flex justify-between gap-4">
        <span className="font-semibold">{q}</span>
        <span className={muted}>{open ? "−" : "+"}</span>
      </div>
      {open && <p className={cn("mt-3 text-sm leading-relaxed", muted)}>{a}</p>}
    </button>
  );
}

function FormSection({
  c,
  t,
  colors,
  onFormSubmit,
  anim,
}: {
  c: Record<string, string>;
  t: ThemeStyle;
  colors?: CustomColors;
  onFormSubmit?: (n: string, e: string) => void;
  anim?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  return (
    <AnimatedSection animation={anim} className="relative overflow-hidden px-6 py-24" >
      <div id="vexa-form" className="absolute -top-20" />
      <PageImage src={c.imageUrl || IMG.form} alt="" fill className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-black/85" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">{c.headline}</h2>
          {c.subtitle && <p className={cn("mt-4 text-lg", t.muted)}>{c.subtitle}</p>}
        </div>
        <div className={cn("rounded-3xl border p-8 shadow-2xl", t.card)}>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onFormSubmit?.(name, email);
              setName("");
              setEmail("");
            }}
          >
            <Input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required className={t.input} />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className={t.input} />
            <AccentButton type="submit" variant="green" accent={colors?.accent} className="w-full" size="lg">
              {c.button || "Enviar"}
            </AccentButton>
          </form>
        </div>
      </div>
    </AnimatedSection>
  );
}

function VideoSection({ c, t, anim }: { c: Record<string, string>; t: ThemeStyle; anim?: string }) {
  const [playing, setPlaying] = useState(false);
  const embed = getEmbedUrl(c.url);

  return (
    <AnimatedSection animation={anim} className="px-6 py-24">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="mb-4 text-3xl font-bold">{c.headline}</h2>
        {c.description && <p className={cn("mb-8", t.muted)}>{c.description}</p>}
        <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
          {playing && embed ? (
            <iframe src={embed} title="Vídeo" className="h-full w-full" allowFullScreen />
          ) : (
            <>
              <Image src={c.thumbnail || IMG.video} alt="" fill className="object-cover" sizes="100vw" />
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 transition hover:bg-black/30"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-green shadow-lg"
                >
                  <Play className="h-8 w-8 fill-black text-black" />
                </motion.div>
              </button>
            </>
          )}
        </div>
      </div>
    </AnimatedSection>
  );
}

function CountdownSection({ c, t, anim }: { c: Record<string, string>; t: ThemeStyle; anim?: string }) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date(c.date || Date.now()).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [c.date]);

  const units = [
    { v: left.d, l: "Dias" },
    { v: left.h, l: "Horas" },
    { v: left.m, l: "Min" },
    { v: left.s, l: "Seg" },
  ];

  return (
    <AnimatedSection animation={anim} className="px-6 py-24">
      <div className={cn("mx-auto max-w-3xl rounded-3xl border p-10 text-center", t.card)}>
        <h2 className="text-3xl font-bold">{c.headline}</h2>
        {c.subtitle && <p className={cn("mt-3", t.muted)}>{c.subtitle}</p>}
        <div className="mt-10 grid grid-cols-4 gap-4">
          {units.map((u) => (
            <div key={u.l} className="rounded-2xl bg-black/30 p-4">
              <p className={cn("text-3xl font-black md:text-4xl", t.accent)}>{String(u.v).padStart(2, "0")}</p>
              <p className={cn("mt-1 text-xs uppercase", t.muted)}>{u.l}</p>
            </div>
          ))}
        </div>
        {c.button && (
          <Button className="mt-8" variant="green" size="lg" asChild>
            <a href={c.buttonLink || "#vexa-form"}>{c.button}</a>
          </Button>
        )}
      </div>
    </AnimatedSection>
  );
}
