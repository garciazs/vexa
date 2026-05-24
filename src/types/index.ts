export type LeadStatus = "new" | "qualified" | "proposal" | "won" | "lost";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  score: number;
  value: number;
  status: LeadStatus;
  source: string;
  lastContact: string;
  tags: string[];
}

export interface LandingPage {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published";
  conversionRate: number;
  views: number;
  leads: number;
  updatedAt: string;
  thumbnail: string;
}

export interface Chatbot {
  id: string;
  name: string;
  status: "active" | "paused" | "training";
  channel: "web" | "whatsapp" | "instagram";
  conversations: number;
  conversionRate: number;
  responseTime: string;
  lastActive: string;
}

export interface Automation {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  status: "active" | "paused";
  runs: number;
  lastRun: string;
}

export interface AnalyticsMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
}

export interface PipelineStage {
  id: LeadStatus;
  title: string;
  leads: Lead[];
}

export interface BuilderBlock {
  id: string;
  type: string;
  label: string;
  content: Record<string, string>;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  conversionRate: number;
  uses: number;
  premium: boolean;
}
