"use client";

import { WorkspaceProvider } from "@/lib/store/workspace-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <WorkspaceProvider>{children}</WorkspaceProvider>;
}
