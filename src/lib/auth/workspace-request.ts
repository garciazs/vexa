/** Valida que o workspaceId do body corresponde ao cookie da sessão */
export function getWorkspaceIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)vexa_workspace=([^;]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

export function assertWorkspaceMatchesRequest(
  cookieHeader: string | null,
  workspaceId: string
): boolean {
  const bound = getWorkspaceIdFromCookie(cookieHeader);
  if (!bound) return true;
  return bound === workspaceId;
}
