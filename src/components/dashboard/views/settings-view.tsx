"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/lib/store/workspace-provider";
import type { NotificationPrefs } from "@/lib/store/types";

export function SettingsView() {
  const { data, updateProfile, updateWorkspace, updateNotifications } = useWorkspace();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [domain, setDomain] = useState("");
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    newLeads: true,
    qualifiedLeads: true,
    automations: true,
    weeklyReport: false,
  });
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setName(data.user.name);
    setEmail(data.user.email);
    setWorkspaceName(data.workspace.name);
    setDomain(data.workspace.domain ?? "");
    setNotifications(data.notifications);
  }, [data]);

  function flash(section: string) {
    setSaved(section);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <>
      <Header title="Configurações" description="Conta, workspace e preferências" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Informações da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nome</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </div>
              <Button
                onClick={() => {
                  updateProfile(name, email);
                  flash("profile");
                }}
              >
                {saved === "profile" ? "Guardado!" : "Guardar alterações"}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Workspace</CardTitle>
              <CardDescription>Configurações da organização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nome do workspace</label>
                <Input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Domínio personalizado</label>
                <Input
                  placeholder="lp.seudominio.pt"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  updateWorkspace(workspaceName, domain || undefined);
                  flash("workspace");
                }}
              >
                {saved === "workspace" ? "Guardado!" : "Guardar workspace"}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {(
                [
                  ["newLeads", "Novos leads capturados"],
                  ["qualifiedLeads", "Leads qualificados pelo chatbot"],
                  ["automations", "Automações concluídas"],
                  ["weeklyReport", "Relatório semanal"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between">
                  <span>{label}</span>
                  <input
                    type="checkbox"
                    checked={notifications[key]}
                    onChange={(e) =>
                      setNotifications((n) => ({ ...n, [key]: e.target.checked }))
                    }
                    className="rounded accent-purple"
                  />
                </label>
              ))}
              <Button
                className="mt-2"
                variant="outline"
                onClick={() => {
                  updateNotifications(notifications);
                  flash("notifications");
                }}
              >
                {saved === "notifications" ? "Guardado!" : "Guardar notificações"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
