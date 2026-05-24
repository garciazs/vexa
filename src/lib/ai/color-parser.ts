export interface ParsedColors {
  primary?: string;
  accent?: string;
  background?: string;
  mode: "dark" | "light";
}

const NAMED: Record<string, string> = {
  preto: "#0a0a0a",
  black: "#0a0a0a",
  branco: "#fafafa",
  white: "#fafafa",
  branca: "#fafafa",
  vermelho: "#b91c1c",
  red: "#b91c1c",
  azul: "#1d4ed8",
  blue: "#1d4ed8",
  verde: "#15803d",
  green: "#15803d",
  dourado: "#c9a227",
  gold: "#c9a227",
  ouro: "#c9a227",
  marrom: "#78350f",
  brown: "#78350f",
  bege: "#d6cfc4",
  beige: "#d6cfc4",
  laranja: "#ea580c",
  orange: "#ea580c",
  roxo: "#7c3aed",
  purple: "#7c3aed",
  rosa: "#db2777",
  pink: "#db2777",
  cinza: "#525252",
  gray: "#525252",
  grey: "#525252",
  amarelo: "#ca8a04",
  yellow: "#ca8a04",
  turquesa: "#0d9488",
  teal: "#0d9488",
  vinho: "#881337",
  burgundy: "#881337",
  bordô: "#881337",
  bordo: "#881337",
  navy: "#1e3a5f",
  azulmarinho: "#1e3a5f",
  creme: "#f5f0e8",
  cream: "#f5f0e8",
};

function normalizeHex(raw: string): string | null {
  const h = raw.replace("#", "").trim();
  if (h.length === 3) {
    return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  }
  if (/^[0-9a-fA-F]{6}$/.test(h)) return `#${h.toLowerCase()}`;
  return null;
}

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function extractColorsFromPrompt(prompt: string): ParsedColors {
  const p = prompt.toLowerCase();
  const found: string[] = [];

  for (const match of prompt.matchAll(/#([0-9a-fA-F]{3,8})\b/g)) {
    const hex = normalizeHex(`#${match[1]}`);
    if (hex) found.push(hex);
  }

  for (const match of prompt.matchAll(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi)) {
    const hex = normalizeHex(
      `#${Number(match[1]).toString(16).padStart(2, "0")}${Number(match[2]).toString(16).padStart(2, "0")}${Number(match[3]).toString(16).padStart(2, "0")}`
    );
    if (hex) found.push(hex);
  }

  for (const [name, hex] of Object.entries(NAMED)) {
    if (new RegExp(`\\b${name}\\b`, "i").test(p)) found.push(hex);
  }

  const unique = [...new Set(found)];

  const wantsDark = /escur[oa]|dark|noite|black|preto|elegante|premium|sóbri[oa]/.test(p);
  const wantsLight = /clar[oa]|light|branc[oa]|minimal|clean|limpo|pastel/.test(p);

  let primary = unique[0];
  let accent = unique[1] ?? unique[0];
  let background = unique[2];

  if (!primary) {
    if (wantsLight) {
      primary = "#1a1a1a";
      accent = "#c9a227";
      background = "#f8f6f3";
    } else if (wantsDark) {
      primary = "#c9a227";
      accent = "#d4af37";
      background = "#0c0c0c";
    }
  }

  if (primary && !accent) accent = primary;
  if (primary && !background) {
    background = luminance(primary) > 0.55 || wantsLight ? "#f8f6f3" : "#0a0a0a";
  }

  const mode: "dark" | "light" =
    wantsLight || (background && luminance(background) > 0.55) ? "light" : "dark";

  return { primary, accent, background, mode };
}

export function themeFromColors(colors: ParsedColors): "midnight" | "clean" | "launch" | "saas" {
  if (colors.mode === "light") return "clean";
  if (colors.primary && /d4af37|c9a227|f59e0b|amber|gold/i.test(colors.primary + colors.accent))
    return "launch";
  if (colors.primary && /06b6d4|0891b2|cyan|2563eb|1d4ed8/i.test(colors.primary + colors.accent))
    return "saas";
  return "midnight";
}
