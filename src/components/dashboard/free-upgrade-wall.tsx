"use client";

import Link from "next/link";
import { Check, Crown, Lock, Sparkles, Wand2 } from "lucide-react";
import { useUpgradeModal } from "@/components/billing/upgrade-modal-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/store/types";

const UPGRADE_PERKS = [
  "Sites ilimitados com IA premium",
  "Chatbots multicanal",
  "Automações WhatsApp e Instagram",
  "CRM e analytics avançados",
];

type FreeUpgradeWallProps = {
  planId?: PlanId;
  existingPageId?: string;
  className?: string;
  compact?: boolean;
};

export function FreeUpgradeWall({
  planId = "free",
  existingPageId,
  className,
  compact = false,
}: FreeUpgradeWallProps) {
  const { openUpgradeModal } = useUpgradeModal();

  if (compact) {
    return (
      <Card className={cn("glass border-purple/40 bg-gradient-to-br from-purple/15 via-background to-green/10", className)}>
        <CardContent className="p-5 text-center">
          <Lock className="mx-auto mb-2 h-8 w-8 text-purple-bright" />
          <p className="font-semibold">Limite do plano Free atingido</p>
          <p className="mt-1 text-sm text-muted-foreground">
            1 site criado. Assine o VEXA para continuar com IA.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {existingPageId && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/builder/${existingPageId}`}>Editar site</Link>
              </Button>
            )}
            <Button
              variant="green"
              size="sm"
              onClick={() =>
                openUpgradeModal({
                  existingPageId,
                  description:
                    "Torne-se Premium para criar websites ilimitados, IA avançada e recursos profissionais.",
                })
              }
            >
              <Crown className="h-4 w-4" />
              Assinar VEXA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-[420px] flex-col items-center justify-center px-6 py-10 text-center",
        className
      )}
    >
      <div className="w-full max-w-lg rounded-3xl border border-purple/30 bg-gradient-to-b from-purple/20 via-surface to-green/10 p-8 shadow-xl shadow-purple/10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple to-green">
          <Wand2 className="h-8 w-8 text-white" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight">
          {planId === "free" ? "Seu site grátis já foi criado" : "Limite do plano atingido"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          O plano Free inclui <strong className="text-foreground">1 site com IA</strong>. Para gerar mais
          sites, desbloqueie chatbots, automações e CRM — assine o VEXA.
        </p>

        <ul className="mt-6 space-y-2.5 text-left text-sm">
          {UPGRADE_PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2.5 text-muted-foreground">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green/20">
                <Check className="h-3 w-3 text-green" />
              </span>
              {perk}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="green"
            size="lg"
            className="gap-2 shadow-lg shadow-green/20"
            onClick={() =>
              openUpgradeModal({
                existingPageId,
                description:
                  "Torne-se Premium para criar websites ilimitados, acessar IA avançada, templates premium e recursos profissionais.",
              })
            }
          >
            <Crown className="h-5 w-5" />
            Assinar VEXA — a partir de €29/mês
          </Button>
          {existingPageId && (
            <Button variant="outline" size="lg" asChild>
              <Link href={`/builder/${existingPageId}`}>
                <Sparkles className="h-4 w-4" />
                Editar o meu site
              </Link>
            </Button>
          )}
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Starter €29 · Growth €79 · Scale €199 — cancele quando quiser
        </p>
      </div>
    </div>
  );
}
