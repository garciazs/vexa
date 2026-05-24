"use client";

import { Check, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StripeUpgradeButton } from "@/components/billing/stripe-upgrade-button";
import { PLANS } from "@/lib/constants";
import { GENERATION_TIERS } from "@/lib/ai/generation-tiers";
import { PLAN_LIMITS } from "@/lib/templates/catalog";
import { useWorkspace } from "@/lib/store/workspace-provider";
import type { PlanId } from "@/lib/store/types";
import { cn } from "@/lib/utils";

const PLAN_ORDER: PlanId[] = ["free", "starter", "growth", "scale"];

export function PlanLimitsCard({ currentPlanId }: { currentPlanId: PlanId }) {
  const { data } = useWorkspace();
  const workspaceId = data?.workspace.id ?? "";
  const email = data?.user.email ?? "";

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base">Limites por plano</CardTitle>
        <p className="text-sm text-muted-foreground">
          Transparência total — IA, páginas e domínios
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS.find((p) => p.id === id)!;
          const gen = GENERATION_TIERS[id];
          const pages = PLAN_LIMITS[id];
          const isCurrent = id === currentPlanId;
          const pagesLabel =
            pages.maxPages === Infinity ? "Ilimitadas" : String(pages.maxPages);

          return (
            <div
              key={id}
              className={cn(
                "rounded-xl border p-4 transition",
                isCurrent ? "border-purple/40 bg-purple/5" : "border-border"
              )}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold">{plan.name}</span>
                {isCurrent ? (
                  <Badge variant="green">Actual</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">€{plan.price}/mês</span>
                )}
              </div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green" />
                  {pagesLabel} landing pages
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-green" />
                  IA: {gen.maxBlocks} secções · {gen.maxUserImages} fotos
                  {gen.fullQuality && " · qualidade 100%"}
                </li>
                <li className="flex items-center gap-2">
                  {id === "growth" || id === "scale" ? (
                    <Check className="h-3 w-3 text-green" />
                  ) : (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  )}
                  Domínio personalizado
                </li>
              </ul>
              {!isCurrent && plan.price > 0 && id !== "free" && (
                <StripeUpgradeButton
                  className="mt-3 w-full"
                  planId={id}
                  workspaceId={workspaceId}
                  email={email}
                  variant="outline"
                  label={`Upgrade para ${plan.name}`}
                />
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
