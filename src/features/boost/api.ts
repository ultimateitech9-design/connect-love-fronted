import { directFetch } from '@/lib/api';
export type BoostPlanKey = '30_minutes' | '1_hour' | '3_hours' | '24_hours';
export type BoostPlan = { key: BoostPlanKey; name: string; durationMinutes: number; price: number; currency: 'INR' };
export const getBoostPlans = () => directFetch<BoostPlan[]>('/boosts/plans');
export const getBoostStatus = () => directFetch<{ active: boolean; boost: { endsAt: string } | null }>('/boosts/status');
export const activateBoost = (planKey: BoostPlanKey, requestId: string) => directFetch<{ endsAt: string }>('/boosts/activate', { method: 'POST', body: JSON.stringify({ planKey, requestId }) });
