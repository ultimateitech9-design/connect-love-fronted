"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Heart, MessageCircle, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import { getToken, tokenUserId } from '@/lib/auth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { matchRequest } from '@/hooks/useMatchPage';
import { useCall } from '@/features/calls/CallProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { celebrationStorageKey, MATCH_CELEBRATION_EVENT } from './matchCelebration';
import styles from './MatchCelebration.module.css';

type Profile = { id: string; name: string; photos?: string[] };
type MatchProfile = { matchId: string; relationship: string; profile: Profile };

const flyingHearts = Array.from({ length: 26 }, (_, index) => ({
  left: `${(index * 37 + 3) % 100}%`,
  width: 18 + (index * 11) % 28,
  height: 18 + (index * 11) % 28,
  color: ['#ff327e', '#fb7185', '#ec4899', '#fda4af'][index % 4],
  animationDuration: `${7 + index % 6}s`,
  animationDelay: `${-((index * 1.3) % 10)}s`,
  '--drift': `${(index % 2 ? 1 : -1) * (35 + (index * 17) % 100)}px`,
} as CSSProperties));

function MatchPopup({ matchId, viewerId, token, me, onClose }: { matchId: string; viewerId: string; token: string; me: Profile; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { startCall, inCall } = useCall();
  const [calling, setCalling] = useState(false);
  const { data, isError } = useQuery({
    queryKey: ['matches', 'celebration-profile', viewerId, matchId],
    queryFn: ({ signal }) => matchRequest<MatchProfile>(`/matches/${encodeURIComponent(matchId)}/profile`, token, { signal }),
    staleTime: 0, gcTime: 0, retry: 1,
  });
  const visible = data?.relationship === 'matched';
  useEffect(() => { if (isError || (data && !visible)) onClose(); }, [data, visible, isError, onClose]);
  useEffect(() => {
    if (!visible) return;
    const dialog = ref.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = overflow; opener?.focus({ preventScroll: true }); };
  }, [visible]);
  if (!visible || !data) return null;
  const other = data.profile;
  const videoCall = async () => {
    if (calling || inCall) return;
    setCalling(true);
    try {
      const result = await startCall({ conversationId: matchId, otherUser: { id: other.id, name: other.name, photo: other.photos?.[0] || null }, callType: 'video' });
      if (result.error) { if (result.upgrade) onClose(); else toast.error(result.error); }
      else onClose();
    } catch { toast.error('Could not start the video call. Please try again.'); }
    finally { setCalling(false); }
  };
  return <dialog ref={ref} aria-labelledby="new-match-title" onCancel={event => { event.preventDefault(); if (!calling) onClose(); }} onClick={event => { if (event.target === event.currentTarget && !calling) onClose(); }} className={`${styles.scene} backdrop:bg-slate-950/65 backdrop:backdrop-blur-sm`}>
    <div aria-hidden="true" className={styles.sky} data-testid="match-flying-hearts">{flyingHearts.map((style, index) => <Heart key={index} className={styles.skyHeart} style={style} />)}</div>
    <section className="relative z-10 m-auto max-h-[90dvh] w-[min(92vw,390px)] max-w-none overflow-y-auto rounded-[28px] border-2 border-white bg-gradient-to-b from-pink-100 via-rose-50 to-white p-6 text-center text-slate-900 shadow-[0_0_45px_rgba(236,72,153,0.4)]">
    <button type="button" disabled={calling} aria-label="Close match popup" onClick={onClose} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-500 hover:bg-rose-100"><X className="h-4 w-4" /></button>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">{['left-4 top-10','right-5 top-20','left-6 top-44','right-4 top-48'].map((position, index) => <Heart key={position} className={`${styles.heart} absolute ${position} h-5 w-5 fill-pink-400 text-pink-400`} style={{ animationDelay: `${index * -0.6}s` }} />)}</div>
    <div className="relative mx-auto mb-5 mt-7 flex w-fit items-center justify-center px-3">
      <Avatar className="z-0 h-28 w-28 border-4 border-white shadow-lg"><AvatarImage loading="eager" className="object-cover" src={me.photos?.[0]} alt={`${me.name}'s profile photo`} /><AvatarFallback className="bg-rose-200 text-3xl">{me.name?.[0] || 'Y'}</AvatarFallback></Avatar>
      <Avatar className="-ml-4 h-28 w-28 border-4 border-white shadow-lg"><AvatarImage loading="eager" className="object-cover" src={other.photos?.[0]} alt={`${other.name}'s profile photo`} /><AvatarFallback className="bg-pink-200 text-3xl">{other.name?.[0] || '?'}</AvatarFallback></Avatar>
      <span className="absolute bottom-0 left-1/2 grid h-12 w-12 -translate-x-1/2 translate-y-1/4 place-items-center rounded-full border-4 border-white bg-pink-500 shadow"><Heart className="h-6 w-6 fill-white text-white" /></span>
    </div>
    <h2 id="new-match-title" className="relative mt-7 font-serif text-4xl font-bold italic text-pink-600">It&apos;s a Match!</h2>
    <p className="relative mt-3 break-words text-sm leading-6" style={{ color: '#334155' }}>{me.name} and {other.name} liked each other.<br />You&apos;re now a match! 🎉</p>
    <div className="relative mt-6 space-y-3"><Link href={`/user/messages?id=${encodeURIComponent(matchId)}`} onClick={onClose} className={`flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 px-4 py-3 text-sm font-bold text-white ${calling ? 'pointer-events-none opacity-50' : ''}`}><MessageCircle className="h-4 w-4" />Send Message</Link><button type="button" onClick={() => void videoCall()} disabled={calling || inCall} className="flex w-full items-center justify-center gap-2 rounded-full border border-pink-300 bg-white/70 px-4 py-3 text-sm font-bold text-pink-600 disabled:opacity-50"><Video className="h-4 w-4" />{calling ? 'Starting call...' : 'Start Video Call'}</button></div>
    </section>
  </dialog>;
}

export function MatchCelebrations() {
  const [token, setToken] = useState('');
  const [queue, setQueue] = useState<string[]>([]);
  const known = useRef<Set<string> | null>(null);
  const baselineReady = useRef(false);
  const viewerId = tokenUserId(token) || '';
  const { data: me } = useCurrentUser(token);
  const persist = useCallback(() => { try { localStorage.setItem(celebrationStorageKey(viewerId), JSON.stringify([...(known.current || [])].slice(-1000))); } catch {} }, [viewerId]);
  const enqueue = useCallback((id: string) => {
    if (!id || known.current?.has(id)) return;
    known.current ||= new Set(); known.current.add(id); persist();
    setQueue(current => current.includes(id) ? current : [...current, id]);
  }, [persist]);
  useEffect(() => { setToken(getToken() || ''); }, []);
  useEffect(() => {
    if (!viewerId) return;
    try { const saved = JSON.parse(localStorage.getItem(celebrationStorageKey(viewerId)) || 'null'); baselineReady.current = Array.isArray(saved); known.current = Array.isArray(saved) ? new Set(saved.filter(id => typeof id === 'string')) : null; } catch { known.current = null; baselineReady.current = false; }
    const receive = (event: Event) => { const detail = (event as CustomEvent).detail; if (getToken() === token && detail?.userId === viewerId && typeof detail.id === 'string') enqueue(detail.id); };
    window.addEventListener(MATCH_CELEBRATION_EVENT, receive);
    return () => window.removeEventListener(MATCH_CELEBRATION_EVENT, receive);
  }, [viewerId, token, enqueue]);
  const { data: snapshot } = useQuery({
    queryKey: ['matches', 'celebration-snapshot', viewerId],
    queryFn: ({ signal }) => matchRequest<{ ids: string[] }>('/matches/celebrations', token, { signal }),
    enabled: Boolean(viewerId), staleTime: 10000, refetchInterval: 15000,
  });
  useEffect(() => {
    if (!snapshot?.ids || !viewerId) return;
    if (!baselineReady.current) { baselineReady.current = true; known.current ||= new Set(); snapshot.ids.forEach(id => known.current!.add(id)); persist(); return; }
    snapshot.ids.forEach(enqueue);
  }, [snapshot, viewerId, enqueue, persist]);
  const close = useCallback(() => setQueue(current => current.slice(1)), []);
  if (!queue.length || !me || me.id !== viewerId) return null;
  return <MatchPopup key={queue[0]} matchId={queue[0]} viewerId={viewerId} token={token} me={me} onClose={close} />;
}
