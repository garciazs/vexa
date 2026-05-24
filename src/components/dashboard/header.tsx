"use client";

import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/lib/store/workspace-provider";

interface HeaderProps {
  title: string;
  description?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Header({ title, description }: HeaderProps) {
  const { data } = useWorkspace();
  const userName = data?.user.name ?? "";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input placeholder="Pesquisar..." className="w-64 pl-9" />
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green" />
        </Button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple/20 text-sm font-semibold text-purple-bright">
          {userName ? initials(userName) : "—"}
        </div>
      </div>
    </header>
  );
}
