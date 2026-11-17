'use client';

import { ArrowLeft, Banknote } from 'lucide-react';
import { API_ORIGIN } from '@/config/runtime';
import { getToken } from '@/lib/auth';
import { WithdrawPanel, type PayoutApi } from '@/features/payouts/WithdrawPanel';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_ORIGIN}${path}`, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}`, ...(init.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(Array.isArray(data?.message) ? data.message.join(' · ') : data?.message || 'Something went wrong.');
  return data as T;
}

const memberPayoutApi: PayoutApi = {
  balance: async () => {
    const me = await request<{ earnedCoinBalance?: number; user?: { earnedCoinBalance?: number } }>('/users/me');
    return Number(me.earnedCoinBalance ?? me.user?.earnedCoinBalance ?? 0);
  },
  listAccounts: () => request('/wallet/payout-accounts'),
  createAccount: (input) => request('/wallet/payout-accounts', { method: 'POST', body: JSON.stringify(input) }),
  updateAccount: (id, input) => request(`/wallet/payout-accounts/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteAccount: (id) => request(`/wallet/payout-accounts/${id}`, { method: 'DELETE' }),
  withdrawals: () => request('/wallet/withdrawals'),
  withdraw: (body) => request('/wallet/withdrawals', { method: 'POST', body: JSON.stringify(body) }),
};

export default function WithdrawPage() {
  return (
    <main className="min-h-screen px-4 py-8 text-foreground">
      <div className="mx-auto max-w-xl">
        <button onClick={() => window.history.back()} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Back</button>
        <section className="rounded-3xl border border-border bg-card p-6 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-600"><Banknote /></div>
            <div>
              <h1 className="text-2xl font-bold">Withdraw earnings</h1>
              <p className="text-sm text-muted-foreground">Coins you earned from gifts and calls. 1 coin = ₹1.</p>
            </div>
          </div>
          <WithdrawPanel api={memberPayoutApi} earningsLabel="Available earnings" />
        </section>
      </div>
    </main>
  );
}
