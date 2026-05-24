/** Cookie de sessão — bloqueia APIs internas a visitantes anónimos */

export function setSessionCookie(active: boolean) {
  if (typeof document === "undefined") return;
  if (active) {
    document.cookie = "vexa_session=1; path=/; max-age=31536000; SameSite=Lax";
  } else {
    document.cookie = "vexa_session=; path=/; max-age=0; SameSite=Lax";
  }
}

export function syncSessionCookie(hasWorkspace: boolean) {
  setSessionCookie(hasWorkspace);
}
