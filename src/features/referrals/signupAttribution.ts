import { registrationReferralCode } from './shareInvitation';

const KEY = 'connect-love:pending-signup-referral';
type ReferralStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function browserStorage(): ReferralStorage | undefined {
  if (typeof window === 'undefined') return undefined;
  try { return window.localStorage; }
  catch { try { return window.sessionStorage; } catch { return undefined; } }
}

export function normalizedInvitationCode(value: string): string {
  return registrationReferralCode(`?ref=${encodeURIComponent(value.trim().toLowerCase())}`);
}

export function saveSignupReferral(value: string, storage = browserStorage()): string {
  const code = normalizedInvitationCode(value);
  try { if (code) storage?.setItem(KEY, code); else storage?.removeItem(KEY); } catch { /* The form still works without browser storage. */ }
  return code;
}

export function captureSignupReferral(search: string, storage = browserStorage()): string {
  const incoming = registrationReferralCode(search);
  if (incoming) return saveSignupReferral(incoming, storage);
  try { return normalizedInvitationCode(storage?.getItem(KEY) || ''); } catch { return ''; }
}

export function clearSignupReferral(storage = browserStorage()): void {
  try { storage?.removeItem(KEY); } catch { /* Private browsing can deny storage access. */ }
}
