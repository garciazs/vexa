/** Cookie de sessão — bloqueia APIs internas a visitantes anónimos */

export function setSessionCookie(workspaceId: string | null) {
  if (typeof document === "undefined") return;
  if (workspaceId) {
    document.cookie = `vexa_session=1; path=/; max-age=31536000; SameSite=Lax`;
    document.cookie = `vexa_workspace=${encodeURIComponent(workspaceId)}; path=/; max-age=31536000; SameSite=Lax`;
  } else {
    document.cookie = "vexa_session=; path=/; max-age=0; SameSite=Lax";
    document.cookie = "vexa_workspace=; path=/; max-age=0; SameSite=Lax";
  }
}

export function syncSessionCookie(workspaceId: string | null) {
  setSessionCookie(workspaceId);
}
