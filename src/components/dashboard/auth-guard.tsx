"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWorkspace } from "@/lib/store/workspace-provider";
import { AppLoadingShell } from "@/components/ui/app-loading-shell";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data, ready } = useWorkspace();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!data) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [ready, data, router, pathname]);

  if (!ready) {
    return <AppLoadingShell />;
  }

  if (!data) return null;

  return <>{children}</>;
}
