import { directFetch } from '@/lib/api';

export type FirstImpressionResult = { id: string; createdAt: string; remainingToday: number };

export function sendFirstImpression(receiverId: string, content: string) {
  return directFetch<FirstImpressionResult>('/first-impressions', {
    method: 'POST',
    body: JSON.stringify({ receiverId, content }),
  });
}
