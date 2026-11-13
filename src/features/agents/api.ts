import { API_ORIGIN } from '@/config/runtime';
import type { UserActivity } from '@/features/management/userActivity';

const KEY = 'connectlove_agent_token';
export const agentToken = () => typeof window === 'undefined' ? null : sessionStorage.getItem(KEY);
export const saveAgentToken = (token: string) => sessionStorage.setItem(KEY, token);
export const clearAgentToken = () => sessionStorage.removeItem(KEY);
export class AgentApiError extends Error { constructor(message: string, public status: number) { super(message); } }
export async function agentRequest<T>(path: string, body?: unknown): Promise<T> {
  const token = agentToken();
  const response = await fetch(`${API_ORIGIN}/agents${path}`, {
    method: body === undefined ? 'GET' : 'POST', cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new AgentApiError(Array.isArray(data.message) ? data.message.join(' · ') : data.message || 'Something went wrong. Please try again.', response.status);
  return data;
}
export type Agent = { id: string; name: string; email: string };
export type ManagedUser = { id: string; name: string; email: string; phone?: string; birthDate: string; gender: string; city: string; profession?: string; bio?: string; photos?: string[]; status: string; createdAt: string; onboardingCompleted: boolean; activity?: UserActivity };
export type UsersResult = { users: ManagedUser[]; total: number; totalAccounts: number; activeAccounts: number; page: number; pages: number };
export type UserDraft = { name: string; email: string; password: string; birthDate: string; gender: string; city: string; phone: string; profession: string; bio: string; photos: string[] };
export const emptyDraft = (): UserDraft => ({ name: '', email: '', password: '', birthDate: '', gender: 'female', city: '', phone: '', profession: '', bio: '', photos: [] });
