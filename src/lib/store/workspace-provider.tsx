"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createBlock } from "@/lib/builder/block-catalog";
import {
  canCreatePage,
  canUseTemplate,
  getTemplate,
  getPageLimitMessage,
  normalizePlanId,
} from "@/lib/templates/catalog";
import {
  createDefaultAction,
  normalizeAutomation,
  runAutomationsForTrigger,
} from "@/lib/automation/engine";
import { syncSessionCookie } from "@/lib/auth/session-cookie";
import { createDefaultFlow, normalizeChatbot } from "@/lib/chatbot/defaults";
import type {
  AutomationAction,
  AutomationRecord,
  AutomationTrigger,
  ChatbotRecord,
  DomainRecord,
  LandingPageRecord,
  LeadRecord,
  LeadStatus,
  MessageLog,
  NotificationPrefs,
  PageBlock,
  PlanId,
  VexaWorkspaceData,
} from "./types";

const STORAGE_KEY = "vexa-workspace-v1";

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function load(): VexaWorkspaceData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return migrate(JSON.parse(raw) as VexaWorkspaceData);
  } catch {
    return null;
  }
}

function migrate(data: VexaWorkspaceData): VexaWorkspaceData {
  const plan = normalizePlanId(data.workspace?.plan);
  const pageCount = data.landingPages?.length ?? 0;
  const lifetime =
    data.workspace.landingPagesCreatedTotal ??
    (plan === "free" && pageCount > 0 ? pageCount : pageCount);

  return {
    ...data,
    workspace: {
      ...data.workspace,
      plan,
      landingPagesCreatedTotal: lifetime,
    },
    messageLogs: data.messageLogs ?? [],
    domains: (data.domains ?? []).map((d) => ({ ...d })),
    chatbots: (data.chatbots ?? []).map((b) => normalizeChatbot(b as ChatbotRecord)),
    automations: (data.automations ?? []).map((a) => normalizeAutomation(a as AutomationRecord)),
  };
}

function save(data: VexaWorkspaceData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function emptyNotifications(): NotificationPrefs {
  return { newLeads: true, qualifiedLeads: true, automations: true, weeklyReport: false };
}

export function createWorkspace(input: {
  name: string;
  email: string;
  workspaceName: string;
  plan: PlanId;
}): VexaWorkspaceData {
  const userId = crypto.randomUUID();
  const wsId = crypto.randomUUID();
  const effectivePlan = normalizePlanId(input.plan);

  return {
    user: { id: userId, name: input.name, email: input.email.toLowerCase() },
    workspace: {
      id: wsId,
      name: input.workspaceName,
      slug: slugify(input.workspaceName) || `workspace-${wsId.slice(0, 6)}`,
      plan: effectivePlan,
      landingPagesCreatedTotal: 0,
    },
    landingPages: [],
    leads: [],
    chatbots: [],
    automations: [],
    domains: [],
    messageLogs: [],
    onboardingSteps: ["workspace"],
    notifications: emptyNotifications(),
  };
}

interface WorkspaceContextValue {
  data: VexaWorkspaceData | null;
  ready: boolean;
  login: (email: string) => boolean;
  register: (input: {
    name: string;
    email: string;
    workspaceName: string;
    plan: PlanId;
  }) => void;
  logout: () => void;
  updateProfile: (name: string, email: string) => void;
  updateWorkspace: (name: string, domain?: string) => void;
  updateNotifications: (prefs: NotificationPrefs) => void;
  syncPlanFromStripe: (planId: PlanId) => void;
  hasStripeSubscription: boolean;
  createLandingPage: (opts?: {
    name?: string;
    templateId?: string;
  }) => string;
  createLandingPageFromAI: (input: {
    name: string;
    slug: string;
    blocks: PageBlock[];
    theme?: LandingPageRecord["theme"];
  }) => string;
  updateLandingPage: (
    id: string,
    patch: Partial<Pick<LandingPageRecord, "name" | "slug" | "blocks" | "status">>
  ) => void;
  deleteLandingPage: (id: string) => void;
  publishLandingPage: (id: string) => Promise<{ publicUrl: string } | null>;
  purchaseDomain: (name: string, price: number, mode?: "register" | "connect") => void;
  connectExistingDomain: (name: string) => void;
  verifyDomainDns: (domainId: string) => void;
  linkDomainToPage: (domainId: string, pageId: string) => void;
  getLandingPage: (id: string) => LandingPageRecord | undefined;
  getLandingPageBySlug: (slug: string) => LandingPageRecord | undefined;
  incrementPageViews: (slug: string) => void;
  addLead: (lead: Omit<LeadRecord, "id" | "updatedAt">, trigger?: AutomationTrigger) => void;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  createChatbot: (name: string, channel: ChatbotRecord["channel"]) => string;
  updateChatbot: (id: string, patch: Partial<ChatbotRecord>) => void;
  deleteChatbot: (id: string) => void;
  toggleChatbotStatus: (id: string) => void;
  connectChatbot: (id: string, account: string) => void;
  createAutomation: (input: {
    name: string;
    trigger: AutomationTrigger;
    actions: AutomationAction[];
  }) => void;
  updateAutomation: (id: string, patch: Partial<AutomationRecord>) => void;
  deleteAutomation: (id: string) => void;
  toggleAutomation: (id: string) => void;
  messageLogs: MessageLog[];
  completeOnboardingStep: (stepId: string) => void;
  metrics: {
    revenue: number;
    leadsCount: number;
    conversionRate: number;
    publishedPages: number;
  };
  crmMetrics: {
    pipelineValue: number;
    wonValue: number;
    winRate: number;
    avgDeal: number;
    byStage: Record<LeadStatus, number>;
    recentLeads: number;
  };
  canCreateLandingPage: boolean;
  pageLimitReason: string | null;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<VexaWorkspaceData | null>(null);
  const [ready, setReady] = useState(false);
  const [hasStripeSubscription, setHasStripeSubscription] = useState(false);

  useEffect(() => {
    const loaded = load();
    setData(loaded);
    syncSessionCookie(!!loaded);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !data?.workspace.id) return;
    const workspaceId = data.workspace.id;
    let cancelled = false;
    fetch(`/api/stripe/subscription?workspaceId=${encodeURIComponent(workspaceId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json) return;
        setHasStripeSubscription(!!json.hasPaymentMethod);
        const serverPlan = json.planId as PlanId | undefined;
        if (!serverPlan || serverPlan === "free") return;
        setData((prev) => {
          if (!prev || prev.workspace.plan === serverPlan) return prev;
          const next = {
            ...prev,
            workspace: { ...prev.workspace, plan: serverPlan },
          };
          save(next);
          return next;
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [ready, data?.workspace.id]);

  const persist = useCallback((next: VexaWorkspaceData) => {
    setData(next);
    save(next);
  }, []);

  useEffect(() => {
    if (!data?.messageLogs?.length) return;
    const now = Date.now();
    const overdue = data.messageLogs.filter(
      (l) => l.status === "queued" && new Date(l.scheduledFor).getTime() <= now
    );
    if (overdue.length === 0) return;

    const timer = setTimeout(() => {
      persist({
        ...data,
        messageLogs: data.messageLogs.map((l) =>
          l.status === "queued" && new Date(l.scheduledFor).getTime() <= Date.now()
            ? { ...l, status: "sent" as const, sentAt: new Date().toISOString() }
            : l
        ),
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, persist]);

  const login = useCallback(
    (email: string) => {
      const stored = load();
      if (stored && stored.user.email === email.toLowerCase()) {
        setData(stored);
        syncSessionCookie(true);
        return true;
      }
      return false;
    },
    []
  );

  const register = useCallback(
    (input: Parameters<typeof createWorkspace>[0]) => {
      const ws = createWorkspace(input);
      persist(ws);
      syncSessionCookie(true);
    },
    [persist]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    syncSessionCookie(false);
    setData(null);
  }, []);

  const updateProfile = useCallback(
    (name: string, email: string) => {
      if (!data) return;
      persist({ ...data, user: { ...data.user, name, email: email.toLowerCase() } });
    },
    [data, persist]
  );

  const updateWorkspace = useCallback(
    (name: string, domain?: string) => {
      if (!data) return;
      persist({
        ...data,
        workspace: { ...data.workspace, name, domain: domain || undefined },
      });
    },
    [data, persist]
  );

  const syncPlanFromStripe = useCallback(
    (planId: PlanId) => {
      if (!data) return;
      const normalized = normalizePlanId(planId);
      if (data.workspace.plan === normalized) return;
      persist({
        ...data,
        workspace: { ...data.workspace, plan: normalized },
      });
      setHasStripeSubscription(normalized !== "free");
    },
    [data, persist]
  );

  const updateNotifications = useCallback(
    (notifications: NotificationPrefs) => {
      if (!data) return;
      persist({ ...data, notifications });
    },
    [data, persist]
  );

  const createLandingPage = useCallback(
    (opts?: { name?: string; templateId?: string }) => {
      if (!data) return "";
      const plan = normalizePlanId(data.workspace.plan);
      const lifetime = data.workspace.landingPagesCreatedTotal ?? 0;
      if (!canCreatePage(plan, data.landingPages.length, lifetime)) return "";
      if (opts?.templateId) {
        const tpl = getTemplate(opts.templateId);
        if (!tpl || !canUseTemplate(plan, tpl)) return "";
      }

      const name = opts?.name ?? "Nova landing page";
      let blocks = [createBlock("hero", "Hero Section")];
      let theme: LandingPageRecord["theme"] = "midnight";
      if (opts?.templateId) {
        const tpl = getTemplate(opts.templateId);
        if (tpl) {
          blocks = tpl.blocks.map((b) => ({
            ...b,
            id: `block-${crypto.randomUUID()}`,
            content: { ...b.content },
          }));
          theme = tpl.theme;
        }
      }
      const baseSlug = slugify(name) || "pagina";
      let slug = baseSlug;
      let n = 1;
      while (data.landingPages.some((p) => p.slug === slug)) {
        slug = `${baseSlug}-${n++}`;
      }
      const page: LandingPageRecord = {
        id: crypto.randomUUID(),
        name,
        slug,
        status: "draft",
        blocks,
        theme,
        views: 0,
        leadsCount: 0,
        templateId: opts?.templateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const onboardingSteps =
        opts?.templateId && !data.onboardingSteps.includes("template")
          ? [...data.onboardingSteps, "template"]
          : data.onboardingSteps;
      persist({
        ...data,
        workspace: {
          ...data.workspace,
          landingPagesCreatedTotal: lifetime + 1,
        },
        landingPages: [...data.landingPages, page],
        onboardingSteps,
      });
      return page.id;
    },
    [data, persist]
  );

  const createLandingPageFromAI = useCallback(
    (input: {
      name: string;
      slug: string;
      blocks: LandingPageRecord["blocks"];
      theme?: LandingPageRecord["theme"];
    }) => {
      if (!data) return "";
      const plan = normalizePlanId(data.workspace.plan);
      const lifetime = data.workspace.landingPagesCreatedTotal ?? 0;
      if (!canCreatePage(plan, data.landingPages.length, lifetime)) return "";

      let slug = slugify(input.slug) || slugify(input.name) || "landing-ia";
      const baseSlug = slug;
      let n = 1;
      while (data.landingPages.some((p) => p.slug === slug)) {
        slug = `${baseSlug}-${n++}`;
      }

      const page: LandingPageRecord = {
        id: crypto.randomUUID(),
        name: input.name,
        slug,
        status: "draft",
        blocks: input.blocks.map((b) => ({
          ...b,
          id: `block-${crypto.randomUUID()}`,
          content: { ...b.content },
        })),
        theme: input.theme ?? "midnight",
        views: 0,
        leadsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const onboardingSteps = data.onboardingSteps.includes("template")
        ? data.onboardingSteps
        : [...data.onboardingSteps, "template"];

      persist({
        ...data,
        workspace: {
          ...data.workspace,
          landingPagesCreatedTotal: lifetime + 1,
        },
        landingPages: [...data.landingPages, page],
        onboardingSteps,
      });
      return page.id;
    },
    [data, persist]
  );

  const updateLandingPage = useCallback(
    (
      id: string,
      patch: Partial<Pick<LandingPageRecord, "name" | "slug" | "blocks" | "status" | "theme">>
    ) => {
      if (!data) return;
      persist({
        ...data,
        landingPages: data.landingPages.map((p) =>
          p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
        ),
      });
    },
    [data, persist]
  );

  const deleteLandingPage = useCallback(
    (id: string) => {
      if (!data) return;
      persist({ ...data, landingPages: data.landingPages.filter((p) => p.id !== id) });
    },
    [data, persist]
  );

  const publishLandingPage = useCallback(
    async (id: string) => {
      if (!data) return null;
      const page = data.landingPages.find((p) => p.id === id);
      if (!page) return null;

      const linkedDomain = data.domains.find((d) => d.linkedPageId === id);
      const theme =
        page.theme ??
        (page.templateId ? getTemplate(page.templateId)?.theme : undefined) ??
        "midnight";
      const publishedAt = new Date().toISOString();

      try {
        await fetch("/api/pages/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: page.slug,
            name: page.name,
            blocks: page.blocks,
            theme,
            customDomain: linkedDomain?.dnsVerified ? linkedDomain.name : undefined,
            workspaceId: data.workspace.id,
            publishedAt,
          }),
        });
        if (linkedDomain?.dnsVerified) {
          await fetch("/api/domains/link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              domain: linkedDomain.name,
              slug: page.slug,
              workspaceId: data.workspace.id,
            }),
          });
        }
      } catch {
        /* local publish still works */
      }

      const onboardingSteps = data.onboardingSteps.includes("publish")
        ? data.onboardingSteps
        : [...data.onboardingSteps, "publish"];

      persist({
        ...data,
        onboardingSteps,
        landingPages: data.landingPages.map((p) =>
          p.id === id
            ? {
                ...p,
                status: "published" as const,
                publishedAt,
                customDomain: linkedDomain?.name,
                updatedAt: publishedAt,
              }
            : p
        ),
      });

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return { publicUrl: `${origin}/p/${page.slug}` };
    },
    [data, persist]
  );

  const getLandingPage = useCallback(
    (id: string) => data?.landingPages.find((p) => p.id === id),
    [data]
  );

  const getLandingPageBySlug = useCallback(
    (slug: string) => data?.landingPages.find((p) => p.slug === slug && p.status === "published"),
    [data]
  );

  const incrementPageViews = useCallback(
    (slug: string) => {
      if (!data) return;
      persist({
        ...data,
        landingPages: data.landingPages.map((p) =>
          p.slug === slug && p.status === "published" ? { ...p, views: p.views + 1 } : p
        ),
      });
    },
    [data, persist]
  );

  const addLead = useCallback(
    (lead: Omit<LeadRecord, "id" | "updatedAt">, trigger: AutomationTrigger = "new_lead") => {
      if (!data) return;
      const record: LeadRecord = {
        ...lead,
        id: crypto.randomUUID(),
        updatedAt: new Date().toISOString(),
      };

      const slugMatch = lead.source.match(/Landing: \/(.+)/);
      let landingPages = data.landingPages;
      if (slugMatch) {
        const slug = slugMatch[1];
        landingPages = data.landingPages.map((p) =>
          p.slug === slug ? { ...p, leadsCount: p.leadsCount + 1 } : p
        );
      }

      const automations = data.automations.map((a) => normalizeAutomation(a));
      const newLogs = runAutomationsForTrigger(automations, trigger, record);
      const bumpedAutomations = automations.map((a) => {
        if (a.status !== "active" || a.trigger !== trigger) return a;
        return {
          ...a,
          runs: a.runs + 1,
          lastRunAt: new Date().toISOString(),
        };
      });

      persist({
        ...data,
        landingPages,
        leads: [record, ...data.leads],
        automations: bumpedAutomations,
        messageLogs: [...newLogs, ...(data.messageLogs ?? [])].slice(0, 100),
      });
    },
    [data, persist]
  );

  const updateLeadStatus = useCallback(
    (id: string, status: LeadStatus) => {
      if (!data) return;
      const lead = data.leads.find((l) => l.id === id);
      const automations = data.automations.map((a) => normalizeAutomation(a));
      let messageLogs = data.messageLogs ?? [];
      let bumpedAutomations = automations;

      if (lead && status === "qualified") {
        const newLogs = runAutomationsForTrigger(automations, "lead_qualified", lead);
        messageLogs = [...newLogs, ...messageLogs].slice(0, 100);
        bumpedAutomations = automations.map((a) => {
          if (a.status !== "active" || a.trigger !== "lead_qualified") return a;
          return { ...a, runs: a.runs + 1, lastRunAt: new Date().toISOString() };
        });
      }

      persist({
        ...data,
        automations: bumpedAutomations,
        messageLogs,
        leads: data.leads.map((l) =>
          l.id === id ? { ...l, status, updatedAt: new Date().toISOString() } : l
        ),
      });
    },
    [data, persist]
  );

  const createChatbot = useCallback(
    (name: string, channel: ChatbotRecord["channel"]) => {
      if (!data) return "";
      const bot: ChatbotRecord = normalizeChatbot({
        id: crypto.randomUUID(),
        name,
        channel,
        status: "training",
        welcomeMessage: undefined,
        fallbackMessage: undefined,
        flows: createDefaultFlow(),
        connected: false,
        conversations: 0,
        conversionRate: 0,
        createdAt: new Date().toISOString(),
      });
      persist({
        ...data,
        chatbots: [...data.chatbots, bot],
        onboardingSteps: data.onboardingSteps.includes("chatbot")
          ? data.onboardingSteps
          : [...data.onboardingSteps, "chatbot"],
      });
      return bot.id;
    },
    [data, persist]
  );

  const updateChatbot = useCallback(
    (id: string, patch: Partial<ChatbotRecord>) => {
      if (!data) return;
      persist({
        ...data,
        chatbots: data.chatbots.map((b) =>
          b.id === id ? normalizeChatbot({ ...b, ...patch }) : b
        ),
      });
    },
    [data, persist]
  );

  const deleteChatbot = useCallback(
    (id: string) => {
      if (!data) return;
      persist({ ...data, chatbots: data.chatbots.filter((b) => b.id !== id) });
    },
    [data, persist]
  );

  const connectChatbot = useCallback(
    (id: string, account: string) => {
      if (!data) return;
      persist({
        ...data,
        chatbots: data.chatbots.map((b) =>
          b.id === id
            ? normalizeChatbot({
                ...b,
                connected: true,
                connectedAccount: account,
                status: "active",
              })
            : b
        ),
      });
    },
    [data, persist]
  );

  const toggleChatbotStatus = useCallback(
    (id: string) => {
      if (!data) return;
      persist({
        ...data,
        chatbots: data.chatbots.map((b) =>
          b.id === id
            ? { ...b, status: b.status === "active" ? "paused" : "active" }
            : b
        ),
      });
    },
    [data, persist]
  );

  const createAutomation = useCallback(
    (input: {
      name: string;
      trigger: AutomationTrigger;
      actions: AutomationAction[];
    }) => {
      if (!data) return;
      const auto: AutomationRecord = {
        id: crypto.randomUUID(),
        name: input.name,
        trigger: input.trigger,
        actions: input.actions,
        status: "paused",
        runs: 0,
        createdAt: new Date().toISOString(),
      };
      persist({
        ...data,
        automations: [...data.automations, auto],
        onboardingSteps: data.onboardingSteps.includes("automation")
          ? data.onboardingSteps
          : [...data.onboardingSteps, "automation"],
      });
    },
    [data, persist]
  );

  const updateAutomation = useCallback(
    (id: string, patch: Partial<AutomationRecord>) => {
      if (!data) return;
      persist({
        ...data,
        automations: data.automations.map((a) =>
          a.id === id ? normalizeAutomation({ ...a, ...patch } as AutomationRecord) : a
        ),
      });
    },
    [data, persist]
  );

  const deleteAutomation = useCallback(
    (id: string) => {
      if (!data) return;
      persist({ ...data, automations: data.automations.filter((a) => a.id !== id) });
    },
    [data, persist]
  );

  const toggleAutomation = useCallback(
    (id: string) => {
      if (!data) return;
      persist({
        ...data,
        automations: data.automations.map((a) => {
          if (a.id !== id) return a;
          const nextStatus = a.status === "active" ? "paused" : "active";
          return {
            ...a,
            status: nextStatus,
            runs: nextStatus === "active" ? a.runs + 1 : a.runs,
            lastRunAt: nextStatus === "active" ? new Date().toISOString() : a.lastRunAt,
          };
        }),
      });
    },
    [data, persist]
  );

  const completeOnboardingStep = useCallback(
    (stepId: string) => {
      if (!data) return;
      completeOnboardingStepInternal(data, persist, stepId);
    },
    [data, persist]
  );

  const metrics = useMemo(() => {
    if (!data) {
      return { revenue: 0, leadsCount: 0, conversionRate: 0, publishedPages: 0 };
    }
    const leadsCount = data.leads.length;
    const totalViews = data.landingPages.reduce((s, p) => s + p.views, 0);
    const revenue = data.leads
      .filter((l) => l.status === "won")
      .reduce((s, l) => s + l.value, 0);
    const conversionRate = totalViews > 0 ? (leadsCount / totalViews) * 100 : 0;
    const publishedPages = data.landingPages.filter((p) => p.status === "published").length;
    return { revenue, leadsCount, conversionRate, publishedPages };
  }, [data]);

  const purchaseDomain = useCallback(
    (name: string, price: number, mode: "register" | "connect" = "register") => {
      if (!data) return;
      const normalized = name.toLowerCase().replace(/^www\./, "");
      if (data.domains.some((d) => d.name === normalized)) return;

      const now = new Date();
      const expires = new Date(now);
      expires.setFullYear(expires.getFullYear() + 1);
      const domain: DomainRecord = {
        id: crypto.randomUUID(),
        name: normalized,
        price: mode === "connect" ? 0 : price,
        status: "pending",
        purchasedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        dnsVerified: false,
      };
      persist({ ...data, domains: [...data.domains, domain] });
    },
    [data, persist]
  );

  const connectExistingDomain = useCallback(
    (name: string) => {
      purchaseDomain(name, 0, "connect");
    },
    [purchaseDomain]
  );

  const verifyDomainDns = useCallback(
    (domainId: string) => {
      if (!data) return;
      persist({
        ...data,
        domains: data.domains.map((d) =>
          d.id === domainId ? { ...d, dnsVerified: true, status: "active" } : d
        ),
      });
    },
    [data, persist]
  );

  const linkDomainToPage = useCallback(
    (domainId: string, pageId: string) => {
      if (!data) return;
      const domain = data.domains.find((d) => d.id === domainId);
      const page = data.landingPages.find((p) => p.id === pageId);
      if (!domain || !page) return;

      persist({
        ...data,
        domains: data.domains.map((d) =>
          d.id === domainId
            ? { ...d, linkedPageId: pageId }
            : d.linkedPageId === pageId
              ? { ...d, linkedPageId: undefined }
              : d
        ),
        landingPages: data.landingPages.map((p) =>
          p.id === pageId ? { ...p, customDomain: domain.name } : p
        ),
      });
    },
    [data, persist]
  );

  const crmMetrics = useMemo(() => {
    const empty = {
      pipelineValue: 0,
      wonValue: 0,
      winRate: 0,
      avgDeal: 0,
      byStage: { new: 0, qualified: 0, proposal: 0, won: 0, lost: 0 } as Record<LeadStatus, number>,
      recentLeads: 0,
    };
    if (!data) return empty;

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const byStage = { new: 0, qualified: 0, proposal: 0, won: 0, lost: 0 } as Record<LeadStatus, number>;
    let pipelineValue = 0;
    let wonValue = 0;
    let recentLeads = 0;

    for (const lead of data.leads) {
      byStage[lead.status]++;
      if (lead.status !== "lost") pipelineValue += lead.value;
      if (lead.status === "won") wonValue += lead.value;
      if (new Date(lead.updatedAt).getTime() >= weekAgo) recentLeads++;
    }

    const closed = byStage.won + byStage.lost;
    const winRate = closed > 0 ? (byStage.won / closed) * 100 : 0;
    const activeDeals = data.leads.filter((l) => l.status !== "won" && l.status !== "lost");
    const avgDeal =
      activeDeals.length > 0
        ? activeDeals.reduce((s, l) => s + l.value, 0) / activeDeals.length
        : 0;

    return { pipelineValue, wonValue, winRate, avgDeal, byStage, recentLeads };
  }, [data]);

  const canCreateLandingPage = useMemo(() => {
    if (!data) return false;
    const plan = normalizePlanId(data.workspace.plan);
    const lifetime = data.workspace.landingPagesCreatedTotal ?? 0;
    return canCreatePage(plan, data.landingPages.length, lifetime);
  }, [data]);

  const pageLimitReason = useMemo(() => {
    if (!data || canCreateLandingPage) return null;
    return getPageLimitMessage(normalizePlanId(data.workspace.plan), true);
  }, [data, canCreateLandingPage]);

  const value: WorkspaceContextValue = {
    data,
    ready,
    login,
    register,
    logout,
    updateProfile,
    updateWorkspace,
    updateNotifications,
    syncPlanFromStripe,
    hasStripeSubscription,
    createLandingPage,
    createLandingPageFromAI,
    updateLandingPage,
    deleteLandingPage,
    publishLandingPage,
    purchaseDomain,
    connectExistingDomain,
    verifyDomainDns,
    linkDomainToPage,
    getLandingPage,
    getLandingPageBySlug,
    incrementPageViews,
    addLead,
    updateLeadStatus,
    createChatbot,
    updateChatbot,
    deleteChatbot,
    toggleChatbotStatus,
    connectChatbot,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    completeOnboardingStep,
    metrics,
    crmMetrics,
    messageLogs: data?.messageLogs ?? [],
    canCreateLandingPage,
    pageLimitReason,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

function completeOnboardingStepInternal(
  data: VexaWorkspaceData,
  persist: (d: VexaWorkspaceData) => void,
  stepId: string
) {
  if (data.onboardingSteps.includes(stepId)) return;
  persist({ ...data, onboardingSteps: [...data.onboardingSteps, stepId] });
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
