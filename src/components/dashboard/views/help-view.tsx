"use client";

import { useMemo, useState } from "react";
import { BookOpen, Mail, MessageCircle, Search } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpAssistant } from "@/components/help/help-assistant";

const faqs = [
  {
    q: "Como publicar uma landing page?",
    a: "Vá ao Builder, edite os blocos, clique em Guardar e depois Publicar.",
    tags: ["builder", "publicar", "landing"],
  },
  {
    q: "Como conectar o WhatsApp?",
    a: "Em Chatbots, crie um bot WhatsApp, abra Editar fluxo e configure mensagens + conexão.",
    tags: ["whatsapp", "chatbot"],
  },
  {
    q: "Como criar automações multicanal?",
    a: "Em Automações, defina gatilho (ex: Novo lead) e adicione mensagens para WhatsApp, Instagram ou chat.",
    tags: ["automação", "instagram", "whatsapp"],
  },
  {
    q: "Posso usar domínio personalizado?",
    a: "Sim, nos planos Growth e Scale. Configure em Configurações > Workspace.",
    tags: ["domínio", "plano"],
  },
  {
    q: "Como funciona o CRM?",
    a: "O CRM tem mini dashboard com métricas e pipeline kanban. Leads de formulários entram automaticamente.",
    tags: ["crm", "leads"],
  },
  {
    q: "O assistente funciona 24 horas?",
    a: "Sim. O assistente VEXA responde instantaneamente a qualquer hora. Para suporte humano: suporte@vexa.pt",
    tags: ["ajuda", "suporte"],
  },
];

export function HelpView() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"assistant" | "docs" | "faq">("assistant");

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q) ||
        f.tags.some((t) => t.includes(q))
    );
  }, [query]);

  return (
    <>
      <Header title="Ajuda" description="Assistente 24/7, documentação e suporte" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Pesquisar ajuda, WhatsApp, CRM, automações..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "assistant" as const, label: "Assistente 24/7", icon: MessageCircle },
                { id: "docs" as const, label: "Guias rápidos", icon: BookOpen },
                { id: "faq" as const, label: "FAQ", icon: Mail },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition ${
                  activeTab === tab.id
                    ? "border-purple/50 bg-purple/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-purple/30"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "assistant" && <HelpAssistant />}

          {activeTab === "docs" && (
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: BookOpen,
                  title: "Primeiros passos",
                  desc: "Criar conta, template free e publicar a primeira LP.",
                  topics: ["Cadastro", "Builder", "Publicar"],
                },
                {
                  icon: MessageCircle,
                  title: "Chatbots & canais",
                  desc: "WhatsApp, Instagram e widget web com fluxo editável.",
                  topics: ["Fluxo", "Boas-vindas", "Botões"],
                },
                {
                  icon: Mail,
                  title: "Automações de vendas",
                  desc: "Mensagens automáticas quando entra lead ou qualifica.",
                  topics: ["Gatilhos", "Multicanal", "Histórico"],
                },
              ].map((item) => (
                <Card key={item.title} className="glass">
                  <CardContent className="p-4">
                    <item.icon className="h-8 w-8 text-purple-bright" />
                    <p className="mt-2 font-medium">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                    <ul className="mt-3 space-y-1">
                      {item.topics.map((t) => (
                        <li key={t} className="text-xs text-green">
                          • {t}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "faq" && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Perguntas frequentes</CardTitle>
                <CardDescription>
                  {filteredFaqs.length} resultado(s)
                  {query ? ` para "${query}"` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredFaqs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum resultado. Experimente o assistente 24/7 na aba anterior.
                  </p>
                ) : (
                  filteredFaqs.map((faq) => (
                    <div key={faq.q} className="border-b border-border pb-4 last:border-0">
                      <p className="font-medium">{faq.q}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Suporte humano:{" "}
            <a href="mailto:suporte@vexa.pt" className="text-purple-bright hover:underline">
              suporte@vexa.pt
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
