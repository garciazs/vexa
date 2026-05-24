"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/constants";
import { fadeUp, staggerContainer } from "@/lib/motion";

const stats = [
  { label: "Receita este mês", value: "€24.850", change: "+18.4%", delay: 0 },
  { label: "Leads capturados", value: "1.284", change: "+12.1%", delay: 0.1 },
  { label: "Taxa de conversão", value: "4.8%", change: "+0.9%", delay: 0.2 },
];

export function Hero() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 20 });
  const sy = useSpring(my, { stiffness: 80, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-6, 6]);

  return (
    <section
      className="relative min-h-screen overflow-hidden pt-28 pb-24 lg:pt-36"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - rect.left) / rect.width - 0.5);
        my.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
    >
      <div className="absolute inset-0 bg-grid opacity-30" />
      <motion.div
        className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-purple/25 blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-green/15 blur-[100px]"
        animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-5xl text-center"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-8 inline-flex">
            <span className="group relative overflow-hidden rounded-full border border-green/30 bg-green/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-green-bright">
              <span className="absolute inset-0 animate-shimmer opacity-50" />
              <span className="relative flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
                </span>
                Máquina de vendas ativa
              </span>
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-[clamp(2.5rem,8vw,5.5rem)] font-black leading-[0.95] tracking-tighter"
          >
            <span className="block text-stroke">SUA OPERAÇÃO</span>
            <span className="mt-1 block animate-gradient-x bg-gradient-to-r from-white via-purple-bright to-green-bright bg-clip-text text-transparent">
              COMEÇA AQUI.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            {BRAND.tagline} {BRAND.description}
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button size="xl" variant="green" className="group relative overflow-hidden" asChild>
              <Link href="/cadastro">
                <span className="absolute inset-0 bg-gradient-to-r from-green-bright to-green opacity-0 transition group-hover:opacity-100" />
                <span className="relative flex items-center gap-2">
                  Ativar VEXA agora
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
            <Button size="xl" variant="glass" asChild>
              <Link href="/pricing">
                Ver planos
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs uppercase tracking-widest text-muted-foreground"
          >
            {["Setup 5 min", "Sem cartão", "14 dias grátis", "Cancela quando quiser"].map(
              (t) => (
                <span key={t} className="flex items-center gap-2">
                  <span className="h-px w-6 bg-gradient-to-r from-purple to-green" />
                  {t}
                </span>
              )
            )}
          </motion.div>
        </motion.div>

        <motion.div
          style={{ rotateX, rotateY, transformPerspective: 1200 }}
          className="mx-auto mt-20 max-w-5xl"
        >
          <div className="relative">
            <motion.div className="absolute -inset-1 rounded-3xl hero-glow-ring opacity-40 blur-sm" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface-elevated/90 shadow-[0_0_80px_rgba(168,85,247,0.2)] backdrop-blur-xl">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <div className="flex gap-1.5">
                  {["bg-red-500/80", "bg-yellow-500/80", "bg-green/80"].map((c) => (
                    <div key={c} className={`h-2.5 w-2.5 rounded-full ${c}`} />
                  ))}
                </div>
                <span className="mx-auto text-[10px] uppercase tracking-widest text-muted-foreground">
                  vexa.app/dashboard
                </span>
              </div>
              <motion.div className="grid gap-4 p-6 sm:grid-cols-3">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + stat.delay, duration: 0.6 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-background/60 p-5"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-3xl font-black tabular-nums">{stat.value}</p>
                    <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-green">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {stat.change}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div
                className="mx-6 mb-6 h-24 overflow-hidden rounded-xl border border-border bg-surface"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="flex h-full items-end gap-1 px-4 pb-3">
                  {[40, 55, 45, 70, 60, 85, 75, 95, 80, 100].map((h, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 rounded-t bg-gradient-to-t from-purple to-green-bright"
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 1.4 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
