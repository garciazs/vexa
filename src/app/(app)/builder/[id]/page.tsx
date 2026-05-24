"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CreditCard,
  Eye,
  FormInput,
  GripVertical,
  HelpCircle,
  MousePointerClick,
  Play,
  Quote,
  Save,
  Shield,
  Sparkles,
  Timer,
  Trash2,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PageRenderer } from "@/components/builder/page-renderer";
import { PublishModal } from "@/components/builder/publish-modal";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BLOCK_CATALOG, createBlock } from "@/lib/builder/block-catalog";
import { getTemplate } from "@/lib/templates/catalog";
import { useWorkspace } from "@/lib/store/workspace-provider";
import type { PageBlock } from "@/lib/store/types";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  MousePointerClick,
  Users,
  Quote,
  HelpCircle,
  Timer,
  CreditCard,
  FormInput,
  Play,
  Shield,
};

export default function BuilderEditorPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, getLandingPage, updateLandingPage, publishLandingPage, linkDomainToPage } =
    useWorkspace();
  const page = getLandingPage(id);

  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [publishModal, setPublishModal] = useState<{ publicUrl: string } | null>(null);

  useEffect(() => {
    if (page) {
      setBlocks(page.blocks.map((b) => ({ ...b, content: { ...b.content } })));
      setSelectedId(page.blocks[0]?.id ?? null);
    }
  }, [page?.id]);

  if (!page) {
    return (
      <>
        <Header title="Página não encontrada" />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
          <p className="text-muted-foreground">Esta landing page não existe ou foi removida.</p>
          <Button asChild>
            <Link href="/builder">← Voltar ao builder</Link>
          </Button>
        </div>
      </>
    );
  }

  const currentPage = page;
  const selected = blocks.find((b) => b.id === selectedId);
  const previewTheme =
    currentPage.theme ??
    (currentPage.templateId ? getTemplate(currentPage.templateId)?.theme : undefined) ??
    "midnight";

  function addBlock(type: string, label: string) {
    const newBlock = createBlock(type, label);
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedId(newBlock.id);
    setSaved(false);
  }

  function removeBlock(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (selectedId === blockId) setSelectedId(null);
    setSaved(false);
  }

  function updateBlockContent(blockId: string, key: string, value: string) {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId ? { ...b, content: { ...b.content, [key]: value } } : b
      )
    );
    setSaved(false);
  }

  function handleSave() {
    updateLandingPage(id, { blocks });
    setSaved(true);
  }

  async function handlePublish() {
    updateLandingPage(id, { blocks });
    const result = await publishLandingPage(id);
    setSaved(true);
    if (result?.publicUrl) {
      setPublishModal(result);
    }
  }

  function handlePreview() {
    const url =
      currentPage.status === "published"
        ? `/p/${currentPage.slug}`
        : `/p/${currentPage.slug}?preview=1`;
    window.open(url, "_blank");
  }

  return (
    <>
      {publishModal && (
        <PublishModal
          page={{ ...currentPage, blocks, status: "published" }}
          domains={data?.domains ?? []}
          publicUrl={publishModal.publicUrl}
          onClose={() => setPublishModal(null)}
          onLinkDomain={(domainId) => linkDomainToPage(domainId, id)}
        />
      )}
      <Header title={currentPage.name} description={`Editor visual • /${currentPage.slug}`} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 shrink-0 overflow-y-auto border-r border-border bg-surface p-4 scrollbar-thin">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Blocos
          </p>
          <div className="space-y-2">
            {BLOCK_CATALOG.map((block) => {
              const Icon = iconMap[block.icon] ?? Sparkles;
              return (
                <button
                  key={block.type}
                  type="button"
                  onClick={() => addBlock(block.type, block.label)}
                  className="flex w-full items-center gap-2 rounded-lg border border-border p-2.5 text-left text-sm transition hover:border-purple/30 hover:bg-surface-hover"
                >
                  <Icon className="h-4 w-4 text-purple-bright" />
                  {block.label}
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/builder">← Voltar</Link>
              </Button>
              <Badge variant={currentPage.status === "published" ? "green" : "secondary"}>
                {currentPage.status === "published" ? "Publicada" : "Rascunho"}
              </Badge>
              {saved && (
                <span className="text-xs text-green">Guardado</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant={showLivePreview ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLivePreview((v) => !v)}
              >
                <Eye className="h-4 w-4" />
                {showLivePreview ? "Ocultar preview" : "Preview ao vivo"}
              </Button>
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-4 w-4" />
                Abrir página
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
                Guardar
              </Button>
              <Button size="sm" onClick={handlePublish}>
                <Upload className="h-4 w-4" />
                Publicar
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto bg-background p-6 scrollbar-thin">
              <div className="mx-auto max-w-3xl space-y-4">
                {blocks.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
                    Adicione blocos da barra lateral para começar
                  </div>
                ) : (
                  blocks.map((block) => (
                    <div
                      key={block.id}
                      onClick={() => setSelectedId(block.id)}
                      className={cn(
                        "group relative cursor-pointer rounded-xl border bg-surface-elevated p-6 transition",
                        selectedId === block.id
                          ? "border-purple/50 ring-2 ring-purple/20"
                          : "border-border hover:border-purple/30"
                      )}
                    >
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 transition group-hover:opacity-100">
                        <GripVertical className="h-4 w-4 text-muted" />
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="secondary" className="mb-2">
                            {block.type}
                          </Badge>
                          <h3 className="text-lg font-semibold">
                            {block.content.headline || block.content.title || block.label}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {block.content.subtitle || block.content.text || "Clique para editar"}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBlock(block.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {showLivePreview && (
              <aside className="hidden w-[min(480px,42%)] shrink-0 overflow-y-auto border-l border-border bg-[#030304] xl:block scrollbar-thin">
                <div className="sticky top-0 z-10 border-b border-white/10 bg-black/80 px-3 py-2 text-xs text-zinc-400 backdrop-blur">
                  Preview ao vivo
                </div>
                <PageRenderer blocks={blocks} theme={previewTheme} />
              </aside>
            )}

            {selected && (
              <aside className="w-72 shrink-0 overflow-y-auto border-l border-border bg-surface p-4 scrollbar-thin">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Propriedades
                </p>
                <p className="mb-4 text-sm font-medium">{selected.label}</p>
                <div className="space-y-3">
                  {Object.entries(selected.content).map(([key, val]) => (
                    <div key={key}>
                      <label className="mb-1 block text-xs text-muted-foreground capitalize">
                        {key}
                      </label>
                      <Input
                        value={val}
                        onChange={(e) => updateBlockContent(selected.id, key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
