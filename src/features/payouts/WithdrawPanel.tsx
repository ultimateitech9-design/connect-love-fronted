"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Banknote, Building2, CheckCircle2, Loader2, Pencil, Plus, Smartphone, Trash2, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";

export type PayoutAccount = {
  id: string;
  method: "bank" | "upi";
  accountHolder: string | null;
  bankName: string | null;
  ifsc: string | null;
  accountNumberMasked: string | null;
  upiId: string | null;
};

export type PayoutForm = { method: "bank" | "upi"; accountHolder: string; accountNumber: string; bankName: string; ifsc: string; upiId: string };

export type WithdrawalItem = { id: string; coins: number; amountPaise: number | null; status: "pending" | "completed" | "rejected"; createdAt: string; method: string | null; account: string | null };

/** How the panel talks to the server: members and agents use different endpoints. */
export type PayoutApi = {
  balance: () => Promise<number>;
  listAccounts: () => Promise<PayoutAccount[]>;
  createAccount: (input: PayoutForm) => Promise<PayoutAccount>;
  updateAccount: (id: string, input: PayoutForm) => Promise<PayoutAccount>;
  deleteAccount: (id: string) => Promise<unknown>;
  withdrawals: () => Promise<{ minimum: number; items: WithdrawalItem[] }>;
  withdraw: (body: { coins: number; accountId?: string; payout?: PayoutForm; saveAccount?: boolean }) => Promise<{ message?: string }>;
};

const EMPTY_FORM: PayoutForm = { method: "bank", accountHolder: "", accountNumber: "", bankName: "", ifsc: "", upiId: "" };
const NEW = "new";

const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

function accountLabel(account: PayoutAccount) {
  return account.method === "upi"
    ? account.upiId
    : `${account.bankName ?? "Bank"} · ${account.accountNumberMasked ?? ""}`;
}

function AccountFields({ form, onChange, editingBankNumber }: { form: PayoutForm; onChange: (form: PayoutForm) => void; editingBankNumber?: string | null }) {
  const set = (key: keyof PayoutForm, value: string) => onChange({ ...form, [key]: value });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {(["bank", "upi"] as const).map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => set("method", method)}
            className={cn("flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold", form.method === method ? "border-rose-400 bg-rose-50 text-rose-600 dark:bg-rose-500/10" : "border-border")}
          >
            {method === "bank" ? <Building2 className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
            {method === "bank" ? "Bank account" : "UPI"}
          </button>
        ))}
      </div>
      {form.method === "upi" ? (
        <input value={form.upiId} onChange={(e) => set("upiId", e.target.value)} className={inputClass} placeholder="UPI ID, e.g. name@okicici" autoComplete="off" />
      ) : (
        <>
          <input value={form.accountHolder} onChange={(e) => set("accountHolder", e.target.value)} className={inputClass} placeholder="Account holder name" autoComplete="name" />
          <input
            value={form.accountNumber}
            onChange={(e) => set("accountNumber", e.target.value.replace(/[^\d]/g, ""))}
            className={inputClass}
            inputMode="numeric"
            placeholder={editingBankNumber ? `Account number (leave blank to keep ${editingBankNumber})` : "Account number"}
            autoComplete="off"
          />
          <input value={form.bankName} onChange={(e) => set("bankName", e.target.value)} className={inputClass} placeholder="Bank name" />
          <input value={form.ifsc} onChange={(e) => set("ifsc", e.target.value.toUpperCase())} className={cn(inputClass, "uppercase")} placeholder="IFSC code, e.g. SBIN0001234" maxLength={11} autoComplete="off" />
        </>
      )}
    </div>
  );
}

export function WithdrawPanel({ api, earningsLabel }: { api: PayoutApi; earningsLabel: string }) {
  const [balance, setBalance] = useState<number | null>(null);
  const [minimum, setMinimum] = useState(500);
  const [accounts, setAccounts] = useState<PayoutAccount[]>([]);
  const [history, setHistory] = useState<WithdrawalItem[]>([]);
  const [selected, setSelected] = useState<string>(NEW);
  const [form, setForm] = useState<PayoutForm>(EMPTY_FORM);
  const [saveAccount, setSaveAccount] = useState(true);
  const [editing, setEditing] = useState<PayoutAccount | null>(null);
  const [editForm, setEditForm] = useState<PayoutForm>(EMPTY_FORM);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    const [nextBalance, nextAccounts, nextHistory] = await Promise.all([api.balance(), api.listAccounts(), api.withdrawals()]);
    setBalance(nextBalance);
    setAccounts(nextAccounts);
    setHistory(nextHistory.items);
    setMinimum(nextHistory.minimum);
    return nextAccounts;
  }, [api]);

  useEffect(() => {
    refresh()
      .then((list) => { if (list.length) setSelected(list[0].id); })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Wallet could not be loaded."));
  }, [refresh]);

  const run = async (action: () => Promise<void>) => {
    setError("");
    setMessage("");
    setBusy(true);
    try { await action(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Something went wrong."); } finally { setBusy(false); }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const coins = Number(amount);
    if (!Number.isInteger(coins) || coins < minimum) return setError(`Minimum withdrawal is ${minimum} coins.`);
    if (balance !== null && coins > balance) return setError(`You can withdraw up to ${balance} coins.`);
    void run(async () => {
      const result = selected === NEW
        ? await api.withdraw({ coins, payout: form, saveAccount })
        : await api.withdraw({ coins, accountId: selected });
      setMessage(result.message || "Withdrawal request submitted.");
      setAmount("");
      setForm(EMPTY_FORM);
      const list = await refresh();
      if (selected === NEW && saveAccount && list.length) setSelected(list[0].id);
    });
  };

  const startEdit = (account: PayoutAccount) => {
    setEditing(account);
    setEditForm({ method: account.method, accountHolder: account.accountHolder ?? "", accountNumber: "", bankName: account.bankName ?? "", ifsc: account.ifsc ?? "", upiId: account.upiId ?? "" });
  };

  const saveEdit = () => editing && run(async () => {
    await api.updateAccount(editing.id, editForm);
    setEditing(null);
    setMessage("Account updated.");
    await refresh();
  });

  const remove = (account: PayoutAccount) => {
    if (!window.confirm(`Delete ${accountLabel(account)}?`)) return;
    void run(async () => {
      await api.deleteAccount(account.id);
      const list = await refresh();
      if (selected === account.id) setSelected(list[0]?.id ?? NEW);
    });
  };

  const statusStyle = { pending: "bg-amber-50 text-amber-700", completed: "bg-emerald-50 text-emerald-700", rejected: "bg-rose-50 text-rose-700" } as const;
  const statusText = { pending: "Pending", completed: "Paid", rejected: "Rejected (coins returned)" } as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl bg-amber-50 p-4 text-slate-900 dark:bg-amber-500/10 dark:text-amber-100">
        <span className="flex items-center gap-2 font-semibold"><WalletCards className="h-5 w-5 text-amber-600" /> {earningsLabel}</span>
        <strong className="text-xl text-amber-700 dark:text-amber-300">{balance ?? "—"} coins</strong>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-semibold">
          Amount (minimum {minimum} coins = ₹{minimum})
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={minimum} max={balance ?? undefined} className={cn(inputClass, "mt-1")} placeholder="Enter coins" />
        </label>
        <div className="-mt-3 flex flex-wrap gap-2">
          {[minimum, minimum * 2].filter((value) => balance === null || value <= balance).map((value) => (
            <button key={value} type="button" onClick={() => setAmount(String(value))} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{value}</button>
          ))}
          {balance !== null && balance >= minimum && <button type="button" onClick={() => setAmount(String(balance))} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">All ({balance})</button>}
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-semibold">Pay to</legend>
          {accounts.map((account) => (
            <div key={account.id} className={cn("rounded-xl border p-3", selected === account.id ? "border-rose-400 bg-rose-50/60 dark:bg-rose-500/10" : "border-border")}>
              {editing?.id === account.id ? (
                <div className="space-y-3">
                  <AccountFields form={editForm} onChange={setEditForm} editingBankNumber={account.method === "bank" ? account.accountNumberMasked : null} />
                  <div className="flex gap-2">
                    <button type="button" disabled={busy} onClick={() => void saveEdit()} className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Save changes</button>
                    <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-4 py-2 text-xs font-bold text-muted-foreground">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input type="radio" name="payout-account" checked={selected === account.id} onChange={() => setSelected(account.id)} className="h-4 w-4 accent-rose-600" aria-label={accountLabel(account) ?? "Saved account"} />
                  <button type="button" onClick={() => setSelected(account.id)} className="min-w-0 flex-1 text-left">
                    <span className="flex items-center gap-1.5 text-sm font-bold">
                      {account.method === "bank" ? <Building2 className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                      <span className="truncate">{accountLabel(account)}</span>
                    </span>
                    {account.method === "bank" && <span className="block truncate text-xs text-muted-foreground">{account.accountHolder} · {account.ifsc}</span>}
                  </button>
                  <button type="button" onClick={() => startEdit(account)} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label="Edit account" title="Edit"><Pencil className="h-4 w-4" /></button>
                  <button type="button" onClick={() => remove(account)} className="grid h-8 w-8 place-items-center rounded-full text-rose-500 hover:bg-rose-50" aria-label="Delete account" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              )}
            </div>
          ))}
          <div className={cn("rounded-xl border p-3", selected === NEW ? "border-rose-400 bg-rose-50/60 dark:bg-rose-500/10" : "border-border")}>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-bold">
              <input type="radio" name="payout-account" checked={selected === NEW} onChange={() => setSelected(NEW)} className="h-4 w-4 accent-rose-600" />
              <Plus className="h-4 w-4" /> {accounts.length ? "Add a new account" : "Add your bank account or UPI"}
            </label>
            {selected === NEW && (
              <div className="mt-3 space-y-3">
                <AccountFields form={form} onChange={setForm} />
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <input type="checkbox" checked={saveAccount} onChange={(e) => setSaveAccount(e.target.checked)} className="accent-rose-600" />
                  Save this account for next time
                </label>
              </div>
            )}
          </div>
        </fieldset>

        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
        {message && <p className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4 shrink-0" /> {message}</p>}

        <button disabled={busy || (balance !== null && balance < minimum)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-fuchsia-600 px-4 py-3 font-bold text-white disabled:opacity-50">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Banknote className="h-5 w-5" />}
          {busy ? "Please wait…" : "Submit withdrawal request"}
        </button>
        {balance !== null && balance < minimum && <p className="text-center text-xs text-muted-foreground">You need at least {minimum} coins to withdraw.</p>}
      </form>

      {history.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold">Your requests</h2>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {history.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                <span className="min-w-0">
                  <span className="block font-bold">₹{((item.amountPaise ?? item.coins * 100) / 100).toLocaleString("en-IN")} <span className="font-normal text-muted-foreground">({item.coins} coins)</span></span>
                  <span className="block truncate text-xs text-muted-foreground">{item.account || item.method} · {new Date(item.createdAt).toLocaleDateString()}</span>
                </span>
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-xs font-bold", statusStyle[item.status])}>{statusText[item.status]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
