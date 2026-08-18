import { directFetch } from '@/lib/api';
export type BoostPlanKey = '30_minutes' | '1_hour' | '3_hours' | '24_hours';
export type BoostPlan = { key: BoostPlanKey; name: string; durationMinutes: number; price: number; currency: 'INR' };
export const getBoostPlans = () => directFetch<BoostPlan[]>('/boosts/plans');
export const getBoostStatus = () => directFetch<{ active: boolean; boost: { endsAt: string } | null }>('/boosts/status');
export type BoostOrder = { keyId: string; orderId: string; amount: number; currency: 'INR'; planName: string; customer: { name?: string; email?: string } };
export const createBoostOrder = (planKey: BoostPlanKey) => directFetch<BoostOrder>('/payments/razorpay/boost/order', { method: 'POST', body: JSON.stringify({ planKey }) });
export const verifyBoostPayment = (payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => directFetch<{ success: boolean; endsAt: string }>('/payments/razorpay/verify', { method: 'POST', body: JSON.stringify(payment) });
