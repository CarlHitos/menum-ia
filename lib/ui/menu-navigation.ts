// Session-only view state, scoped to the household and plan; never persisted in BD.
export function menuViewKey(householdId: string, planId: string) {
  return `menumia:menu-view:${householdId}:${planId}`;
}
export function readMenuDay(key: string, availableDays: string[], fallback: string) {
  try {
    const day = window.sessionStorage.getItem(`${key}:day`);
    return day && availableDays.includes(day) ? day : fallback;
  } catch {
    return fallback;
  }
}
export function rememberMenuDay(key: string, day: string) {
  try { window.sessionStorage.setItem(`${key}:day`, day); } catch { /* Storage can be unavailable. */ }
}
export function rememberMenuPosition(key: string) {
  try { window.sessionStorage.setItem(`${key}:return-scroll`, String(window.scrollY)); } catch { /* Keep navigation usable. */ }
}
export function takeMenuPosition(key: string): number | null {
  try {
    const stored = window.sessionStorage.getItem(`${key}:return-scroll`);
    window.sessionStorage.removeItem(`${key}:return-scroll`);
    if (stored === null || stored.trim() === "") return null;
    const position = Number(stored);
    return Number.isFinite(position) && position >= 0 ? position : null;
  } catch {
    return null;
  }
}

export function subscribeMenuDay(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}
