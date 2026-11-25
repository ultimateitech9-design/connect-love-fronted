export const MATCH_CELEBRATION_EVENT = 'connect-love-new-match';

export function announceNewMatch(id: string, userId: string) {
  window.dispatchEvent(new CustomEvent(MATCH_CELEBRATION_EVENT, { detail: { id, userId } }));
}

export const celebrationStorageKey = (userId: string) => `cl_match_celebrations_v1:${userId}`;
