'use client';

import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, BadgeCheck, Loader2, Search } from 'lucide-react';
import { ProfileCard } from '@/features/user/ProfileCard';
import { clearDiscoverySearchCache, discoverySearchThumbnails as thumbnails, getDiscoverySearchThumbnail, getDiscoveryProfileDetails, recordProfileDetailView, searchDiscoveryProfiles, swipeProfile, type DiscoveryFilters } from './api';
import { getToken } from '@/lib/auth';
import { toast } from 'sonner';
import { AvatarPresence } from '@/features/presence/presence';

function SearchPhoto({ profile }: { profile: any }) {
  const [photo, setPhoto] = useState<string | null>(profile.photo || null);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (profile.photo || !profile.hasPhoto) return;
    const key = (getToken() || '') + ':' + profile.id;
    const cached = thumbnails.get(key);
    if (cached && Date.now() - cached.at < 30000) { setPhoto(cached.photo); return; }
    const controller = new AbortController();
    const load = () => {
      void getDiscoverySearchThumbnail(profile.id, controller.signal).then(data => {
        if (controller.signal.aborted) return;
        if (thumbnails.size >= 100) thumbnails.delete(thumbnails.keys().next().value!);
        thumbnails.set(key, { photo: data.photo, at: Date.now() }); setPhoto(data.photo);
      }).catch(() => {});
    };
    const observer = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer?.disconnect(); load(); }
    }, { rootMargin: '100px' }) : null;
    if (observer && ref.current) observer.observe(ref.current); else load();
    return () => { controller.abort(); observer?.disconnect(); };
  }, [profile.id, profile.photo, profile.hasPhoto]);
  return <span className="relative shrink-0"><span ref={ref} className="grid h-14 w-14 place-items-center overflow-hidden rounded-xl bg-rose-500/10 font-bold text-rose-500">
    {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : profile.name?.charAt(0)}
  </span><AvatarPresence userId={profile.id} className="-bottom-0.5 -right-0.5" /></span>;
}

export function DiscoverSearchResults({ filters, pending, onUpgrade, canUsePremiumActions }: {
  filters: DiscoveryFilters; pending: boolean; onUpgrade: (message: string) => void; canUsePremiumActions: boolean;
}) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [more, setMore] = useState(false);
  const [acting, setActing] = useState(false);
  const [photoRevision, setPhotoRevision] = useState(0);
  const generation = useRef(0);
  const cursor = useRef<string | undefined>(undefined);
  const request = useRef<AbortController | null>(null);
  const actingRef = useRef(false);
  const key = JSON.stringify(filters);
  useEffect(() => {
    const refreshPhotos = () => setPhotoRevision(previous => previous + 1);
    window.addEventListener('profilePhotosChanged', refreshPhotos);
    return () => window.removeEventListener('profilePhotosChanged', refreshPhotos);
  }, []);
  const load = async (append: boolean, run = generation.current) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true); setError('');
    try {
      const data = await searchDiscoveryProfiles({ ...filters, cursor: append ? cursor.current : undefined, limit: 12 }, controller.signal);
      if (run !== generation.current || controller.signal.aborted) return;
      setItems(previous => {
        const merged = append ? [...previous, ...data.items] : data.items;
        return [...new Map(merged.map(profile => [profile.id, profile])).values()];
      });
      cursor.current = data.nextCursor || undefined;
      setMore(Boolean(data.hasMore && data.nextCursor));
    } catch (e) {
      if (!controller.signal.aborted && run === generation.current) setError(e instanceof Error ? e.message : 'Could not load results.');
    } finally {
      if (!controller.signal.aborted && run === generation.current) setLoading(false);
    }
  };
  useEffect(() => {
    const run = ++generation.current;
    request.current?.abort(); cursor.current = undefined;
    setItems([]); setSelected(null); setMore(false);
    if (!pending) void load(false, run);
    return () => { generation.current++; request.current?.abort(); };
  }, [key, pending, photoRevision]);

  const open = async (profile: any) => {
    void recordProfileDetailView(profile.id).catch(() => {});
    const cached = thumbnails.get((getToken() || '') + ':' + profile.id);
    setSelected({ ...profile, photo: profile.photo || cached?.photo || null });
    const run = generation.current;
    try {
      const details = await getDiscoveryProfileDetails(profile.id);
      if (run === generation.current) setSelected((current: any) => current?.id === profile.id ? { ...current, ...details, photo: details.photos?.[0] || null, photos: details.photos || [] } : current);
    } catch { /* The result already includes the primary card photo. */ }
  };
  const act = async (id: string, action: string) => {
    if (selected?.relationshipStatus === 'MATCHED') {
      toast.info('You are already matched. Use Message to open your conversation.');
      return false;
    }
    if (actingRef.current) return false;
    const run = generation.current;
    actingRef.current = true; setActing(true);
    try {
      const result = await swipeProfile(id, action === 'right' || action === 'like' ? 'like' : action === 'super' || action === 'superlike' ? 'superlike' : 'pass');
      void queryClient.invalidateQueries({ queryKey: ['matches'] });
      clearDiscoverySearchCache();
      if (run !== generation.current) return true;
      setItems(previous => previous.filter(profile => profile.id !== id)); setSelected(null);
      if (result?.status === 'MATCHED') window.location.href = '/user/messages?id=' + result.id;
      return true;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not save action.';
      if (/limit|upgrade your plan/i.test(message)) onUpgrade(message); else toast.error(message);
      return false;
    } finally { actingRef.current = false; setActing(false); }
  };
  if (selected && !pending) return <div className="w-full min-w-0">
    <button type="button" disabled={acting} onClick={() => setSelected(null)} className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-rose-500"><ArrowLeft size={16} />Back to search results</button>
    {selected.relationshipStatus === 'MATCHED' && <div className="mb-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><span>Already matched</span><a className="font-bold underline" href={'/user/messages?id=' + encodeURIComponent(selected.relationshipId)}>Message</a></div>}
    <ProfileCard key={selected.id} profiles={[selected]} onAction={act} onUndo={() => {}} canUndo={false} canUsePremiumActions={canUsePremiumActions} onPremiumActionLocked={() => onUpgrade('Upgrade your plan to use this feature.')} />
  </div>;
  return <section aria-label="Profile search results" aria-busy={loading || pending} className="w-full min-w-0 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground"><Search size={18} className="text-rose-500" />Search results</h2>
    <p className="mt-1 text-sm text-muted-foreground">People matching “{filters.search}” within your current filters. Select a profile to open it.</p>
    {pending ? <p role="status" className="py-8 text-center text-muted-foreground">Searching...</p> : <>
      <div className="mt-4 space-y-2">{items.map(profile => <button type="button" key={profile.id} onClick={() => void open(profile)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-3 text-left transition hover:border-rose-300 hover:bg-rose-500/5 focus-visible:outline-rose-500">
        <SearchPhoto profile={profile} />
        <span className="min-w-0 flex-1"><span className="flex items-center gap-1 font-semibold text-foreground"><span className="truncate">{profile.name}, {profile.age}</span>{profile.isVerified && <BadgeCheck size={16} className="shrink-0 text-blue-500" />}</span><span className="block truncate text-xs text-muted-foreground">{[profile.city, profile.profession].filter(Boolean).join(' · ')}</span></span>
        <span className="shrink-0 text-xs font-semibold text-rose-500">View profile</span>
      </button>)}</div>
      {loading && <p role="status" className="flex justify-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 size={18} className="animate-spin" />Loading profiles...</p>}
      {error && <div role="alert" className="mt-4 text-sm text-rose-500"><p>{error}</p><button type="button" onClick={() => void load(items.length > 0)} className="mt-2 font-bold underline">Try again</button></div>}
      {!loading && !error && !items.length && <p role="status" className="py-8 text-center text-sm text-muted-foreground">No eligible profiles found. Try another name or broaden your filters.</p>}
      {more && !loading && !error && <button type="button" onClick={() => void load(true)} className="mt-4 w-full rounded-xl bg-rose-500 px-4 py-3 text-sm font-bold text-white">Load more profiles</button>}
    </>}
  </section>;
}
