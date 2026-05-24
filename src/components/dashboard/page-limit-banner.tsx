"use client";

import Link from "next/link";
import { Crown, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPageLimitMessage } from "@/lib/templates/catalog";
import type { PlanId } from "@/lib/store/types";
import { cn } from "@/lib/utils";

type PageLimitBannerProps = {
  planId: PlanId;
  pageCount: number;
  atLimit: boolean;
  className?: string;
  existingPageId?: string;
  compact?: boolean;
};

export function PageLimitBanner({
  planId,
  pageCount,
  atLimit,
  className,
  existingPageId,
  compact = false,
}: PageLimitBannerProps) {
  if (!atLimit && planId !== "free") return null;

  const message = getPageLimitMessage(planId, atLimit);

  if (compact && !atLimit) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        {pageCount}/1 site usado no plano Free
      </p>
    );
  }

  if (!atLimit) {
    return (
      <Card className={cn("glass border-amber-500/20 bg-amber-500/5", className)}>
        <CardContent className="flex gap-3 p-4 text-sm">
          <Crown className="h-5 w-5 shrink-0 text-amber-400" />
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("glass border-purple/30 bg-gradient-to-r from-purple/10 to-green/5", className)}>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple/20">
            <Lock className="h-5 w-5 text-purple-bright" />
          </div>
          <div>
            <p className="font-medium">Limite do plano atingido</p>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
            {planId === "free" && (
              <p className="mt-1 text-xs text-muted-foreground">
                Starter (€29) — 3 sites · Growth (€79) — ilimitados
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {existingPageId && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/builder/${existingPageId}`}>Editar o meu site</Link>
            </Button>
          )}
          <Button variant="green" size="sm" asChild>
            <Link href="/billing">
              <Crown className="h-4 w-4" />
              Assinar plano
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
