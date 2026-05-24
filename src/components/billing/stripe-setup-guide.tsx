"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Key,
  Link2,
  Package,
  Webhook,
} from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/lib/store/workspace-provider";

const STRIPE_LINKS = {
  apiKeys: "https://dashboard.stripe.com/apikeys",
  products: "https://dashboard.stripe.com/products",
  webhooks: "https://dashboard.stripe.com/webhooks",
  portal: "https://dashboard.stripe.com/settings/billing/portal",
  docs: "https://docs.stripe.com/keys",
} as const;

const VERCEL_LINKS = {
  dashboard: "https://vercel.com/dashboard",
  envDocs: "https://vercel.com/docs/projects/environment-variables",
} as const;

type Step = {
  n: number;
  title: string;
  description: string;
  envVar?: string;
  hint?: string;
  href?: string;
  linkLabel?: string;
};

const STEPS: Step[] = [
  {
    n: 1,
    title: "Chave pública (Publishable Key)",
    description: "Chave que pode ir no frontend. Começa por pk_live_ ou pk_test_.",
    envVar: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    hint: "Stripe → Developers → API keys → Publishable key",
    href: STRIPE_LINKS.apiKeys,
    linkLabel: "Abrir API Keys na Stripe",
  },
  {
    n: 2,
    title: "Chave secreta (Secret Key)",
    description: "NUNCA partilhe em chat. Só coloque na Vercel. Começa por sk_live_ ou sk_test_.",
    envVar: "STRIPE_SECRET_KEY",
    hint: "Mesma página → Reveal live key (ou test key)",
    href: STRIPE_LINKS.apiKeys,
    linkLabel: "Abrir API Keys na Stripe",
  },
  {
    n: 3,
    title: "Price ID — Starter (€29/mês)",
    description: "Crie o produto Starter mensal e copie o Price ID (price_...).",
    envVar: "STRIPE_PRICE_STARTER",
    hint: "Products → Add product → Preço recorrente €29 → copiar Price ID",
    href: STRIPE_LINKS.products,
    linkLabel: "Abrir Products na Stripe",
  },
  {
    n: 4,
    title: "Price ID — Growth (€79/mês)",
    description: "Produto Growth mensal.",
    envVar: "STRIPE_PRICE_GROWTH",
    href: STRIPE_LINKS.products,
    linkLabel: "Abrir Products na Stripe",
  },
  {
    n: 5,
    title: "Price ID — Scale (€199/mês)",
    description: "Produto Scale mensal.",
    envVar: "STRIPE_PRICE_SCALE",
    href: STRIPE_LINKS.products,
    linkLabel: "Abrir Products na Stripe",
  },
  {
    n: 6,
    title: "URL da aplicação (Vercel)",
    description: "URL final do site, sem barra no fim. Ex: https://vexa.vercel.app",
    envVar: "NEXT_PUBLIC_APP_URL",
    hint: "Vercel → seu projecto → Domains (ou URL .vercel.app após deploy)",
    href: VERCEL_LINKS.dashboard,
    linkLabel: "Abrir Vercel Dashboard",
  },
  {
    n: 7,
    title: "Webhook (depois do deploy)",
    description:
      "Endpoint: https://SUA-URL.vercel.app/api/stripe/webhook — eventos: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted",
    envVar: "STRIPE_WEBHOOK_SECRET",
    hint: "Após criar o webhook, copie Signing secret (whsec_...)",
    href: STRIPE_LINKS.webhooks,
    linkLabel: "Abrir Webhooks na Stripe",
  },
  {
    n: 8,
    title: "Portal do cliente (opcional)",
    description: "Permite ao utilizador gerir cartão e faturas.",
    href: STRIPE_LINKS.portal,
    linkLabel: "Activar Customer Portal",
  },
];

function CopyButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(text)}
      className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground"
      title="Copiar"
    >
      <Copy className="h-3 w-3" />
      Copiar
    </button>
  );
}

export function StripeSetupGuide() {
  const { data } = useWorkspace();
  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "https://seu-app.vercel.app";

  const webhookUrl = `${appUrl}/api/stripe/webhook`;

  return (
    <>
      <Header
        title="Configurar pagamentos"
        description="Onde obter cada chave Stripe e colocar na Vercel"
      />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div className="mx-auto max-w-3xl space-y-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/billing">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Billing
            </Link>
          </Button>

          <Card className="glass border-purple/30 bg-purple/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5 text-purple-bright" />
                Guia rápido — Vercel + Stripe
              </CardTitle>
              <CardDescription>
                Workspace: <strong>{data?.workspace.name ?? "—"}</strong> · ID:{" "}
                <code className="text-xs">{data?.workspace.id ?? "—"}</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                1. Obtenha os valores abaixo na Stripe · 2. Cole na{" "}
                <strong className="text-foreground">Vercel → Project → Settings → Environment Variables</strong>{" "}
                · 3. Faça <strong className="text-foreground">Redeploy</strong>
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href={VERCEL_LINKS.envDocs} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Como adicionar variáveis na Vercel
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-amber-500/20">
            <CardContent className="p-4 text-sm">
              <p className="font-medium text-amber-200">A sua Publishable Key</p>
              <p className="mt-1 text-muted-foreground">
                A chave <code className="text-foreground">pk_live_...</code> que enviou vai em:
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <code className="rounded bg-surface px-2 py-1 text-xs">
                  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
                </code>
                <CopyButton text="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Cole o valor pk_live_... na Vercel (não no código).
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {STEPS.map((step) => (
              <Card key={step.n} className="glass">
                <CardContent className="p-5">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple/20 text-sm font-bold text-purple-bright">
                      {step.n}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{step.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                      {step.envVar && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {step.envVar}
                          </Badge>
                          <CopyButton text={step.envVar} />
                        </div>
                      )}
                      {step.hint && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="mr-1 inline h-3 w-3 text-green" />
                          {step.hint}
                        </p>
                      )}
                      {step.href && step.linkLabel && (
                        <Button variant="green" size="sm" className="mt-3" asChild>
                          <a href={step.href} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                            {step.linkLabel}
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Webhook className="h-4 w-4" />
                URL do webhook (copie após deploy)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <code className="block break-all rounded-lg bg-surface p-3 text-xs">{webhookUrl}</code>
              <div className="mt-2">
                <CopyButton text={webhookUrl} />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Lista completa para colar na Vercel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-lg bg-surface p-4 text-[11px] leading-relaxed text-foreground">
{`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_SCALE=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=${appUrl}`}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=\nSTRIPE_SECRET_KEY=\nSTRIPE_PRICE_STARTER=\nSTRIPE_PRICE_GROWTH=\nSTRIPE_PRICE_SCALE=\nSTRIPE_WEBHOOK_SECRET=\nNEXT_PUBLIC_APP_URL=${appUrl}`
                  )
                }
              >
                <Copy className="h-4 w-4" />
                Copiar modelo
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-border">
            <CardContent className="flex flex-wrap gap-3 p-4">
              <Button variant="outline" size="sm" asChild>
                <a href={STRIPE_LINKS.apiKeys} target="_blank" rel="noopener noreferrer">
                  <Key className="h-4 w-4" /> API Keys
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={STRIPE_LINKS.products} target="_blank" rel="noopener noreferrer">
                  <Package className="h-4 w-4" /> Products
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={STRIPE_LINKS.webhooks} target="_blank" rel="noopener noreferrer">
                  <Webhook className="h-4 w-4" /> Webhooks
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={VERCEL_LINKS.dashboard} target="_blank" rel="noopener noreferrer">
                  <Link2 className="h-4 w-4" /> Vercel
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
