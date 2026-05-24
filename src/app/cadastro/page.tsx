"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/lib/store/workspace-provider";

export default function CadastroPage() {
  const router = useRouter();
  const { register } = useWorkspace();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    register({
      name: name.trim(),
      email: email.trim(),
      workspaceName: workspaceName.trim() || `${name.trim()} Workspace`,
      plan: "free",
    });
    router.push("/builder/ai");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background bg-grid px-4 py-12">
      <div className="absolute inset-0 bg-radial-purple" />
      <Card className="relative w-full max-w-md glass-strong">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Crie a sua conta grátis</CardTitle>
          <CardDescription>
            Plano Free — 1 site com IA premium. Crie, publique e só depois assine para mais.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
                Nome completo
              </label>
              <Input
                id="name"
                placeholder="Ana Costa"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="voce@empresa.pt"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Palavra-passe
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="workspace" className="mb-1.5 block text-sm font-medium">
                Nome do workspace
              </label>
              <Input
                id="workspace"
                placeholder="Minha Empresa"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
              />
            </div>
            <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground">
              <strong className="text-foreground">1 site incluído.</strong> Use a IA para criar e publicar
              o site completo. Para um 2.º site,{" "}
              <Link href="/pricing" className="text-purple-bright hover:underline">
                veja os planos pagos
              </Link>
              .
            </p>
            <Button type="submit" variant="green" className="w-full">
              Começar grátis
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link href="/login" className="text-purple-bright hover:underline">
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
