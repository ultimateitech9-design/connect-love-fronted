'use client';

import { useEffect, useState, useMemo } from "react";
import { 
  DollarSign, 
  Receipt, 
  RotateCcw, 
  TrendingUp, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users
} from "lucide-react";
import { api } from "@/lib/api";

interface Transaction {
  id: string;
  user: string;
  plan: string;
  amount: number;
  status: string;
  date: string;
}

interface Plan {
  id: string;
  name: string;
  key: string;
  price: string;
  rawPrice: number;
  subscribers: number;
  status: string;
}

const monoLabel = "font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground";

export default function PaymentsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPaymentsData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.payments();
      setPlans(res.plans as Plan[] || []);
      setTransactions(res.transactions as Transaction[] || []);
    } catch {
      setError("Failed to load subscription and transaction data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const handleRefund = async (transactionId: string) => {
    if (!window.confirm("Are you sure you want to refund this transaction? This will mark the payment as refunded in the system.")) {
      return;
    }
    setActionLoading(transactionId);
    setError("");
    try {
      await api.refundPayment(transactionId);
      await fetchPaymentsData();
    } catch (err) {
      console.error(err);
      setError("Failed to process refund on backend.");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesStatus = statusFilter === "All" || t.status.toLowerCase() === statusFilter.toLowerCase();
      const queryText = query.toLowerCase().trim();
      const matchesQuery =
        !queryText ||
        t.user.toLowerCase().includes(queryText) ||
        t.plan.toLowerCase().includes(queryText) ||
        t.id.toLowerCase().includes(queryText);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, transactions]);

  // Calculations
  const stats = useMemo(() => {
    const successfulTx = transactions.filter(t => t.status === "successful");
    const totalRev = successfulTx.reduce((sum, t) => sum + t.amount, 0);
    const totalSubscribers = plans.reduce((sum, p) => sum + (p.key !== "free" ? p.subscribers : 0), 0);
    const refundedTx = transactions.filter(t => t.status === "refunded");
    const totalRefunded = refundedTx.reduce((sum, t) => sum + t.amount, 0);

    return {
      revenue: `$${totalRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subscribers: totalSubscribers,
      refunds: `$${totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      transactionsCount: transactions.length
    };
  }, [transactions, plans]);

  return (
    <div className="w-full relative pb-20 font-[Inter,sans-serif]">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Payments & Subscription Management</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Monitor transactional user sales, view plan subscribers, and manage billing refunds.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{loading ? "..." : stats.revenue}</h2>
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">Live</span> calculated from successful payments
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Premium Subscribers</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{loading ? "..." : stats.subscribers}</h2>
          <p className="text-[10px] text-muted-foreground mt-1">
            Total active paid plan members
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Refunded Capital</span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{loading ? "..." : stats.refunds}</h2>
          <p className="text-[10px] text-muted-foreground mt-1">
            Refunds processed in billing database
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Billings</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">{loading ? "..." : stats.transactionsCount}</h2>
          <p className="text-[10px] text-muted-foreground mt-1">
            Total transactional billing attempts
          </p>
        </div>
      </div>

      {/* Plan Performance Overview */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-base font-bold text-foreground mb-4">Subscription Plan Capacities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))
          ) : plans.map((plan) => (
            <div key={plan.id || plan.name} className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{plan.name}</p>
                <h4 className="text-lg font-bold text-foreground mt-1">{plan.price}</h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-primary">{plan.subscribers}</span>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Paid Members</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by customer, plan, ID..."
              className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative w-full sm:w-[160px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 w-full rounded-full border border-border bg-card px-4 pr-10 text-sm text-foreground outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="successful">Successful</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
              <Filter className="h-4 w-4" />
            </div>
          </div>

          {/* Clear Filters */}
          {(statusFilter !== "All" || query !== "") && (
            <button
              onClick={() => { setStatusFilter("All"); setQuery(""); }}
              className="text-xs text-secondary font-medium hover:underline px-2 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b border-border ${monoLabel}`}>
                <th className="text-left py-3.5 pl-6 font-mono">Transaction ID</th>
                <th className="text-left py-3.5 font-mono">Customer</th>
                <th className="text-left py-3.5 font-mono">Plan</th>
                <th className="text-left py-3.5 font-mono">Amount</th>
                <th className="text-left py-3.5 font-mono">Date</th>
                <th className="text-left py-3.5 font-mono">Status</th>
                <th className="text-right py-3.5 pr-6 font-mono">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="py-4 pl-6">
                        <div className="h-5 rounded bg-muted animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-4 pl-6 text-sm font-medium text-foreground font-mono">
                    {tx.id.substring(0, 8)}...
                  </td>
                  <td className="py-4 text-sm font-semibold text-foreground">
                    {tx.user}
                  </td>
                  <td className="py-4 text-sm text-foreground">
                    {tx.plan}
                  </td>
                  <td className="py-4 text-sm font-bold text-foreground">
                    ${tx.amount.toFixed(2)}
                  </td>
                  <td className="py-4 text-sm text-muted-foreground">
                    {tx.date}
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      tx.status === "successful" || tx.status === "Paid" 
                        ? "bg-emerald-50 text-emerald-700" 
                        : tx.status === "refunded" 
                        ? "bg-rose-50 text-rose-700" 
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {tx.status}
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-right">
                    {tx.status === "successful" && (
                      <button
                        onClick={() => handleRefund(tx.id)}
                        disabled={actionLoading === tx.id}
                        className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === tx.id ? "Refunding..." : "Refund"}
                      </button>
                    )}
                    {tx.status === "refunded" && (
                      <span className="text-xs text-muted-foreground font-semibold italic">Refunded</span>
                    )}
                    {tx.status !== "successful" && tx.status !== "refunded" && (
                      <span className="text-xs text-muted-foreground font-semibold">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-muted-foreground text-sm">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
