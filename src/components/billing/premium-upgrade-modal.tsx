"use client";

import { Check, Crown, Sparkles, X, Zap } from "lucide-react";
import { StripeUpgradeButton } from "@/components/billing/stripe-upgrade-button";
import { PLANS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/store/types";

const PAID_PLANS = PLANS.filter((p) => p.id !== "free");

const PREMIUM_BENEFITS = [
  "Sites ilimitados com IA avançada",
  "Templates premium e layouts exclusivos",
  "Chatbots multicanal inteligentes",
  "Automações WhatsApp e Instagram",
  "Domínio personalizado",
  "CRM e analytics profissionais",
];

type PremiumUpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  workspaceId: string;
  email: string;
  title?: string;
  description?: string;
  existingPageId?: string;
};

export function PremiumUpgradeModal({
  open,
  onClose,
  workspaceId,
  email,
  title = "Torne-se Premium",
  description = "Crie websites ilimitados, acesse IA avançada, templates premium e recursos profissionais.",
  existingPageId,
}: PremiumUpgradeModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="premium-upgrade-title"
    >
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-purple/30 bg-gradient-to-b from-purple/20 via-surface to-background shadow-2xl shadow-purple/20">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-muted-foreground transition hover:bg-surface-hover hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[90vh] overflow-y-auto p-6 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple to-green">
              <Crown className="h-7 w-7 text-white" />
            </div>
            <h2 id="premium-upgrade-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>

          <ul className="mb-8 grid gap-2 sm:grid-cols-2">
            {PREMIUM_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green/20">
                  <Check className="h-3 w-3 text-green" />
                </span>
                {benefit}
              </li>
            ))}
          </ul>

          <div className="grid gap-4 sm:grid-cols-3">
            {PAID_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-2xl border p-5 transition",
                  plan.popular
                    ? "border-green/40 bg-green/5 ring-1 ring-green/30"
                    : "border-border bg-surface/50 hover:border-purple/30"
                )}
              >
                {plan.popular && (
                  <Badge variant="green" className="mb-3 w-fit text-[10px]">
                    Mais popular
                  </Badge>
                )}
                <p className="font-semibold">{plan.name}</p>
                <p className="mt-1 text-2xl font-bold">
                  €{plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/mês</span>
                </p>
                <p className="mt-2 min-h-[2.5rem] text-xs text-muted-foreground">{plan.description}</p>
                <ul className="mt-4 flex-1 space-y-1.5 text-xs text-muted-foreground">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className="flex gap-1.5">
                      <Zap className="mt-0.5 h-3 w-3 shrink-0 text-purple-bright" />
                      {f}
                    </li>
                  ))}
                </ul>
                <StripeUpgradeButton
                  planId={plan.id as PlanId}
                  workspaceId={workspaceId}
                  email={email}
                  label={`Assinar ${plan.name}`}
                  variant={plan.popular ? "green" : "outline"}
                  className="mt-4 w-full"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {existingPageId && (
              <Button variant="outline" asChild onClick={onClose}>
                <a href={`/builder/${existingPageId}`}>
                  <Sparkles className="h-4 w-4" />
                  Editar o meu site
                </a>
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              Continuar no plano Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
