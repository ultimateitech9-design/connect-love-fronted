'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Coins, Search, WalletCards } from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { directFetch } from '@/lib/api';

type Row = {
  id: string;
  type: 'recharge' | 'gift' | 'theme' | 'withdrawal';
  status: string;
  grossCoins: number;
  userCoins: number;
  platformCoins: number;
  label?: string;
  payoutAccount?: string;
  createdAt: string;
  user?: { name: string; email: string } | null;
  sender?: { name: string; email: string } | null;
  receiver?: { name: string; email: string } | null;
};

export default function TransactionsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [withdrawalsOnly, setWithdrawalsOnly] = useState(false);
  const [commissionOnly, setCommissionOnly] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    directFetch<Row[]>('/users/admin/coin-transactions')
      .then(setRows)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Transactions could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const scoped = withdrawalsOnly
      ? rows.filter((row) => row.type === 'withdrawal')
      : commissionOnly
        ? rows.filter((row) => Number(row.platformCoins) > 0)
        : rows;
    if (!term) return scoped;
    return scoped.filter((row) => [row.type, row.status, row.label, row.user?.name, row.user?.email, row.sender?.name, row.receiver?.name]
      .some((value) => String(value || '').toLowerCase().includes(term)));
  }, [query, rows, withdrawalsOnly, commissionOnly]);

  const showAllTransactions = () => {
    setWithdrawalsOnly(false);
    setCommissionOnly(false);
  };

  const showCommissionTransactions = () => {
    setCommissionOnly(true);
    setWithdrawalsOnly(false);
  };

  const showWithdrawalTransactions = () => {
    setWithdrawalsOnly(true);
    setCommissionOnly(false);
  };

  const updateWithdrawal = async (row: Row, status: 'completed' | 'rejected') => {
    const action = status === 'completed' ? 'mark this transfer successful' : 'reject this withdrawal and return the earnings';
    if (!confirm(`Are you sure you want to ${action}?`)) return;
    setActionId(row.id);
    try {
      await directFetch(`/users/admin/coin-transactions/${row.id}/withdrawal`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, status } : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Withdrawal could not be updated.');
    } finally {
      setActionId(null);
    }
  };

  const totalCommission = rows.reduce((sum, row) => sum + Number(row.platformCoins || 0), 0);
  const pendingWithdrawals = rows.filter((row) => row.type === 'withdrawal' && row.status === 'pending').reduce((sum, row) => sum + row.grossCoins, 0);

  return <div>
    <PageHeader title="Transaction History" description="Wallet recharges, gifts, user earnings, platform commission and withdrawal requests." />
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Stat label="Transactions" value={String(rows.length)} icon={<WalletCards className="h-5 w-5" />} active={!withdrawalsOnly && !commissionOnly} onClick={showAllTransactions} />
      <Stat label="Platform commission" value={`${totalCommission} coins`} icon={<Coins className="h-5 w-5" />} active={commissionOnly} onClick={showCommissionTransactions} />
      <Stat label="Pending withdrawals" value={`${pendingWithdrawals} coins`} icon={<ArrowUpRight className="h-5 w-5" />} active={withdrawalsOnly} onClick={showWithdrawalTransactions} />
    </div>
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border p-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search user, email or transaction..." className="w-full bg-transparent text-sm text-black outline-none placeholder:text-slate-500" />
        {withdrawalsOnly && <button type="button" onClick={showAllTransactions} className="shrink-0 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600">Showing withdrawals ×</button>}
        {commissionOnly && <button type="button" onClick={showAllTransactions} className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">Showing commission ×</button>}
      </div>
      {error ? <p className="p-6 text-sm text-rose-600">{error}</p> : loading ? <p className="p-6 text-sm text-muted-foreground">Loading transactions...</p> : (
        <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm text-black [&_.text-muted-foreground]:!text-slate-700">
          <thead className="bg-slate-50 text-xs uppercase text-slate-700"><tr>
            <th className="px-4 py-3">Type</th><th className="px-4 py-3">User / Sender</th><th className="px-4 py-3">Receiver</th><th className="px-4 py-3">Gross</th><th className="px-4 py-3">User 80%</th><th className="px-4 py-3">Platform 20%</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th>
          </tr></thead>
          <tbody className="text-black">{filtered.map((row) => <tr key={row.id} className="border-t border-border bg-white text-black">
            <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 font-semibold capitalize">{row.type === 'recharge' || row.type === 'gift' ? <ArrowDownLeft className="h-4 w-4 text-emerald-500" /> : <ArrowUpRight className="h-4 w-4 text-rose-500" />}{row.type}</span><div className="text-xs text-muted-foreground">{row.label}</div></td>
            <td className="px-4 py-3 font-medium">{row.sender?.name || row.user?.name || 'Platform'}<div className="text-xs font-normal text-muted-foreground">{row.sender?.email || row.user?.email}</div></td>
            <td className="px-4 py-3">{row.receiver?.name || '—'}<div className="text-xs text-muted-foreground">{row.receiver?.email}</div></td>
            <td className="px-4 py-3 font-bold">{row.grossCoins}</td><td className="px-4 py-3 text-emerald-600">{row.userCoins}</td><td className="px-4 py-3 text-amber-600">{row.platformCoins}</td>
            <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${row.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : row.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{row.status === 'completed' ? 'Successful' : row.status}</span>{row.payoutAccount && <div className="mt-1 text-xs text-muted-foreground">{row.payoutAccount}</div>}{row.type === 'withdrawal' && row.status === 'pending' && <div className="mt-2 flex gap-1.5"><button disabled={actionId === row.id} onClick={() => updateWithdrawal(row, 'completed')} className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-bold text-white disabled:opacity-50">Mark Successful</button><button disabled={actionId === row.id} onClick={() => updateWithdrawal(row, 'rejected')} className="rounded-md bg-rose-50 px-2 py-1 text-[10px] font-bold text-rose-600 disabled:opacity-50">Reject</button></div>}</td>
            <td className="px-4 py-3 text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</td>
          </tr>)}</tbody>
        </table></div>
      )}
    </div>
  </div>;
}

function Stat({ label, value, icon, onClick, active }: { label: string; value: string; icon: React.ReactNode; onClick?: () => void; active?: boolean }) {
  const className = `w-full rounded-2xl border bg-card p-4 text-left shadow-sm transition ${onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''} ${active ? 'border-rose-400 ring-2 ring-rose-100' : 'border-border'}`;
  const content = <><div className="mb-2 text-rose-500">{icon}</div><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-1 text-xl font-bold text-foreground">{value}</p></>;
  return onClick ? <button type="button" onClick={onClick} className={className}>{content}</button> : <div className={className}>{content}</div>;
}
