import { normalizeText } from "@/lib/ai/conversation-brain";

/** Pedido de agendamento / demo / marcação */
export function isSchedulingRequest(text: string): boolean {
  const n = normalizeText(text);
  return (
    /\b(marcacao|agendar|agendamento|reservar|reserva|demo|reuniao|horario|consulta|booking|call)\b/.test(n) ||
    /preciso de (uma )?(marcacao|demo|reuniao|consulta|horario|agendamento)/.test(n) ||
    /quero (agendar|marcar|uma demo|uma reuniao|uma consulta)/.test(n)
  );
}

export function answerSchedulingRequest(): string {
  return "Claro! Para agendar uma demo ou conversa de 15 min, indique o **melhor dia e hora** (ex: terça às 15h). Prefere falar com a equipa agora? Digite **humano**.";
}
