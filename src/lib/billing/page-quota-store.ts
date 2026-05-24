import { promises as fs } from "fs";
import path from "path";
import { PLAN_LIMITS, normalizePlanId } from "@/lib/templates/catalog";
import { resolvePlanForWorkspace } from "@/lib/billing/subscription-store";
import type { PlanId } from "@/lib/store/types";

export interface WorkspacePageQuota {
  workspaceId: string;
  pagesCreated: number;
  pagesPublished: number;
  updatedAt: string;
}

interface IpQuotaRecord {
  ipHash: string;
  freeCreations: number;
  workspaceIds: string[];
  updatedAt: string;
}

interface PageQuotaStore {
  workspaces: Record<string, WorkspacePageQuota>;
  ips: Record<string, IpQuotaRecord>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "page-quotas.json");

const MAX_FREE_CREATIONS_PER_IP = 3;

async function ensureStore(): Promise<PageQuotaStore> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as PageQuotaStore;
  } catch {
    return { workspaces: {}, ips: {} };
  }
}

async function writeStore(store: PageQuotaStore) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function getWorkspaceQuota(workspaceId: string): Promise<WorkspacePageQuota> {
  const store = await ensureStore();
  return (
    store.workspaces[workspaceId] ?? {
      workspaceId,
      pagesCreated: 0,
      pagesPublished: 0,
      updatedAt: new Date().toISOString(),
    }
  );
}

export type QuotaAction = "create" | "publish" | "generate";

export interface QuotaCheckResult {
  allowed: boolean;
  code?: "PAGE_LIMIT" | "PUBLISH_LIMIT" | "IP_LIMIT" | "RATE_LIMIT";
  message?: string;
  quota: WorkspacePageQuota;
  planId: PlanId;
}

export async function checkPageQuota(params: {
  workspaceId: string;
  action: QuotaAction;
  ipHash?: string;
  replaceExisting?: boolean;
}): Promise<QuotaCheckResult> {
  const planId = await resolvePlanForWorkspace(params.workspaceId);
  const id = normalizePlanId(planId);
  const maxPages = PLAN_LIMITS[id].maxPages;
  const store = await ensureStore();
  const quota = store.workspaces[params.workspaceId] ?? {
    workspaceId: params.workspaceId,
    pagesCreated: 0,
    pagesPublished: 0,
    updatedAt: new Date().toISOString(),
  };

  const base = { quota, planId: id };

  if (params.action === "create") {
    if (params.replaceExisting) return { allowed: true, ...base };
    if (maxPages !== Infinity && quota.pagesCreated >= maxPages) {
      return {
        allowed: false,
        code: "PAGE_LIMIT",
        message:
          id === "free"
            ? "Limite do plano Free: 1 site por conta. Faça upgrade para criar mais."
            : `Limite do plano atingido (${maxPages} sites).`,
        ...base,
      };
    }
    if (id === "free" && params.ipHash) {
      const ipRec = store.ips[params.ipHash] ?? {
        ipHash: params.ipHash,
        freeCreations: 0,
        workspaceIds: [],
        updatedAt: new Date().toISOString(),
      };
      if (
        ipRec.freeCreations >= MAX_FREE_CREATIONS_PER_IP &&
        !ipRec.workspaceIds.includes(params.workspaceId)
      ) {
        return {
          allowed: false,
          code: "IP_LIMIT",
          message: "Limite de testes grátis atingido nesta rede. Faça upgrade ou contacte suporte.",
          ...base,
        };
      }
    }
    return { allowed: true, ...base };
  }

  if (params.action === "publish") {
    if (maxPages !== Infinity && quota.pagesPublished >= maxPages) {
      return {
        allowed: false,
        code: "PUBLISH_LIMIT",
        message:
          id === "free"
            ? "Já publicou o seu site grátis. Assine um plano para publicar mais."
            : `Limite de publicações atingido (${maxPages}).`,
        ...base,
      };
    }
    return { allowed: true, ...base };
  }

  // generate — preview IA
  if (id === "free" && quota.pagesPublished >= 1) {
    return {
      allowed: false,
      code: "PAGE_LIMIT",
      message: "Plano Free: site grátis já publicado. Assine para gerar mais.",
      ...base,
    };
  }
  return { allowed: true, ...base };
}

export async function incrementPageQuota(params: {
  workspaceId: string;
  action: "create" | "publish";
  ipHash?: string;
  planId?: PlanId;
}) {
  const store = await ensureStore();
  const now = new Date().toISOString();
  const existing = store.workspaces[params.workspaceId] ?? {
    workspaceId: params.workspaceId,
    pagesCreated: 0,
    pagesPublished: 0,
    updatedAt: now,
  };

  if (params.action === "create") {
    existing.pagesCreated += 1;
  } else {
    existing.pagesPublished += 1;
  }
  existing.updatedAt = now;
  store.workspaces[params.workspaceId] = existing;

  if (params.action === "create" && params.ipHash && normalizePlanId(params.planId) === "free") {
    const ipRec = store.ips[params.ipHash] ?? {
      ipHash: params.ipHash,
      freeCreations: 0,
      workspaceIds: [],
      updatedAt: now,
    };
    if (!ipRec.workspaceIds.includes(params.workspaceId)) {
      ipRec.workspaceIds.push(params.workspaceId);
      ipRec.freeCreations += 1;
    }
    ipRec.updatedAt = now;
    store.ips[params.ipHash] = ipRec;
  }

  await writeStore(store);
  return existing;
}
