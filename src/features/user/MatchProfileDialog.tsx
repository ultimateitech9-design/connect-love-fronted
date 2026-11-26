"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban, BadgeCheck, ChevronLeft, ChevronRight, Clock, Heart, Loader2, MapPin, Star, UserRound, X } from "lucide-react";
import { matchRequest, MatchRequestError } from "@/hooks/useMatchPage";
import { formatDistance } from "@/lib/distance";

type Relationship = "matched" | "received" | "pending" | "blocked";
type Profile = {
  id: string; name: string; age: number | null; gender?: string; city?: string; bio?: string;
  profession?: string; height?: string; religion?: string; relationshipGoal?: string; zodiac?: string;
  photos: string[]; photosHidden?: boolean; isVerified: boolean; showOnlineStatus: boolean; isOnline: boolean;
  interests: string[]; hobbies: string[]; personality: string[]; distanceKm: number | null;
};
type MatchProfile = { matchId: string; relationship: Relationship; isSuperLike: boolean; since: string; profile: Profile };
const statusInfo = {
  matched: { title: "Matched", description: "You and this member have matched.", icon: Heart, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  received: { title: "Like received", description: "This member liked your profile.", icon: Heart, color: "bg-rose-50 text-rose-600 border-rose-200" },
  pending: { title: "Request pending", description: "Your like is waiting for their response.", icon: Clock, color: "bg-amber-50 text-amber-700 border-amber-200" },
  blocked: { title: "Blocked", description: "You blocked this member. Messaging and calls are restricted.", icon: Ban, color: "bg-slate-100 text-slate-600 border-slate-200" },
};

function Tags({ title, values }: { title: string; values?: string[] }) {
  if (!values?.length) return null;
  return <section><h3 className="mb-2 text-sm font-bold text-slate-800">{title}</h3><div className="flex flex-wrap gap-2">{[...new Set(values)].map(value => <span key={value} className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs text-rose-700">{value}</span>)}</div></section>;
}

export function MatchProfileDialog({ matchId, viewerId, token, onClose }: { matchId: string; viewerId: string; token: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [unavailable, setUnavailable] = useState(false);
  const queries = useQueryClient();
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: ['matches', 'profile', viewerId, matchId],
    queryFn: ({ signal }) => matchRequest<MatchProfile>(`/matches/${encodeURIComponent(matchId)}/profile`, token, { signal }),
    enabled: !unavailable,
    staleTime: 0, gcTime: 0, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false,
  });
  useEffect(() => {
    if (!(error instanceof MatchRequestError) || error.status !== 404) return;
    setUnavailable(true);
    // Remove the stale card without re-requesting this unavailable profile.
    void queries.invalidateQueries({ queryKey: ['matches'], predicate: query => query.queryKey[1] !== 'profile' && query.queryKey[1] !== 'celebration-profile' });
  }, [error, queries]);
  useEffect(() => {
    const element = dialog.current;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = overflow; opener?.focus({ preventScroll: true }); };
  }, []);
  const profile = data?.profile;
  const photos = profile?.photos || [];
  const currentPhoto = Math.min(photoIndex, Math.max(0, photos.length - 1));
  const status = data ? statusInfo[data.relationship] : null;
  const StatusIcon = status?.icon || Heart;
  const distance = formatDistance(profile?.distanceKm);

  return <dialog ref={dialog} aria-labelledby="match-profile-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="m-auto max-h-[92dvh] w-[min(94vw,900px)] max-w-none overflow-y-auto overscroll-contain rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/65 backdrop:backdrop-blur-sm">
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900">
      <div><p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Member profile</p><h2 id="match-profile-title" className="text-lg font-bold">{profile?.name || "Profile details"}</h2></div>
      <button type="button" onClick={onClose} aria-label="Close profile" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-rose-500"><X className="h-5 w-5" /></button>
    </header>
    {isPending ? <div role="status" className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin" />Loading profile...</div> : unavailable ? <div role="status" className="space-y-4 p-8 text-center"><h3 className="font-semibold">Profile unavailable</h3><p className="text-sm text-slate-600 dark:text-slate-300">{error instanceof Error ? error.message : "This profile or request is no longer available."}</p><p className="text-xs text-slate-500">Your matches have been refreshed.</p><button type="button" onClick={onClose} className="rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white">Back to matches</button></div> : error ? <div role="alert" className="space-y-4 p-8 text-center"><p className="text-sm text-rose-600">{error instanceof Error ? error.message : "This profile could not be opened."}</p>{/activate a plan/i.test(error.message) ? <Link href="/user/premium" className="inline-block rounded-full bg-rose-500 px-5 py-2 text-sm font-bold text-white">View Plans</Link> : <button type="button" disabled={isFetching} onClick={() => void refetch()} className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold">{isFetching ? "Loading..." : "Try again"}</button>}</div> : profile && data && status ? <>
      <div className="border-b border-slate-100 px-5 py-4"><span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${status.color}`}><StatusIcon className="h-3.5 w-3.5" />{status.title}</span>{data.isSuperLike && data.relationship !== 'blocked' && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600"><Star className="h-3 w-3 fill-current" />Super Like</span>}<p className="mt-2 text-xs text-slate-500">{status.description}</p></div>
      <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-label="Profile photos" className="min-w-0 bg-slate-50 p-4 sm:p-5">
          <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-2xl bg-slate-100">
            {photos.length ? <img src={photos[currentPhoto]} alt={`${profile.name} — photo ${currentPhoto + 1} of ${photos.length}`} className="h-full w-full object-contain" /> : <div className="px-5 text-center text-slate-400"><UserRound className="mx-auto mb-3 h-16 w-16" /><p className="text-sm">{profile.photosHidden ? "Photos are visible to matches only." : "No profile photos added."}</p></div>}
            {photos.length > 1 && <><button type="button" aria-label="Previous photo" onClick={() => setPhotoIndex((currentPhoto - 1 + photos.length) % photos.length)} className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow"><ChevronLeft className="h-5 w-5" /></button><button type="button" aria-label="Next photo" onClick={() => setPhotoIndex((currentPhoto + 1) % photos.length)} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 shadow"><ChevronRight className="h-5 w-5" /></button></>}
            {!!photos.length && <span aria-live="polite" className="absolute bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">{currentPhoto + 1} / {photos.length}</span>}
          </div>
          {photos.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-2">{photos.map((photo, index) => <button type="button" key={index} aria-label={`View photo ${index + 1}`} aria-pressed={currentPhoto === index} onClick={() => setPhotoIndex(index)} className={`h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${currentPhoto === index ? 'border-rose-500' : 'border-transparent'}`}><img src={photo} alt="" loading="lazy" className="h-full w-full object-cover" /></button>)}</div>}
        </section>
        <div className="min-w-0 space-y-5 p-5 sm:p-6">
          <div><h3 className="break-words text-2xl font-bold">{profile.name}{profile.age != null && `, ${profile.age}`}{profile.isVerified && <BadgeCheck aria-label="Verified profile" className="ml-2 inline h-6 w-6 text-blue-500" />}</h3>{profile.showOnlineStatus && <p className={`mt-1 flex items-center gap-1.5 text-xs ${profile.isOnline ? 'text-emerald-600' : 'text-slate-400'}`}><span className={`h-2 w-2 rounded-full ${profile.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />{profile.isOnline ? 'Online' : 'Offline'}</p>}{(profile.city || distance) && <p className="mt-3 flex items-start gap-1.5 text-sm text-slate-500"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span>{[profile.city, distance].filter(Boolean).join(' · ')}</span></p>}</div>
          {profile.bio && <section><h3 className="mb-2 text-sm font-bold">About me</h3><p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{profile.bio}</p></section>}
          <dl className="grid grid-cols-2 gap-3">{([['Gender', profile.gender], ['Profession', profile.profession], ['Height', profile.height], ['Religion', profile.religion], ['Looking for', profile.relationshipGoal], ['Zodiac', profile.zodiac]] as const).filter(([, value]) => value).map(([label, value]) => <div key={label} className="min-w-0 rounded-xl bg-slate-50 p-3"><dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt><dd className="mt-1 break-words text-sm font-medium capitalize">{value}</dd></div>)}</dl>
          <Tags title="Interests" values={profile.interests} /><Tags title="Hobbies" values={profile.hobbies} /><Tags title="Personality" values={profile.personality} />
        </div>
      </div>
    </> : null}
  </dialog>;
}
