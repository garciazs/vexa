"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ImagePlus,
  Loader2,
  Pencil,
  RefreshCw,
  Send,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { PageRenderer } from "@/components/builder/page-renderer";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AI_PROMPT_EXAMPLES,
  PLAN_GENERATION_LIMITS,
  getGenerationTier,
  type AIGeneratedPage,
} from "@/lib/ai/page-generator";
import { FreeUpgradeWall } from "@/components/dashboard/free-upgrade-wall";
import { getEffectivePageCount } from "@/lib/billing/page-count";
import { getDeviceFingerprint } from "@/lib/security/device-fingerprint";
import { normalizePlanId } from "@/lib/templates/catalog";
import { useWorkspace } from "@/lib/store/workspace-provider";
import type { PlanId } from "@/lib/store/types";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type UploadedImage = { id: string; name: string; dataUrl: string };

const GENERATION_STEPS = [
  "A analisar nicho e público-alvo...",
  "A definir estratégia visual e emoção...",
  "A criar paleta e identidade...",
  "A escrever copy de conversão...",
  "A arquitetar secções premium...",
  "A polir UI estilo startup...",
];

export function AIBuilderView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);
  const submitLockRef = useRef(false);
  const saveLockRef = useRef(false);
  const { data, createLandingPageFromAI, canCreateLandingPage, canUseAIGeneration, pageLimitReason } =
    useWorkspace();
  const planId = normalizePlanId(data?.workspace.plan) as PlanId;
  const tier = getGenerationTier(planId);
  const limits = PLAN_GENERATION_LIMITS[planId];
  const pageCount = data?.landingPages.length ?? 0;
  const publishedTotal = Math.max(
    data?.workspace.landingPagesPublishedTotal ?? 0,
    data?.landingPages.filter((p) => p.status === "published").length ?? 0
  );
  const canCreateMorePages = canCreateLandingPage;
  const canUseAI = canUseAIGeneration;
  const effectivePageCount = data ? getEffectivePageCount(data) : pageCount;
  const existingDraft = data?.landingPages.find((p) => p.status === "draft");
  const existingPageId = existingDraft?.id ?? data?.landingPages[0]?.id;

  const [prompt, setPrompt] = useState("");
  const [uploads, setUploads] = useState<UploadedImage[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Descreva o seu negócio — nome, serviços, cores e estilo. Ex.: barbearia premium preto e dourado em Lisboa. Pode enviar fotos suas para usar no site.",
    },
  ]);
  const [generating, setGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<AIGeneratedPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialPrompt = searchParams.get("prompt");
    if (initialPrompt) setPrompt(initialPrompt);
  }, [searchParams]);

  const canUploadMore = uploads.length < limits.maxUserImages;

  const planHint = tier.hint;

  const pagesLabel =
    tier.maxPages === Infinity
      ? `${pageCount} páginas criadas`
      : `${pageCount}/${tier.maxPages} páginas`;

  const runGeneration = useCallback(
    async (text: string, images: string[]) => {
      if (submitLockRef.current || generating) return;
      submitLockRef.current = true;
      setError(null);
      setResult(null);
      setGenerating(true);
      setStepIndex(0);

      const stepTimer = setInterval(() => {
        setStepIndex((i) => Math.min(i + 1, GENERATION_STEPS.length - 1));
      }, 500);

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: images.length
            ? `${text}\n\n📷 ${images.length} foto(s) anexada(s)`
            : text,
        },
      ]);

      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: text,
            workspaceId: data?.workspace.id,
            pageCount: effectivePageCount,
            userImages: images,
            deviceFingerprint: getDeviceFingerprint(),
          }),
        });
        const dataRes = await res.json();
        if (!res.ok) throw new Error(dataRes.error ?? "Erro ao gerar");

        setResult(dataRes as AIGeneratedPage);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: dataRes.summary,
          },
        ]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro desconhecido";
        setError(msg);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: `Não consegui gerar: ${msg}` },
        ]);
      } finally {
        clearInterval(stepTimer);
        setGenerating(false);
        submitLockRef.current = false;
      }
    },
    [data?.workspace.id, effectivePageCount, generating]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canUseAI) {
      setError(pageLimitReason ?? "Limite do plano Free atingido. Assine o VEXA para continuar.");
      return;
    }
    const text = prompt.trim();
    if (!text || generating) return;
    setPrompt("");
    runGeneration(text, uploads.map((u) => u.dataUrl));
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const remaining = limits.maxUserImages - uploads.length;
    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        if (!file.type.startsWith("image/") || file.size > 3_000_000) return;
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== "string") return;
          setUploads((prev) => {
            if (prev.length >= limits.maxUserImages) return prev;
            return [
              ...prev,
              { id: crypto.randomUUID(), name: file.name, dataUrl: reader.result as string },
            ];
          });
        };
        reader.readAsDataURL(file);
      });
  }

  async function handleOpenInBuilder() {
    if (!result || saveLockRef.current) return;
    if (!canUseAI) {
      setError(pageLimitReason ?? "Limite de sites atingido.");
      return;
    }
    saveLockRef.current = true;
    const replacePageId =
      !canCreateMorePages && existingDraft ? existingDraft.id : undefined;
    try {
      const id = await createLandingPageFromAI({
        name: result.name,
        slug: result.slug,
        blocks: result.blocks,
        theme: result.theme,
        replacePageId,
      });
      if (!id) {
        setError(pageLimitReason ?? "Não foi possível guardar — limite do plano atingido.");
        return;
      }
      router.push(`/builder/${id}`);
    } finally {
      saveLockRef.current = false;
    }
  }

  if (!canUseAI) {
    return (
      <>
        <Header title="Criar site" description="Plano Free — 1 site com IA incluído" />
        <FreeUpgradeWall planId={planId} existingPageId={existingPageId} />
      </>
    );
  }

  return (
    <>
      <Header
        title="Criar site"
        description="Descreva o negócio — receba um site profissional pronto para vender"
      />
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <div className="flex w-full flex-col border-b border-border lg:w-[440px] lg:shrink-0 lg:border-b-0 lg:border-r">
          <motion.div className="border-b border-border px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green" />
                <span className="text-xs font-medium">Gerador de sites</span>
              </div>
              <Badge variant={tier.fullQuality ? "green" : "outline"} className="text-[10px]">
                {tier.label}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{pagesLabel}</span>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{planHint}</p>
          </motion.div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            <div className="space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "ml-6 bg-purple/15 text-foreground"
                      : "mr-2 bg-surface-elevated border border-border text-muted-foreground"
                  )}
                >
                  {m.content}
                </div>
              ))}

              <AnimatePresence>
                {generating && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mr-2 rounded-2xl border border-green/20 bg-green/5 p-4"
                  >
                    <div className="flex items-center gap-2 text-sm text-green">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {GENERATION_STEPS[stepIndex]}
                    </div>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                      <motion.div
                        className="h-full bg-green"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <motion.div className="border-t border-border p-4">
            <div className="mb-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">As suas fotos</p>
                <span className="text-[10px] text-muted-foreground">
                  {uploads.length}/{limits.maxUserImages}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uploads.map((img) => (
                  <div key={img.id} className="group relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.dataUrl} alt={img.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setUploads((p) => p.filter((u) => u.id !== img.id))}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
                {canUploadMore && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={generating}
                    className="flex h-16 w-16 flex-col items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground transition hover:border-purple/40 hover:text-foreground disabled:opacity-50"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="mt-0.5 text-[9px]">Foto</span>
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            <p className="mb-2 text-xs text-muted-foreground">Exemplos:</p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {AI_PROMPT_EXAMPLES.slice(0, 3).map((ex) => (
                <button
                  key={ex}
                  type="button"
                  disabled={generating}
                  onClick={() => setPrompt(ex)}
                  className="rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground transition hover:border-purple/40 hover:text-foreground disabled:opacity-50"
                >
                  {ex.slice(0, 40)}…
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Barbearia premium em Lisboa, cores preto e dourado, corte fade e barba, agendamento online..."
                rows={4}
                disabled={generating}
                className="flex-1 resize-none rounded-xl border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-purple/50 focus:outline-none focus:ring-1 focus:ring-purple/30 disabled:opacity-60"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button type="submit" size="icon" className="h-auto shrink-0" disabled={generating || !prompt.trim()}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            {error && <p className="mt-2 text-xs text-danger">{error}</p>}
          </motion.div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden bg-[#030304]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Preview do site</span>
              {result && (
                <>
                  <Badge variant="green" className="text-[10px]">
                    {result.niche}
                  </Badge>
                  {result.strategy && (
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {result.strategy.visualStyle.replace(/-/g, " ")}
                    </Badge>
                  )}
                  {result.customColors && (
                    <Badge variant="outline" className="text-[10px]">
                      Paleta custom
                    </Badge>
                  )}
                </>
              )}
            </div>
            {result && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={generating}
                  onClick={() => {
                    const lastUser = [...messages].reverse().find((m) => m.role === "user");
                    if (lastUser) {
                      const text = lastUser.content.replace(/\n\n📷.*/, "");
                      runGeneration(text, uploads.map((u) => u.dataUrl));
                    }
                  }}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerar
                </Button>
                <Button size="sm" variant="green" onClick={handleOpenInBuilder}>
                  <Pencil className="h-3.5 w-3.5" />
                  {existingDraft && !canCreateMorePages ? "Atualizar e publicar" : "Editar e publicar"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {result ? (
              <PageRenderer blocks={result.blocks} theme={result.theme} />
            ) : (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-8 text-center">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 ring-1 ring-white/10"
                >
                  <Upload className="h-9 w-9 text-zinc-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white">O seu site aparece aqui</h3>
                <p className="mt-2 max-w-md text-sm text-zinc-500">
                  Descreva o negócio, escolha cores no texto (ex: preto e dourado) e envie fotos reais.
                  O resultado parece feito à mão — sem marca d&apos;água no site publicado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
