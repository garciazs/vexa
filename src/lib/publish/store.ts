import { promises as fs } from "fs";
import path from "path";
import type { PageBlock } from "@/lib/store/types";
import type { TemplateTheme } from "@/lib/templates/catalog";

export interface PublishedPageRecord {
  slug: string;
  name: string;
  blocks: PageBlock[];
  theme: TemplateTheme;
  customDomain?: string;
  workspaceId: string;
  publishedAt: string;
}

export interface DomainMapping {
  domain: string;
  slug: string;
  workspaceId: string;
}

interface PublishStore {
  pages: Record<string, PublishedPageRecord>;
  domains: Record<string, DomainMapping>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "published-pages.json");

const EMPTY: PublishStore = { pages: {}, domains: {} };

async function ensureStore(): Promise<PublishStore> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw) as PublishStore;
  } catch {
    return { ...EMPTY };
  }
}

async function writeStore(store: PublishStore) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function getPublishedPage(slug: string): Promise<PublishedPageRecord | null> {
  const store = await ensureStore();
  return store.pages[slug] ?? null;
}

export async function getPageByDomain(domain: string): Promise<PublishedPageRecord | null> {
  const store = await ensureStore();
  const normalized = domain.toLowerCase().replace(/^www\./, "");
  const mapping = store.domains[normalized];
  if (!mapping) return null;
  return store.pages[mapping.slug] ?? null;
}

export async function publishPage(page: PublishedPageRecord) {
  const store = await ensureStore();
  store.pages[page.slug] = page;
  if (page.customDomain) {
    const d = page.customDomain.toLowerCase().replace(/^www\./, "");
    store.domains[d] = { domain: d, slug: page.slug, workspaceId: page.workspaceId };
  }
  await writeStore(store);
}

export async function unpublishPage(slug: string) {
  const store = await ensureStore();
  const page = store.pages[slug];
  if (page?.customDomain) {
    delete store.domains[page.customDomain.toLowerCase().replace(/^www\./, "")];
  }
  delete store.pages[slug];
  await writeStore(store);
}

export async function linkDomainToPage(domain: string, slug: string, workspaceId: string) {
  const store = await ensureStore();
  const d = domain.toLowerCase().replace(/^www\./, "");
  store.domains[d] = { domain: d, slug, workspaceId };
  if (store.pages[slug]) {
    store.pages[slug].customDomain = d;
  }
  await writeStore(store);
}

export async function unlinkDomain(domain: string) {
  const store = await ensureStore();
  const d = domain.toLowerCase().replace(/^www\./, "");
  const mapping = store.domains[d];
  if (mapping && store.pages[mapping.slug]) {
    delete store.pages[mapping.slug].customDomain;
  }
  delete store.domains[d];
  await writeStore(store);
}
