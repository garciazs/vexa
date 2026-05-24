"use client";

import { BRAND } from "@/lib/constants";

/** Carregamento discreto — sem mensagens técnicas de compilação ou erro */
export function AppLoadingShell() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple to-green text-lg font-bold text-white shadow-lg shadow-purple/20">
        V
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">{BRAND.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">A preparar o seu workspace…</p>
      <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-purple to-green" />
      </div>
    </div>
  );
}
