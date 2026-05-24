export type PlanId = "free" | "starter" | "growth" | "scale";
export type LeadStatus = "new" | "qualified" | "proposal" | "won" | "lost";
export type PageStatus = "draft" | "published";
export type BotStatus = "active" | "paused" | "training";
export type AutoStatus = "active" | "paused";
export type BotChannel = "web" | "whatsapp" | "instagram";
export type BotNodeType = "message" | "options" | "delay";
export type AutomationTrigger = "new_lead" | "lead_qualified" | "form_submit" | "chat_started";
export type AutomationChannel = "whatsapp" | "instagram" | "web_chat" | "email";

export type BotPersonalityId =
  | "support"
  | "sales"
  | "consultant"
  | "onboarding"
  | "closer"
  | "premium";

export interface BotKnowledgeItem {
  id: string;
  title: string;
  content: string;
  keywords?: string[];
  source?: "faq" | "url" | "document" | "system";
}

export interface BotFlowNode {
  id: string;
  type: BotNodeType;
  text?: string;
  options?: { label: string; nextId: string }[];
  delayMinutes?: number;
  nextId?: string;
}

export interface PageBlock {
  id: string;
  type: string;
  label: string;
  content: Record<string, string>;
}

export interface LandingPageRecord {
  id: string;
  name: string;
  slug: string;
  status: PageStatus;
  blocks: PageBlock[];
  views: number;
  leadsCount: number;
  templateId?: string;
  theme?: "midnight" | "clean" | "launch" | "saas";
  customDomain?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainRecord {
  id: string;
  name: string;
  price: number;
  status: "pending" | "active" | "expired";
  purchasedAt: string;
  expiresAt: string;
  linkedPageId?: string;
  dnsVerified: boolean;
}

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  score: number;
  value: number;
  status: LeadStatus;
  source: string;
  tags: string[];
  updatedAt: string;
}

export interface ChatbotRecord {
  id: string;
  name: string;
  status: BotStatus;
  channel: BotChannel;
  welcomeMessage?: string;
  fallbackMessage?: string;
  flows?: BotFlowNode[];
  personality?: BotPersonalityId;
  knowledgeBase?: BotKnowledgeItem[];
  /** Se true, usa só knowledge custom (sem defaults VEXA) */
  useCustomKnowledgeOnly?: boolean;
  smartMode?: boolean;
  connected?: boolean;
  connectedAccount?: string;
  conversations: number;
  conversionRate: number;
  createdAt: string;
}

export interface AutomationAction {
  id: string;
  channel: AutomationChannel;
  message: string;
  delayMinutes: number;
}

export interface AutomationRecord {
  id: string;
  name: string;
  trigger: AutomationTrigger | string;
  actions: AutomationAction[] | string[];
  status: AutoStatus;
  smartMode?: boolean;
  runs: number;
  lastRunAt?: string;
  createdAt: string;
}

export interface MessageLog {
  id: string;
  automationId: string;
  automationName: string;
  leadId?: string;
  leadName?: string;
  channel: AutomationChannel;
  message: string;
  delayMinutes: number;
  status: "sent" | "queued";
  scheduledFor: string;
  sentAt?: string;
  intent?: string;
  sentiment?: string;
  buyingIntent?: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  slug: string;
  plan: PlanId;
  domain?: string;
  /** Total de sites já publicados (Free: 1 publicação) */
  landingPagesPublishedTotal?: number;
  /** Total de sites já criados — Free bloqueia IA após 1 */
  landingPagesCreatedTotal?: number;
  /** Quota sincronizada do servidor (anti-bypass) */
  serverPagesCreated?: number;
  serverPagesPublished?: number;
}

export interface NotificationPrefs {
  newLeads: boolean;
  qualifiedLeads: boolean;
  automations: boolean;
  weeklyReport: boolean;
}

export interface VexaWorkspaceData {
  user: UserRecord;
  workspace: WorkspaceRecord;
  landingPages: LandingPageRecord[];
  leads: LeadRecord[];
  chatbots: ChatbotRecord[];
  automations: AutomationRecord[];
  domains: DomainRecord[];
  messageLogs: MessageLog[];
  onboardingSteps: string[];
  notifications: NotificationPrefs;
}

export const PIPELINE_STAGES: { id: LeadStatus; title: string }[] = [
  { id: "new", title: "Novos" },
  { id: "qualified", title: "Qualificados" },
  { id: "proposal", title: "Proposta" },
  { id: "won", title: "Ganhos" },
  { id: "lost", title: "Perdidos" },
];

export const ONBOARDING_STEPS = [
  { id: "workspace", title: "Criar workspace" },
  { id: "template", title: "Escolher template" },
  { id: "publish", title: "Publicar landing page" },
  { id: "chatbot", title: "Ativar chatbot" },
  { id: "automation", title: "Configurar automação" },
] as const;
