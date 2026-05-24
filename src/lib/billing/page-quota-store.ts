import { promises as fs } from "fs";
import path from "path";
import { PLAN_LIMITS, normalizePlanId } from "@/lib/templates/catalog";
import { resolvePlanForWorkspace } from "@/lib/billing/subscription-store";
import type { PlanId } from "@/lib/store/types";

export interface WorkspacePageQuota {
  workspaceId: string;
  pagesCreated: number;
  pagesPublished: number;
  generationsUsed: number;
  updatedAt: string;
}

interface IpQuotaRecord {
  ipHash: string;
  freeCreations: number;
  workspaceIds: string[];
  deviceFingerprints: string[];
  updatedAt: string;
}

interface PageQuotaStore {
  workspaces: Record<string, WorkspacePageQuota>;
  ips: Record<string, IpQuotaRecord>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "page-quotas.json");

const MAX_FREE_CREATIONS_PER_IP = 3;
const MAX_FREE_CREATIONS_PER_DEVICE = 2;
const MAX_FREE_GENERATIONS_PER_WORKSPACE = 12;

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
      generationsUsed: 0,
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
  deviceFingerprint?: string;
  replaceExisting?: boolean;
  clientPageCount?: number;
}): Promise<QuotaCheckResult> {
  const planId = await resolvePlanForWorkspace(params.workspaceId);
  const id = normalizePlanId(planId);
  const maxPages = PLAN_LIMITS[id].maxPages;
  const store = await ensureStore();
  const quota = store.workspaces[params.workspaceId] ?? {
    workspaceId: params.workspaceId,
    pagesCreated: 0,
    pagesPublished: 0,
    generationsUsed: 0,
    updatedAt: new Date().toISOString(),
  };

  const base = { quota, planId: id };
  const clientCount = params.clientPageCount ?? 0;
  const effectiveCreated = Math.max(quota.pagesCreated, clientCount);
  const deviceFp = params.deviceFingerprint?.slice(0, 64);

  if (params.action === "create") {
    if (params.replaceExisting) {
      if (maxPages === Infinity || effectiveCreated >= maxPages) {
        return { allowed: true, ...base };
      }
      return {
        allowed: false,
        code: "PAGE_LIMIT",
        message: "Limite do plano atingido. Não é possível criar mais sites.",
        ...base,
      };
    }
    if (maxPages !== Infinity && effectiveCreated >= maxPages) {
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
    if (id === "free") {
      const ipLimit = checkFreeIpLimit(store, params.workspaceId, params.ipHash, deviceFp);
      if (!ipLimit.allowed) return { ...ipLimit, ...base };
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

  // generate — preview IA (Free: bloqueia após 1 site criado)
  if (maxPages !== Infinity && effectiveCreated >= maxPages) {
    return {
      allowed: false,
      code: "PAGE_LIMIT",
      message:
        id === "free"
          ? "Plano Free: já criou o seu site grátis. Assine o VEXA para gerar mais com IA."
          : `Limite de sites do plano atingido (${maxPages}).`,
      ...base,
    };
  }

  if (id === "free") {
    const ipLimit = checkFreeIpLimit(store, params.workspaceId, params.ipHash, deviceFp);
    if (!ipLimit.allowed) return { ...ipLimit, ...base };

    if (quota.generationsUsed >= MAX_FREE_GENERATIONS_PER_WORKSPACE) {
      return {
        allowed: false,
        code: "RATE_LIMIT",
        message: "Muitas gerações de teste. Assine o VEXA para continuar com IA ilimitada.",
        ...base,
      };
    }
  }

  return { allowed: true, ...base };
}

function checkFreeIpLimit(
  store: PageQuotaStore,
  workspaceId: string,
  ipHash?: string,
  deviceFingerprint?: string
): { allowed: boolean; code?: "IP_LIMIT"; message?: string } {
  if (ipHash) {
    const ipRec = store.ips[ipHash] ?? {
      ipHash,
      freeCreations: 0,
      workspaceIds: [],
      deviceFingerprints: [],
      updatedAt: new Date().toISOString(),
    };
    if (
      ipRec.freeCreations >= MAX_FREE_CREATIONS_PER_IP &&
      !ipRec.workspaceIds.includes(workspaceId)
    ) {
      return {
        allowed: false,
        code: "IP_LIMIT",
        message: "Limite de testes grátis atingido nesta rede. Faça upgrade ou contacte suporte.",
      };
    }
  }

  if (deviceFingerprint) {
    const workspacesForDevice = new Set<string>();
    for (const rec of Object.values(store.ips)) {
      const devices = rec.deviceFingerprints ?? [];
      if (devices.includes(deviceFingerprint)) {
        for (const ws of rec.workspaceIds ?? []) workspacesForDevice.add(ws);
      }
    }
    if (
      workspacesForDevice.size >= MAX_FREE_CREATIONS_PER_DEVICE &&
      !workspacesForDevice.has(workspaceId)
    ) {
      return {
        allowed: false,
        code: "IP_LIMIT",
        message: "Limite de testes grátis neste dispositivo. Assine o VEXA para continuar.",
      };
    }
  }

  return { allowed: true };
}

export async function incrementPageQuota(params: {
  workspaceId: string;
  action: "create" | "publish" | "generate";
  ipHash?: string;
  deviceFingerprint?: string;
  planId?: PlanId;
}) {
  const store = await ensureStore();
  const now = new Date().toISOString();
  const existing = store.workspaces[params.workspaceId] ?? {
    workspaceId: params.workspaceId,
    pagesCreated: 0,
    pagesPublished: 0,
    generationsUsed: 0,
    updatedAt: now,
  };

  if (params.action === "create") {
    existing.pagesCreated += 1;
  } else if (params.action === "publish") {
    existing.pagesPublished += 1;
  } else {
    existing.generationsUsed += 1;
  }
  existing.updatedAt = now;
  store.workspaces[params.workspaceId] = existing;

  if (params.action === "create" && params.ipHash && normalizePlanId(params.planId) === "free") {
    const ipRec = store.ips[params.ipHash] ?? {
      ipHash: params.ipHash,
      freeCreations: 0,
      workspaceIds: [],
      deviceFingerprints: [],
      updatedAt: now,
    };
    if (!ipRec.workspaceIds.includes(params.workspaceId)) {
      ipRec.workspaceIds.push(params.workspaceId);
      ipRec.freeCreations += 1;
    }
    const fp = params.deviceFingerprint?.slice(0, 64);
    if (fp && !ipRec.deviceFingerprints.includes(fp)) {
      ipRec.deviceFingerprints.push(fp);
    }
    ipRec.updatedAt = now;
    store.ips[params.ipHash] = ipRec;
  }

  await writeStore(store);
  return existing;
}
