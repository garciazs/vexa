"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CustomColors = {
  primary?: string;
  accent?: string;
  background?: string;
  text?: string;
};

export function PageImage({
  src,
  alt = "",
  fill,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt?: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={cn(fill && "absolute inset-0 h-full w-full object-cover", className)} />
    );
  }
  return <Image src={src} alt={alt} fill={fill} className={className} sizes={sizes ?? "100vw"} priority={priority} />;
}

export function AccentButton({
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
  return <Button {...props} className={className}>{children}</Button>;
}

type C = Record<string, string>;

export function NavbarBlock({
  c,
  accent,
  colors,
}: {
  c: C;
  accent?: string;
  colors?: CustomColors;
}) {
  const links = (c.links ?? "").split("|").filter(Boolean);
  const bg = colors?.background ?? c.backgroundColor ?? "#08090A";

  return (
    <nav
      className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-xl"
      style={{ backgroundColor: `${bg}cc` }}
    >
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <span className="text-lg font-bold tracking-tight" style={{ color: c.textColor ?? "#fff" }}>
          {c.brand}
        </span>
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a key={link} href="#" className="text-sm text-zinc-400 transition hover:text-white">
              {link.trim()}
            </a>
          ))}
        </div>
        <AccentButton size="sm" accent={accent} asChild>
          <a href="#vexa-form">{c.cta}</a>
        </AccentButton>
      </motion.div>
    </nav>
  );
}

export function PremiumHeroBlock({
  c,
  accent,
  colors,
  heroFallback,
}: {
  c: C;
  accent?: string;
  colors?: CustomColors;
  heroFallback: string;
}) {
  const bg = colors?.background ?? c.backgroundColor ?? "#08090A";

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-16 md:pt-24" style={{ backgroundColor: bg }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${accent ?? "#635BFF"}33, transparent 70%)`,
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          {c.badge && (
            <span
              className="mb-6 inline-flex rounded-full border px-4 py-1.5 text-xs font-semibold"
              style={{
                borderColor: `${accent ?? "#635BFF"}55`,
                backgroundColor: `${accent ?? "#635BFF"}18`,
                color: accent ?? "#a78bfa",
              }}
            >
              {c.badge}
            </span>
          )}
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">{c.headline}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400 md:text-xl">{c.subtitle}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <AccentButton size="xl" accent={accent} asChild>
              <a href="#vexa-form">
                {c.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </AccentButton>
            {c.ctaSecondary && (
              <Button size="xl" variant="outline" className="border-white/20 bg-white/5" asChild>
                <a href="#features">{c.ctaSecondary}</a>
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.12 }}
          className="relative"
        >
          <motion.div
            className="absolute -inset-3 rounded-3xl blur-2xl"
            style={{ background: `${accent ?? "#635BFF"}25` }}
          />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
            <div className="relative aspect-[4/3]">
              <PageImage src={c.imageUrl || heroFallback} alt="" fill className="object-cover" sizes="640px" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-white/90">Preview · tempo real</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function CenteredPremiumHeroBlock({
  c,
  accent,
  colors,
  heroFallback,
}: {
  c: C;
  accent?: string;
  colors?: CustomColors;
  heroFallback: string;
}) {
  const bg = colors?.background ?? c.backgroundColor ?? "#08090A";
  const isSerif = c.typography === "serif-luxury";

  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-20 text-center md:pt-28" style={{ backgroundColor: bg }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${accent ?? "#635BFF"}28, transparent 65%)`,
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto max-w-4xl"
      >
        {c.badge && (
          <span
            className="mb-6 inline-flex rounded-full border px-4 py-1.5 text-xs font-semibold"
            style={{
              borderColor: `${accent ?? "#635BFF"}55`,
              backgroundColor: `${accent ?? "#635BFF"}18`,
              color: accent ?? "#a78bfa",
            }}
          >
            {c.badge}
          </span>
        )}
        <h1
          className={cn(
            "text-4xl font-bold leading-[1.06] tracking-tight md:text-6xl lg:text-7xl",
            isSerif && "font-serif"
          )}
        >
          {c.headline}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">{c.subtitle}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <AccentButton size="xl" accent={accent} asChild>
            <a href="#vexa-form">{c.cta}</a>
          </AccentButton>
          {c.ctaSecondary && (
            <Button size="xl" variant="outline" className="border-white/20 bg-white/5" asChild>
              <a href="#features">{c.ctaSecondary}</a>
            </Button>
          )}
        </div>
      </motion.div>
      {c.imageUrl && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
        >
          <div className="relative aspect-[21/9]">
            <PageImage src={c.imageUrl || heroFallback} alt="" fill className="object-cover" sizes="1200px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        </motion.div>
      )}
    </section>
  );
}

export function MinimalPremiumHeroBlock({
  c,
  accent,
  colors,
}: {
  c: C;
  accent?: string;
  colors?: CustomColors;
}) {
  const bg = colors?.background ?? c.backgroundColor ?? "#FBFBFD";
  const text = colors?.text ?? c.textColor ?? "#1D1D1F";
  const isLight = (c.colorMode ?? "dark") === "light";

  return (
    <section
      className="px-6 pb-20 pt-24 md:pt-32"
      style={{ backgroundColor: bg, color: text }}
    >
      <div className="mx-auto max-w-3xl">
        {c.badge && (
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: accent }}>
            {c.badge}
          </p>
        )}
        <h1 className="text-4xl font-semibold leading-[1.12] tracking-tight md:text-5xl lg:text-6xl">
          {c.headline}
        </h1>
        <p className="mt-6 text-lg leading-relaxed opacity-80">{c.subtitle}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <AccentButton size="lg" accent={accent} asChild>
            <a href="#vexa-form">{c.cta}</a>
          </AccentButton>
          {c.ctaSecondary && (
            <Button
              size="lg"
              variant="outline"
              className={isLight ? "border-black/15" : "border-white/20"}
              asChild
            >
              <a href="#features">{c.ctaSecondary}</a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

export function LogosBlock({ c }: { c: C }) {
  const logos = [1, 2, 3, 4, 5].map((i) => c[`logo${i}`]).filter(Boolean);
  return (
    <section className="border-y border-white/[0.05] px-6 py-14">
      <div className="mx-auto max-w-6xl">
        <p className="mb-8 text-center text-xs font-medium uppercase tracking-[0.25em] text-zinc-500">{c.headline}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-4">
          {logos.map((logo, i) => (
            <span key={i} className="text-base font-semibold text-zinc-500 transition hover:text-zinc-300">
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProblemSolutionBlock({ c, accent }: { c: C; accent?: string }) {
  return (
    <section className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight md:text-5xl">{c.headline}</h2>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-zinc-400">{c.problem}</p>
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-8 md:p-10">
            <p className="mb-6 text-xs font-bold uppercase tracking-widest text-red-400">{c.beforeLabel}</p>
            {[1, 2, 3].map((i) =>
              c[`before${i}`] ? (
                <motion.div key={i} className="mb-4 flex gap-3">
                  <X className="h-5 w-5 shrink-0 text-red-400" />
                  <span className="text-zinc-400">{c[`before${i}`]}</span>
                </motion.div>
              ) : null
            )}
          </div>
          <div
            className="rounded-3xl border p-8 md:p-10"
            style={{ borderColor: `${accent ?? "#22c55e"}40`, backgroundColor: `${accent ?? "#22c55e"}0a` }}
          >
            <p className="mb-6 text-xs font-bold uppercase tracking-widest" style={{ color: accent ?? "#22c55e" }}>
              {c.afterLabel}
            </p>
            {[1, 2, 3].map((i) =>
              c[`after${i}`] ? (
                <motion.div key={i} className="mb-4 flex gap-3">
                  <Check className="h-5 w-5 shrink-0" style={{ color: accent ?? "#22c55e" }} />
                  <span className="font-medium">{c[`after${i}`]}</span>
                </motion.div>
              ) : null
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function BentoBlock({ c, accent, heroFallback }: { c: C; accent?: string; heroFallback: string }) {
  return (
    <section id="features" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{c.headline}</h2>
          {c.subtitle && <p className="mt-4 text-lg text-zinc-400">{c.subtitle}</p>}
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:col-span-2 lg:row-span-2">
            {c.cell1image && (
              <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl">
                <PageImage src={c.cell1image} alt="" fill className="object-cover" sizes="800px" />
              </div>
            )}
            <h3 className="text-xl font-bold">{c.cell1title}</h3>
            <p className="mt-2 text-zinc-400">{c.cell1desc}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <motion.div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl font-bold" style={{ backgroundColor: `${accent ?? "#635BFF"}22`, color: accent }}>
              2
            </motion.div>
            <h3 className="font-bold">{c.cell2title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{c.cell2desc}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <motion.div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl font-bold" style={{ backgroundColor: `${accent ?? "#635BFF"}22`, color: accent }}>
              3
            </motion.div>
            <h3 className="font-bold">{c.cell3title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{c.cell3desc}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:col-span-2">
            <h3 className="font-bold">{c.cell4title}</h3>
            <p className="mt-2 max-w-lg text-sm text-zinc-400">{c.cell4desc}</p>
            {c.cell4image && (
              <div className="relative mt-4 aspect-[3/1] overflow-hidden rounded-xl">
                <PageImage src={c.cell4image || heroFallback} alt="" fill className="object-cover" sizes="600px" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FooterBlock({ c, colors }: { c: C; colors?: CustomColors }) {
  const cols = [c.col1, c.col2, c.col3].map((col) => (col ?? "").split("|").filter(Boolean));
  const bg = colors?.background ?? c.backgroundColor ?? "#08090A";

  return (
    <footer className="border-t border-white/[0.06] px-6 py-16" style={{ backgroundColor: bg }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="text-lg font-bold">{c.brand}</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">{c.tagline}</p>
          </div>
          {cols.map((links, i) => (
            <ul key={i} className="space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-zinc-500 hover:text-white">
                    {link.trim()}
                  </a>
                </li>
              ))}
            </ul>
          ))}
        </div>
        <p className="mt-12 border-t border-white/[0.06] pt-8 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} {c.brand}
        </p>
      </div>
    </footer>
  );
}
