"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanId } from "@/lib/store/types";
import { cn } from "@/lib/utils";

type Props = {
  planId: PlanId;
  workspaceId: string;
  email: string;
  label?: string;
  variant?: "default" | "green" | "outline";
  className?: string;
  disabled?: boolean;
};

export function StripeUpgradeButton({
  planId,
  workspaceId,
  email,
  label,
  variant = "green",
  className,
  disabled,
}: Props) {
  const [loading, setLoading] = useState(false);

  if (planId === "free") return null;

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, workspaceId, email }),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error ?? "Não foi possível iniciar o pagamento.");
        return;
      }
      if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      alert("Erro de rede ao contactar o Stripe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={cn(className)}
      disabled={disabled || loading || !workspaceId || !email}
      onClick={handleCheckout}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      {label ?? `Assinar — €${planId === "starter" ? 29 : planId === "growth" ? 79 : 199}/mês`}
    </Button>
  );
}
