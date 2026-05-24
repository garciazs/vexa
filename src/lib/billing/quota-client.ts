import type { PlanId } from "@/lib/store/types";
import type { WorkspacePageQuota } from "@/lib/billing/page-quota-store";

export type QuotaAction = "create" | "publish" | "generate";

export interface QuotaClientResult {
  allowed: boolean;
  error?: string;
  code?: string;
  quota?: WorkspacePageQuota;
}

export async function checkServerQuota(params: {
  workspaceId: string;
  action: QuotaAction;
  replaceExisting?: boolean;
  planId?: PlanId;
  confirm?: boolean;
  clientPageCount?: number;
}): Promise<QuotaClientResult> {
  try {
    const res = await fetch("/api/pages/quota", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        allowed: false,
        error: data.error ?? "Limite do plano atingido.",
        code: data.code,
        quota: data.quota,
      };
    }
    return { allowed: true, quota: data.quota };
  } catch {
    return { allowed: false, error: "Não foi possível verificar o limite. Tente novamente." };
  }
}
