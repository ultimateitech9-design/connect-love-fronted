export const THEME_STORAGE_KEY = "connect-love-theme";
export type AppTheme = "light" | "dark";

export function getStoredTheme(): AppTheme {
  if (typeof window === "undefined") return "light";
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(theme: AppTheme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new CustomEvent("connect-love-theme-change", { detail: theme }));
}
