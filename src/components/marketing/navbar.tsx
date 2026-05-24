"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 flex h-14 items-center justify-between rounded-2xl border border-border glass px-4 sm:px-6">
          <Logo size="sm" />
          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/cadastro">Começar grátis</Link>
            </Button>
          </div>
          <button
            type="button"
            className="md:hidden text-muted-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div
        className={cn(
          "md:hidden mx-4 mt-2 rounded-2xl border border-border glass p-4 space-y-3",
          open ? "block" : "hidden"
        )}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block text-sm text-muted-foreground"
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button className="flex-1" asChild>
            <Link href="/cadastro">Começar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
