import { promises as fs } from "fs";
import path from "path";
import type { PlanId } from "@/lib/store/types";

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete";

export interface SubscriptionRecord {
  workspaceId: string;
  email: string;
  planId: PlanId;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  status: SubscriptionStatus;
  updatedAt: string;
}

interface SubscriptionStore {
  byWorkspace: Record<string, SubscriptionRecord>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "subscriptions.json");

async function ensureStore(): Promise<SubscriptionStore> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as SubscriptionStore;
  } catch {
    return { byWorkspace: {} };
  }
}

async function writeStore(store: SubscriptionStore) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function getSubscriptionByWorkspace(
  workspaceId: string
): Promise<SubscriptionRecord | null> {
  const store = await ensureStore();
  return store.byWorkspace[workspaceId] ?? null;
}

export async function upsertSubscription(record: SubscriptionRecord) {
  const store = await ensureStore();
  store.byWorkspace[record.workspaceId] = record;
  await writeStore(store);
}

export async function resolvePlanForWorkspace(workspaceId: string): Promise<PlanId> {
  const sub = await getSubscriptionByWorkspace(workspaceId);
  if (!sub) return "free";
  if (sub.status === "active" || sub.status === "trialing") {
    return sub.planId;
  }
  return "free";
}
