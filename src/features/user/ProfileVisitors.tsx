'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Loader2, LockKeyhole, MapPin, UserRound, X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AvatarPresence } from '@/features/presence/presence';
import { directFetch } from '@/lib/api';

type Visitor = { id: string; userId?: string; name?: string; photo: string | null; viewedAt: string };
type Page = { locked: boolean; items: Visitor[]; hasMore: boolean; nextOffset: number };

export function ProfileVisitors({ userId }: { userId: string }) {
  const router = useRouter();
  const queries = useQueryClient();
  const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['profile-visitors', userId],
    queryFn: ({ pageParam, signal }) => directFetch<Page>('/users/me/profile-visitors?offset=' + pageParam, { signal }),
    initialPageParam: 0,
    getNextPageParam: page => page.hasMore ? page.nextOffset : undefined,
    enabled: Boolean(userId), staleTime: 5000, refetchInterval: 15000,
  });
  const locked = data?.pages[0]?.locked ?? true;
  const visitors = [...new Map((data?.pages.flatMap(page => page.items) || []).map(visitor => [visitor.id, visitor])).values()];
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [detailError, setDetailError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const request = useRef<AbortController | null>(null);
  const list = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const refresh = () => { void queries.invalidateQueries({ queryKey: ['profile-visitors', userId] }); };
    window.addEventListener('billingChanged', refresh);
    return () => { window.removeEventListener('billingChanged', refresh); request.current?.abort(); };
  }, [queries, userId]);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  useEffect(() => { if (locked) { setOpen(false); setDetails(null); } }, [locked]);
  const close = () => { request.current?.abort(); setOpen(false); setDetails(null); };
  const openVisitor = async (visitor: Visitor) => {
    if (locked || !visitor.userId) { router.push('/user/premium'); return; }
    request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    setDetails(null); setDetailError(''); setOpen(true);
    try {
      const profile = await directFetch<any>('/users/me/profile-visitors/' + encodeURIComponent(visitor.userId) + '/details', { signal: controller.signal });
      if (!controller.signal.aborted) setDetails(profile);
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : 'Could not open this profile.';
      if (/Activate Gold or Diamond/i.test(message)) { close(); void refetch(); router.push('/user/premium'); }
      else setDetailError(message);
    }
  };
  const tile = (visitor: Visitor) => <>
    <span className="relative">
      <Avatar className="h-12 w-12 border border-rose-200">
        <AvatarImage src={visitor.photo || undefined} alt="" className={locked ? 'blur-[2px]' : ''} />
        <AvatarFallback className="bg-rose-50 text-rose-300">{locked ? <UserRound size={24} /> : visitor.name?.charAt(0)}</AvatarFallback>
      </Avatar>
      {locked && <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-card bg-rose-500 text-white"><LockKeyhole size={10} /></span>}
      {!locked && visitor.userId && <AvatarPresence userId={visitor.userId} />}
    </span>
    <span className="block w-full truncate text-[10px] font-semibold text-foreground">{locked ? 'Hidden visitor' : visitor.name}</span>
  </>;
  if (!visitors.length) return null;

  return <>
    <section aria-label="Profile visitors" className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
      <header className="border-b border-border px-5 py-4">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground"><Eye size={17} className="text-rose-500" />Who viewed your profile</h3>
        <p className="mt-1 text-xs text-muted-foreground">{locked ? 'Unlock visitors with Gold or Diamond' : 'People who opened your profile'}</p>
      </header>
      <ul ref={list} aria-label="People who viewed your profile" tabIndex={0} onScroll={event => {
        const element = event.currentTarget;
        if (element.scrollHeight - element.scrollTop - element.clientHeight < 60 && hasNextPage && !isFetchingNextPage) void fetchNextPage();
      }} className="grid max-h-[176px] grid-cols-3 gap-x-2 gap-y-4 overflow-y-auto overscroll-contain p-3 [scrollbar-width:thin]">
        {visitors.map(visitor => <li key={visitor.id} className="min-w-0">
          {locked ? <Link href="/user/premium" aria-label="Upgrade to reveal profile visitor" className="flex h-[68px] flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-rose-500/5">{tile(visitor)}</Link> :
            <button type="button" onClick={() => void openVisitor(visitor)} className="flex h-[68px] w-full flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-rose-500/5">{tile(visitor)}</button>}
        </li>)}
      </ul>
      {isPending && <p role="status" className="px-4 pb-4 text-center text-xs text-muted-foreground">Loading visitors...</p>}
      {!isPending && !isError && !visitors.length && <p className="px-4 pb-4 text-center text-xs text-muted-foreground">No profile visitors yet.</p>}
      {isFetchingNextPage && <p role="status" className="pb-3 text-center text-xs text-muted-foreground">Loading more...</p>}
      {isError && <button type="button" onClick={() => void refetch()} className="w-full px-4 pb-4 text-xs font-semibold text-rose-500">Could not load visitors. Try again</button>}
    </section>
    <dialog ref={dialog} onCancel={close} onClick={event => { if (event.target === dialog.current) close(); }} aria-labelledby="profile-visitor-title" className="m-auto max-h-[85dvh] w-[min(92vw,420px)] overflow-y-auto rounded-3xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-slate-950/60">
      <div className="relative">
        <button type="button" onClick={close} aria-label="Close visitor profile" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-card/95 text-foreground shadow"><X size={18} /></button>
        <h2 id="profile-visitor-title" className="sr-only">Visitor profile</h2>
        {!details && !detailError && <div className="grid min-h-52 place-items-center"><Loader2 className="animate-spin text-rose-500" aria-label="Loading profile" /></div>}
        {detailError && <p role="alert" className="p-8 text-sm text-rose-500">{detailError}</p>}
        {details && <>
          {details.photos?.[0] && <img src={details.photos[0]} alt="" className="max-h-72 w-full object-cover" />}
          <div className="space-y-4 p-5">
            <h3 className="text-xl font-bold">{details.name}{details.age ? ', ' + details.age : ''}</h3>
            {details.city && <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin size={15} />{details.city}</p>}
            {details.profession && <p className="text-sm text-muted-foreground">{details.profession}</p>}
            {details.bio && <div><h4 className="mb-1 text-sm font-bold">About me</h4><p className="whitespace-pre-wrap text-sm text-muted-foreground">{details.bio}</p></div>}
            <div className="flex flex-wrap gap-2">{[details.religion, details.relationshipGoal, details.zodiac, details.height].filter(Boolean).map((value, index) => <span key={index} className="rounded-full bg-rose-500/10 px-3 py-1 text-xs text-rose-600">{value}</span>)}</div>
            {details.photos?.slice(1).map((photo: string, index: number) => <img key={index} src={photo} alt={'Profile photo ' + (index + 2)} className="w-full rounded-2xl object-cover" loading="lazy" />)}
          </div>
        </>}
      </div>
    </dialog>
  </>;
}
