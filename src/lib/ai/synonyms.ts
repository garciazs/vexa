/** Expansão de sinónimos e typos comuns em PT — melhora matching sem LLM externa */

export const SYNONYM_GROUPS: string[][] = [
  ["preco", "preço", "valor", "custo", "quanto", "euro", "mensal", "barato", "caro"],
  ["plano", "planos", "assinatura", "subscricao", "pacote", "tier"],
  ["site", "pagina", "página", "landing", "website", "loja"],
  ["publicar", "online", "live", "ativo", "colocar", "subir"],
  ["dominio", "domínio", "dns", "url", "link", "endereco", "endereço"],
  ["automacao", "automação", "workflow", "fluxo", "automatico", "automático"],
  ["chatbot", "bot", "assistente", "whatsapp", "instagram", "dm"],
  ["crm", "lead", "leads", "cliente", "pipeline", "venda", "vendas"],
  ["ia", "inteligencia", "inteligência", "artificial", "gerador", "criar"],
  ["problema", "erro", "bug", "nao funciona", "não funciona", "travou", "quebrado"],
  ["ajuda", "suporte", "help", "duvida", "dúvida", "como"],
  ["cancelar", "cancelamento", "desistir", "parar", "reembolso"],
  ["demo", "reuniao", "reunião", "agendar", "marcar", "call", "conversar"],
  ["humano", "atendente", "pessoa", "operador", "equipa", "equipe"],
  ["template", "modelo", "tema", "design"],
  ["login", "entrar", "conta", "cadastro", "registar", "registrar", "senha", "password"],
  ["pagamento", "cartao", "cartão", "stripe", "fatura", "cobranca", "cobrança"],
  ["analytics", "metricas", "métricas", "relatorio", "relatório", "dados"],
];

export const TYPO_MAP: Record<string, string> = {
  preco: "preco",
  preço: "preco",
  automacao: "automacao",
  automação: "automacao",
  dominio: "dominio",
  domínio: "dominio",
  pagina: "pagina",
  página: "pagina",
  inteligencia: "ia",
  inteligência: "ia",
  nao: "nao",
  não: "nao",
  funciona: "funciona",
  obrigado: "obrigado",
  obrigada: "obrigado",
  planos: "plano",
  chatbots: "chatbot",
  leads: "lead",
};

export function expandSynonyms(tokens: string[]): string[] {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    for (const group of SYNONYM_GROUPS) {
      const normalized = group.map((g) => g.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
      const tokenNorm = token.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (normalized.some((g) => g.includes(tokenNorm) || tokenNorm.includes(g))) {
        normalized.forEach((g) => expanded.add(g));
      }
    }
    if (TYPO_MAP[token]) expanded.add(TYPO_MAP[token]);
  }
  return [...expanded];
}

/** Distância simples — aceita typos de 1-2 chars em palavras curtas */
export function fuzzyMatch(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 3 || b.length < 3) return a.startsWith(b) || b.startsWith(a);
  if (Math.abs(a.length - b.length) > 2) return false;
  let diff = 0;
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i] !== b[i]) diff++;
    if (diff > 2) return false;
  }
  return true;
}

export function tokensMatchQuery(queryTokens: string[], targetTokens: string[]): number {
  let score = 0;
  const expanded = expandSynonyms(queryTokens);
  for (const qt of expanded) {
    for (const tt of targetTokens) {
      if (qt === tt) score += 2;
      else if (fuzzyMatch(qt, tt)) score += 1.5;
      else if (qt.length > 4 && (tt.includes(qt) || qt.includes(tt))) score += 1;
    }
  }
  return score;
}
