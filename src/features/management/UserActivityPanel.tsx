'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Phone, Users, Video } from 'lucide-react';
import { callDuration, type UserActivity } from './userActivity';

export function UserActivityPanel({ userId, initial, loadPage }: { userId: string; initial?: UserActivity; loadPage: (page: number) => Promise<UserActivity> }) {
  const [data, setData] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const request = useRef(0);
  useEffect(() => { request.current++; setData(initial); setError(''); setBusy(false); }, [userId, initial]);
  async function changePage(page: number) {
    const current = ++request.current; setBusy(true); setError('');
    try { const next = await loadPage(page); if (current === request.current) setData(next); }
    catch (err) { if (current === request.current) setError(err instanceof Error ? err.message : 'Unable to load call history.'); }
    finally { if (current === request.current) setBusy(false); }
  }
  if (!data) return null;
  return <section className="mt-6 space-y-4 text-slate-800" aria-label="Friends and call activity">
    <h3 className="text-base font-semibold">Friends &amp; call activity</h3>
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {[[Users, 'Friends', String(data.friendCount)], [Phone, 'Audio talk time', callDuration(data.summary.audioSeconds)], [Video, 'Video talk time', callDuration(data.summary.videoSeconds)]].map(([Icon, label, value]) => {
        const Symbol = Icon as typeof Users;
        return <div key={String(label)} className="rounded-xl border border-rose-100 bg-rose-50/50 p-3"><Symbol className="mb-2 h-4 w-4 text-rose-500" /><p className="text-[11px] text-slate-500">{String(label)}</p><strong className="mt-1 block text-sm">{String(value)}</strong></div>;
      })}
    </div>
    <details className="rounded-xl border border-slate-200 bg-white p-3"><summary className="cursor-pointer text-sm font-semibold">Friends ({data.friendCount})</summary><p className="mt-2 text-xs text-slate-500">Friends are mutual matches. Showing up to {data.friendsLimit} recent connections.</p>{data.friends.length ? <ul className="mt-3 space-y-2">{data.friends.map(friend => <li key={friend.id} className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-2 text-xs"><span>{friend.name}</span><span className="text-slate-500">{friend.city || 'Location not provided'}</span></li>)}</ul> : <p className="mt-3 text-xs text-slate-500">No friends yet.</p>}</details>
    <div className="rounded-xl border border-slate-200 bg-white p-3"><h4 className="text-sm font-semibold">Talk time by person</h4><p className="mt-1 text-xs text-slate-500">Completed calls only. Most recent {data.contactsLimit} contacts.</p>{data.contacts.length ? <div className="mt-3 space-y-3">{data.contacts.map(person => <div key={person.id} className="border-t border-slate-100 pt-3"><p className="text-xs font-semibold">{person.name}</p><p className="mt-1 text-xs leading-6 text-slate-500">Audio: {callDuration(person.audioSeconds)} ({person.audioCalls} calls)<br />Video: {callDuration(person.videoSeconds)} ({person.videoCalls} calls)</p></div>)}</div> : <p className="mt-3 text-xs text-slate-500">No calls yet.</p>}</div>
    <div className="rounded-xl border border-slate-200 bg-white p-3"><h4 className="text-sm font-semibold">Call history ({data.totalCalls})</h4>{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}<div className="mt-3 space-y-3">{data.calls.map(call => <article key={call.id} className="border-t border-slate-100 pt-3 text-xs"><div className="flex flex-wrap justify-between gap-2"><strong>{call.peerName}</strong><span className="capitalize text-rose-600">{call.callType} &middot; {call.direction}</span></div><p className="mt-1 leading-6 text-slate-500">{new Date(call.createdAt).toLocaleString('en-IN')}<br /><span className="capitalize">{call.status}</span> &middot; {call.status === 'active' ? 'In progress' : callDuration(call.durationSeconds)}</p></article>)}{!data.calls.length && <p className="text-xs text-slate-500">No call history.</p>}</div>{data.pages > 1 && <div className="mt-4 flex items-center justify-between gap-2 text-xs"><button type="button" disabled={busy || data.page <= 1} onClick={() => void changePage(data.page - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 disabled:opacity-40"><ArrowLeft size={14} />Previous</button><span>{data.page} / {data.pages}</span><button type="button" disabled={busy || data.page >= data.pages} onClick={() => void changePage(data.page + 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-2 disabled:opacity-40">Next<ArrowRight size={14} /></button></div>}</div>
  </section>;
}
