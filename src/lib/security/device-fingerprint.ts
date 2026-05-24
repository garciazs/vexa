const STORAGE_KEY = "vexa_device_fp";

/** Identificador estável do browser — enviado nas APIs de quota/IA */
export function getDeviceFingerprint(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const parts = [
      navigator.userAgent,
      navigator.language,
      String(screen.width),
      String(screen.height),
      String(screen.colorDepth),
      Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
    ];
    const raw = parts.join("|");
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const fp = `fp_${Math.abs(hash).toString(36)}_${Date.now().toString(36).slice(-4)}`;
    localStorage.setItem(STORAGE_KEY, fp);
    return fp;
  } catch {
    return "fp_unknown";
  }
}
