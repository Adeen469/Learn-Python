export const THEME_KEY = "lp_theme";
export const THEME_CHANGED_EVENT = "lp-theme-changed";

export type Theme = "dark" | "light";

export function getStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function applyTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage unavailable — the class still applies for this visit.
  }
  document.documentElement.classList.toggle("light", theme === "light");
  window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
}
