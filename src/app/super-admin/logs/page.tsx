'use client';

import { useEffect, useMemo, useState } from 'react';
import { Activity, AlertCircle, Clock3, Filter, LogOut, Search, ScrollText } from 'lucide-react';
import { api } from '@/lib/api';
import { StatCard } from '@/components/admin/StatCard';
import { PageHeader } from '@/components/admin/PageHeader';

type StatusFilter = 'All' | 'Active' | 'Completed';

interface LogEntry {
  id: string;
  user: string;
  role: string;
  ip: string;
  device: string;
  loginAt?: string;
  lastActivityAt?: string;
  logoutAt?: string;
  durationSeconds?: number | null;
  status: 'Active' | 'Completed' | 'Event';
  activity: string;
}

const statusStyles: Record<LogEntry['status'], string> = {
  Active: 'bg-emerald-50 text-emerald-700',
  Completed: 'bg-blue-50 text-blue-700',
  Event: 'bg-slate-100 text-slate-700',
};

function formatDate(value?: string) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  }).format(new Date(value));
}

function formatDuration(totalSeconds?: number | null) {
  if (totalSeconds == null) return '-';
  const seconds = Math.max(0, totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}

function shortDevice(device: string) {
  if (device === 'Unknown device') return device;
  if (/mobile|android|iphone/i.test(device)) return 'Mobile browser';
  if (/edg/i.test(device)) return 'Microsoft Edge';
  if (/chrome/i.test(device)) return 'Google Chrome';
  if (/firefox/i.test(device)) return 'Mozilla Firefox';
  if (/safari/i.test(device)) return 'Safari';
  return device.length > 32 ? `${device.slice(0, 32)}...` : device;
}

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsError, setLogsError] = useState('');

  const fetchLogs = async () => {
    setLogsError('');
    try {
      const res = await api.logs();
      setAllLogs(res.logs.map((log) => ({
        id: log.id,
        user: log.user,
        role: (log.role || 'system').replaceAll('_', ' '),
        ip: log.ipAddress,
        device: log.device || 'Unknown device',
        loginAt: log.loginAt,
        lastActivityAt: log.lastActivityAt,
        logoutAt: log.logoutAt,
        durationSeconds: log.durationSeconds,
        status: log.loginAt ? (log.logoutAt ? 'Completed' : 'Active') : 'Event',
        activity: log.activity,
      })));
    } catch {
      setLogsError('Backend se logs load nahi hue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = window.setInterval(fetchLogs, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredLogs = useMemo(() => allLogs.filter((log) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || [log.user, log.role, log.ip, log.activity]
      .some((value) => value.toLowerCase().includes(query));
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [allLogs, searchQuery, statusFilter]);

  const sessionLogs = allLogs.filter((log) => log.loginAt);
  const activeCount = sessionLogs.filter((log) => log.status === 'Active').length;
  const completedCount = sessionLogs.filter((log) => log.status === 'Completed').length;
  const totalSeconds = sessionLogs.reduce((sum, log) => sum + (log.durationSeconds || 0), 0);

  return (
    <div>
      <PageHeader title="System Logs" description="User login, logout and session usage history." />

      {logsError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" /> {logsError}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Sessions" value={String(sessionLogs.length)} icon={ScrollText} tone="pink" onClick={() => setStatusFilter('All')} />
        <StatCard label="Active Now" value={String(activeCount)} icon={Activity} tone="blue" onClick={() => setStatusFilter('Active')} />
        <StatCard label="Logged Out" value={String(completedCount)} icon={LogOut} tone="violet" onClick={() => setStatusFilter('Completed')} />
        <StatCard label="Total Usage" value={formatDuration(totalSeconds)} icon={Clock3} tone="amber" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search user, role, IP..." className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary" />
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Filter className="h-3.5 w-3.5" /> Status:</span>
          {(['All', 'Active', 'Completed'] as const).map((filter) => (
            <button key={filter} onClick={() => setStatusFilter(filter)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${statusFilter === filter ? 'border-primary bg-primary text-primary-foreground shadow-sm' : 'border-border bg-card text-foreground hover:bg-accent'}`}>
              {filter}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">Showing {filteredLogs.length} of {allLogs.length} logs</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60">
              <tr>
                {['User', 'Login', 'Last Activity', 'Logout', 'Usage Time', 'IP / Device', 'Status'].map((column) => (
                  <th key={column} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-foreground">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="border-t border-border">
                  {Array.from({ length: 7 }).map((__, cell) => <td key={cell} className="px-4 py-3"><div className="h-5 animate-pulse rounded bg-muted" /></td>)}
                </tr>
              )) : filteredLogs.map((log) => (
                <tr key={log.id} className="border-t border-border transition-colors hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3"><div className="font-medium text-foreground">{log.user}</div><div className="text-xs capitalize text-muted-foreground">{log.role}</div></td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(log.loginAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(log.lastActivityAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDate(log.logoutAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-foreground">{formatDuration(log.durationSeconds)}</td>
                  <td className="px-4 py-3"><div className="whitespace-nowrap font-mono text-xs text-muted-foreground">{log.ip}</div><div className="whitespace-nowrap text-xs text-muted-foreground" title={log.device}>{shortDevice(log.device)}</div></td>
                  <td className="whitespace-nowrap px-4 py-3"><span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${statusStyles[log.status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{log.status === 'Event' ? log.activity : log.status}</span></td>
                </tr>
              ))}
              {!loading && filteredLogs.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No logs found matching your search.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
