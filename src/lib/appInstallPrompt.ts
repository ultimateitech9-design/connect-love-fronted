export const APP_INSTALL_PROMPT_PENDING_KEY =
  "connect-love-app-install-prompt-pending";

export function markAppInstallPromptPending() {
  try {
    window.sessionStorage.setItem(APP_INSTALL_PROMPT_PENDING_KEY, "true");
  } catch {
    // Registration should still complete if browser storage is unavailable.
  }
}
