import type { VexaWorkspaceData } from "@/lib/store/types";

/** Contagem efetiva de sites criados — impede bypass após apagar localmente */
export function getEffectivePageCount(data: VexaWorkspaceData): number {
  const local = data.landingPages?.length ?? 0;
  const tracked = data.workspace.landingPagesCreatedTotal ?? 0;
  const server = data.workspace.serverPagesCreated ?? 0;
  return Math.max(local, tracked, server);
}

export function getPublishedTotal(data: VexaWorkspaceData): number {
  const fromPages = data.landingPages?.filter((p) => p.status === "published").length ?? 0;
  const stored = data.workspace.landingPagesPublishedTotal ?? 0;
  return Math.max(fromPages, stored);
}
