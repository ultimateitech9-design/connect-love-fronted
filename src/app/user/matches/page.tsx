"use client";


import { useState, useEffect, type MouseEvent } from "react";
import { MatchProfileDialog } from "@/features/user/MatchProfileDialog";
import { announceNewMatch } from '@/features/matches/matchCelebration';
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Ban, Clock, RefreshCw, Sparkles, Star, Trash2, UserCheck, LockKeyhole, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PresenceDot, useOnlineIds } from "@/features/presence/presence";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMatchPage, useMatchSummary, matchRequest, type MatchRecord as DBMatch, type MatchTab } from '@/hooks/useMatchPage';

type ReceivedFirstImpression = { id: string; sender: { id: string | null; name: string; photo: string | null }; content: string | null; locked: boolean; createdAt: string };

function MatchSkeleton() {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading matches" aria-busy="true">
    {[0, 1, 2].map(item => <div key={item} className="h-44 animate-pulse rounded-2xl border border-slate-100 bg-white shadow-sm" />)}
  </div>;
}

export default function MatchesDashboard() {
 const queryClient = useQueryClient();
 const [token, setToken] = useState('');
 const [myId, setMyId] = useState('');
 const [mainTab, setMainTab] = useState<MatchTab>('active');
 const [pendingTab, setPendingTab] = useState<'sent' | 'super'>('sent');
 const [pages, setPages] = useState<Record<string, number>>({});
 const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
 const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(null);
 const [showMatchPlanPopup, setShowMatchPlanPopup] = useState(false);
 const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
 const openMatchProfile = (match: DBMatch) => {
   if (match.locked) { setShowMatchPlanPopup(true); return; }
   setSelectedMatchId(match.id);
 };
 const cardClick = (event: MouseEvent<HTMLElement>, match: DBMatch) => {
   if ((event.target as HTMLElement).closest('button, a')) return;
   openMatchProfile(match);
 };
 const profileName = (match: DBMatch, name: string, age: number | null, extra = '') => (
   <button type="button" disabled={match.locked} onClick={() => openMatchProfile(match)} aria-label={`View profile of ${name}`} className={cn('rounded text-left text-base font-semibold text-slate-800 hover:text-rose-600 hover:underline focus-visible:outline-2 focus-visible:outline-rose-500 disabled:no-underline', extra)}>
     {name}{age != null && `, ${age}`}
   </button>
 );
 const pageKey = mainTab === 'pending' ? `pending-${pendingTab}` : mainTab;
 const currentPage = pages[pageKey] || 0;
 const changePage = (page: number) => setPages(current => ({ ...current, [pageKey]: page }));

 useEffect(() => {
   const value = getToken();
   if (!value) return;
   try {
     const payload = JSON.parse(atob(value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
     const requested = new URLSearchParams(window.location.search).get('tab');
     if (requested === 'received' || requested === 'pending' || requested === 'blocked') setMainTab(requested);
     setMyId(String(payload.sub || payload.userId || ''));
     setToken(value);
   } catch {}
 }, []);

 const pageQuery = useMatchPage(myId, token, mainTab, currentPage, pendingTab);
 const summaryQuery = useMatchSummary(myId, token);
 useEffect(() => {
   if (myId && token) void summaryQuery.refetch();
 }, [myId, token, mainTab, pendingTab]);
 const summary = summaryQuery.data || { active: 0, received: 0, sent: 0, sentSuper: 0, blocked: 0 };
 const items = pageQuery.data?.items || [];
 const isLoading = !myId || pageQuery.isPending;
 const fetchError = pageQuery.isError || summaryQuery.isError;
 const activeMatches = mainTab === 'active' ? items : [];
 const receivedLikes = mainTab === 'received' ? items : [];
 const sentLikes = mainTab === 'pending' ? items : [];
 const blockedUsers = mainTab === 'blocked' ? items : [];
 const totalPending = summary.sent;
 const superLikes = sentLikes.filter(m => m.isSuperLike);
 const normalSentLikes = sentLikes.filter(m => !m.isSuperLike);

 const { data: firstImpressions = [] } = useQuery({
   queryKey: ['matches', 'first-impressions', myId],
   queryFn: async ({ signal }) => {
     const result = await matchRequest<{ items: ReceivedFirstImpression[] }>('/first-impressions/received', token, { signal });
     return (result.items || []).filter(item => item.locked);
   },
   enabled: Boolean(myId && mainTab === 'active' && pageQuery.isSuccess),
   staleTime: 60_000, refetchOnMount: true,
 });
 const onlineIds = useOnlineIds(mainTab === 'blocked' ? [] : items.map(m => m.senderId === myId ? m.receiverId : m.senderId)
   .concat(mainTab === 'active' ? firstImpressions.flatMap(item => item.sender?.id ? [item.sender.id] : []) : []));
 const getProfile = (match: DBMatch) => {
   const targetId = match.senderId === myId ? match.receiverId : match.senderId;
   const profile = match.senderId === myId ? match.receiver : match.sender;
   if (!profile) return null;
   return { ...profile, name: profile.name || 'Unknown', age: profile.age ?? null,
     photo: profile.photos?.[0] || profile.avatarUrl || undefined, online: onlineIds.has(String(targetId)) };
 };

 // Deleting the final row of a later page returns to the previous page.
 useEffect(() => {
   if (pageQuery.isSuccess && !pageQuery.isFetching && items.length === 0 && currentPage > 0) changePage(currentPage - 1);
 }, [pageQuery.isSuccess, pageQuery.isFetching, items.length, currentPage, pageKey]);

 const refreshCurrentTab = () => queryClient.invalidateQueries({ queryKey: ['matches'] });
 const handleBlock = async (id: string) => {
   try {
     await matchRequest(`/matches/block/${id}`, token, { method: 'PATCH' });
     toast.success('User blocked successfully');
     await refreshCurrentTab();
   } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not block this user.'); }
 };
 const handleUnblock = async (id: string) => {
   try {
     await matchRequest(`/matches/unblock/${id}`, token, { method: 'PATCH' });
     toast.success('User unblocked successfully');
     await refreshCurrentTab();
   } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not unblock this user.'); }
 };
 const handleWithdrawLike = async (id: string) => {
   if (deletingRequestId) return;
   setDeletingRequestId(id);
   try {
     await matchRequest(`/matches/pending/${id}`, token, { method: 'DELETE' });
     toast.success('Pending request deleted');
     await refreshCurrentTab();
   } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not delete the pending request.'); }
   finally { setDeletingRequestId(null); }
 };
 const handleAcceptMatch = async (match: DBMatch) => {
   if (acceptingRequestId) return;
   setAcceptingRequestId(match.id);
   try {
     await matchRequest('/matches/respond', token, { method: 'POST', body: JSON.stringify({ matchId: match.id, action: 'accept' }) });
     announceNewMatch(match.id, myId);
     await refreshCurrentTab();
   } catch (error) {
     const message = error instanceof Error ? error.message : 'Could not accept this match request.';
     toast.error(message);
     if (/plan allows.*matches|match.*limit|upgrade your plan to match/i.test(message)) setShowMatchPlanPopup(true);
   } finally { setAcceptingRequestId(null); }
 };
 const handlePassMatch = async (matchId: string) => {
   try {
     await matchRequest('/matches/respond', token, { method: 'POST', body: JSON.stringify({ matchId, action: 'decline' }) });
     toast.success('Passed on profile.');
     await refreshCurrentTab();
   } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not pass on this profile.'); }
 };
 return (
 <div className="space-y-6">
   {selectedMatchId && <MatchProfileDialog key={selectedMatchId} matchId={selectedMatchId} viewerId={myId} token={token} onClose={() => setSelectedMatchId(null)} />}
   {showMatchPlanPopup && (
     <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="match-limit-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowMatchPlanPopup(false); }}>
       <div className="relative w-full max-w-md rounded-3xl border border-rose-100 bg-white p-7 text-center shadow-2xl">
         <button type="button" onClick={() => setShowMatchPlanPopup(false)} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200" aria-label="Close plan popup">×</button>
         <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-rose-100 to-pink-200 text-rose-600"><LockKeyhole className="h-8 w-8" /></span>
         <h2 id="match-limit-title" className="mt-5 text-2xl font-black text-slate-900">Match Limit Completed</h2>
         <p className="mt-2 text-sm leading-6 text-slate-600">The Free plan allows 2 active matches. Activate Gold for up to 10 matches or Diamond for up to 20 matches.</p>
         <Button asChild className="mt-6 h-12 w-full rounded-full bg-gradient-to-r from-rose-500 to-pink-600 text-sm font-bold text-white shadow-lg shadow-rose-500/25"><Link href="/user/premium">View Plans</Link></Button>
       </div>
     </div>
   )}
   {fetchError && (
     <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between">
       <span>Matches could not be loaded. Please check the connection and try again.</span>
       <Button variant="outline" size="sm" onClick={() => void refreshCurrentTab()} className="shrink-0 border-amber-300 bg-white text-amber-800 hover:bg-amber-100">
         <RefreshCw className="mr-2 h-4 w-4" /> Retry
       </Button>
     </div>
   )}
   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
     <div>
       <h1 className="text-2xl font-semibold text-slate-800">Your Matches</h1>
       <p className="text-sm text-muted-foreground mt-1">Manage your active conversations, pending likes, and restricted accounts.</p>
     </div>
   </div>

   <Tabs value={mainTab} onValueChange={(value) => setMainTab(value as MatchTab)} className="w-full">
     <TabsList className="mb-6 grid h-auto w-full grid-cols-4 rounded-2xl bg-slate-100 p-1 text-slate-500 sm:inline-grid sm:w-auto sm:rounded-full">
       <TabsTrigger value="active" className="min-w-0 rounded-full px-1 py-2 text-[10px] transition-all data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm min-[380px]:text-xs sm:px-5 sm:text-sm">
         <span className="sm:hidden">Active ({summary.active})</span>
         <span className="hidden sm:inline">Active Matches ({summary.active})</span>
       </TabsTrigger>
       <TabsTrigger value="received" className="min-w-0 rounded-full px-1 py-2 text-[10px] transition-all data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm min-[380px]:text-xs sm:px-5 sm:text-sm">
         <span className="sm:hidden">Received ({summary.received})</span>
         <span className="hidden sm:inline">Requests Received ({summary.received})</span>
       </TabsTrigger>
       <TabsTrigger value="pending" className="min-w-0 rounded-full px-1 py-2 text-[10px] transition-all data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm min-[380px]:text-xs sm:px-5 sm:text-sm">
         <span className="sm:hidden">Pending ({totalPending})</span>
         <span className="hidden sm:inline">Pending Requests ({totalPending})</span>
       </TabsTrigger>
       <TabsTrigger value="blocked" className="min-w-0 rounded-full px-1 py-2 text-[10px] transition-all data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm min-[380px]:text-xs sm:px-5 sm:text-sm">
         <span className="sm:hidden">Blocked ({summary.blocked})</span>
         <span className="hidden sm:inline">Blocked Users ({summary.blocked})</span>
       </TabsTrigger>
     </TabsList>

     {/* ACTIVE MATCHES */}
     <TabsContent value="active" className="mt-0 focus-visible:outline-none">
       {isLoading ? <MatchSkeleton /> : <>
       <div className="mb-6"><p className="text-sm text-muted-foreground">You have {summary.active} active matches. Say hello!</p></div>
       {firstImpressions.length > 0 && (
         <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {firstImpressions.map((item) => (
             <article key={item.id} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
               <div className="flex items-center gap-3">
                 <div className="relative">
                   <Avatar className="h-12 w-12"><AvatarImage src={item.sender.photo || undefined} /><AvatarFallback className="bg-blue-50 text-blue-500">?</AvatarFallback></Avatar>
                   {!item.locked && item.sender?.id && <PresenceDot online={onlineIds.has(String(item.sender.id))} className="bottom-auto top-0" />}
                   <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-blue-500 text-white ring-2 ring-white"><Send className="h-2.5 w-2.5 -rotate-12" /></span>
                 </div>
                 <div className="min-w-0 flex-1">
                   <p className="truncate font-semibold text-slate-900">{item.sender.name}</p>
                   <p className="text-xs font-medium text-blue-500">Sent you a First Impression</p>
                 </div>
                 {item.locked && <LockKeyhole className="h-4 w-4 text-amber-500" />}
               </div>
               <div className="relative mt-4 overflow-hidden rounded-xl bg-slate-50 px-3 py-2">
                 <p className={cn("text-sm text-slate-600", item.locked && "select-none blur-[4px]")}>{item.locked ? 'A private message is waiting for you.' : item.content}</p>
                 {item.locked && <LockKeyhole className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-amber-500" />}
               </div>
               <Button asChild className="mt-4 w-full rounded-full bg-[color:var(--brand)] text-white hover:opacity-90">
                 <Link href={item.locked ? '/user/premium' : '/user/messages'}>{item.locked ? 'Unlock First Impression' : 'View message'}</Link>
               </Button>
             </article>
           ))}
         </div>
       )}
       {activeMatches.length === 0 ? (
         <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center text-muted-foreground">No active matches yet.</div>
       ) : (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {activeMatches.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             return (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} onClick={(event) => cardClick(event, m)} className="cursor-pointer relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm transition-all">
                 {m.locked && (
                   <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/75 p-5 text-center backdrop-blur-md">
                     <span className="grid h-11 w-11 place-items-center rounded-full bg-rose-100 text-rose-600"><LockKeyhole className="h-5 w-5" /></span>
                     <p className="mt-3 text-sm font-bold text-slate-900">Match Locked</p>
                     <p className="mt-1 text-xs text-slate-500">Activate a plan to view this profile and message your match.</p>
                     <Button asChild className="mt-4 h-9 rounded-full bg-[color:var(--brand)] px-5 text-white"><Link href="/user/premium">View Plans</Link></Button>
                   </div>
                 )}
                 <div className="flex items-center gap-3">
                   <div className="relative">
                     <Avatar className="h-12 w-12">
                       <AvatarImage src={profile.photo} />
                       <AvatarFallback>{profile.name[0]}</AvatarFallback>
                     </Avatar>
                     <PresenceDot online={profile.online} />
                   </div>
                   <div>
                     {profileName(m, profile.name, profile.age)}
                     <p className="text-xs text-slate-400">Matched recently</p>
                   </div>
                 </div>
                 <p className="mt-4 line-clamp-2 text-sm text-slate-500">{profile.lastMessage || profile.bio || "No messages yet. Send a message to start the conversation!"}</p>
                 <div className="mt-5 flex gap-2 items-center">
                   <Link href={`/user/messages?id=${m.id}`} className="flex-1">
                     <Button className="w-full rounded-xl bg-[color:var(--brand)] hover:bg-[color:var(--brand)]/90 text-white shadow-sm">
                       <MessageSquare className="mr-2 h-4 w-4" /> Message
                     </Button>
                   </Link>
                   <Button onClick={() => handleBlock(m.id)} variant="outline" size="icon" className="rounded-full w-10 h-10 border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-500 transition-colors shrink-0">
                     <Ban className="h-4 w-4" />
                   </Button>
                 </div>
               </motion.div>
             );
           })}
         </div>
       )}

       </>}
     </TabsContent>

     {/* LIKES RECEIVED — kept beside Active Matches so incoming likes are always visible */}
     <TabsContent value="received" className="mt-0 focus-visible:outline-none">
       {isLoading ? <MatchSkeleton /> : <>
       <div className="mb-6"><p className="text-sm text-muted-foreground">People who sent you a request. Match or pass them here.</p></div>
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         {receivedLikes.map((m) => {
           const profile = getProfile(m);
           if (!profile) return null;
           const isSuper = m.isSuperLike;
           return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} onClick={(event) => cardClick(event, m)} className={cn("cursor-pointer relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all", isSuper ? "border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border border-slate-100 border-l-4 border-l-[color:var(--brand)]")}>
             {isSuper && <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-transparent" />}
             {m.locked && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/75 p-5 text-center backdrop-blur-md"><LockKeyhole className="h-6 w-6 text-rose-500" /><p className="mt-2 text-sm font-bold text-slate-900">Like Locked</p><p className="mt-1 text-xs text-slate-500">Activate a plan to view and match.</p><Button asChild className="mt-3 h-8 rounded-full bg-[color:var(--brand)] px-4 text-white"><Link href="/user/premium">View Plans</Link></Button></div>}
             <div className={cn("relative z-10 flex items-center gap-3", m.locked && "select-none blur-md")}><span className="relative shrink-0"><Avatar className={cn("h-12 w-12", isSuper && "ring-2 ring-blue-300 ring-offset-2")}><AvatarImage src={profile.photo} /><AvatarFallback>{profile.name[0]}</AvatarFallback></Avatar>{!m.locked && <PresenceDot online={profile.online} />}</span><div><div>{profileName(m, profile.name, profile.age)} {isSuper && <Star className="mb-0.5 ml-1 inline-block h-4 w-4 fill-blue-500 text-blue-500" />}</div><p className={cn("text-xs font-medium", isSuper ? "text-blue-500" : "text-[color:var(--brand)]")}>{isSuper ? "Super Liked you!" : "Liked you!"}</p></div></div>
             <p className={cn("relative z-10 mt-4 line-clamp-2 text-sm text-slate-500", m.locked && "select-none blur-md")}>{m.locked ? "Someone liked your profile" : profile.bio}</p>
             <div className="relative z-10 mt-5 flex gap-2"><Button disabled={acceptingRequestId !== null || m.locked} className={cn("flex-1 rounded-full text-white shadow-sm", isSuper ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-[color:var(--brand)]")} onClick={() => handleAcceptMatch(m)}>{acceptingRequestId === m.id ? "Matching..." : "Match"}</Button><Button disabled={m.locked} variant="outline" className="rounded-full border-slate-200 text-slate-400 hover:text-red-500" onClick={() => handlePassMatch(m.id)}>Pass</Button></div>
           </motion.div>;
         })}
         {receivedLikes.length === 0 && <div className="col-span-full py-4 text-sm text-slate-400">No requests received yet.</div>}
       </div>

       </>}
     </TabsContent>

     {/* PENDING REQUESTS */}
     <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
       {isLoading ? <MatchSkeleton /> : <>
       <div className="mb-4"><p className="text-sm text-muted-foreground">Manage likes you have sent and your super likes.</p></div>

       <div className="flex gap-2 mb-6">
         <button onClick={() => setPendingTab('sent')} className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", pendingTab === 'sent' ? "bg-rose-100 text-[color:var(--brand)]" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
           Sent Likes ({summary.sent - summary.sentSuper})
         </button>
         <button onClick={() => setPendingTab('super')} className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center", pendingTab === 'super' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
           <Star className="w-3.5 h-3.5 mr-1.5 fill-current" /> Super Likes ({summary.sentSuper})
         </button>
       </div>

       {pendingTab === 'sent' && (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {normalSentLikes.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             return (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} onClick={(event) => cardClick(event, m)} className="cursor-pointer rounded-2xl bg-white border border-slate-100 p-5 shadow-sm transition-all">
                 <div className="flex items-center gap-3">
                   <span className="relative shrink-0">
                   <Avatar className="h-12 w-12 grayscale-[20%]">
                     <AvatarImage src={profile.photo} />
                     <AvatarFallback>{profile.name[0]}</AvatarFallback>
                   </Avatar>
                   {!m.locked && <PresenceDot online={profile.online} />}
                   </span>
                   <div>
                     {profileName(m, profile.name, profile.age)}
                     <p className="text-xs text-slate-400">Liked recently</p>
                   </div>
                 </div>
                 <p className="mt-4 line-clamp-2 text-sm text-slate-500">{profile.bio}</p>
                 <div className="mt-5 flex flex-col gap-2">
                   <div className="w-full flex items-center justify-center rounded-full border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-400">
                     <Clock className="mr-2 h-4 w-4 opacity-70" /> Pending Approval
                   </div>
                   <button disabled={deletingRequestId === m.id} onClick={() => handleWithdrawLike(m.id)} className="flex items-center justify-center gap-1.5 text-xs text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 text-center py-1 mt-1 transition-colors">
                     <Trash2 className="h-3.5 w-3.5" /> {deletingRequestId === m.id ? "Deleting..." : "Delete Request"}
                   </button>
                 </div>
               </motion.div>
             );
           })}
           {normalSentLikes.length === 0 && <div className="col-span-full text-slate-400 text-sm py-4">No sent likes yet.</div>}
         </div>
       )}

       {pendingTab === 'super' && (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {superLikes.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             return (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={m.id} onClick={(event) => cardClick(event, m)} className="cursor-pointer relative group rounded-2xl bg-gradient-to-br from-white to-amber-50/30 p-5 shadow-[0_4px_20px_rgb(251,191,36,0.15)] border border-amber-200 transition-all hover:shadow-[0_8px_30px_rgb(251,191,36,0.25)] hover:-translate-y-1 overflow-hidden">
                 <div className="absolute -right-4 -top-4 opacity-10 rotate-12 pointer-events-none">
                   <Star className="w-24 h-24 text-amber-500 fill-amber-500" />
                 </div>
                 <div className="relative z-10 flex items-center gap-3">
                   <span className="relative shrink-0">
                   <Avatar className="h-12 w-12 ring-2 ring-amber-300 shadow-md">
                     <AvatarImage src={profile.photo} />
                     <AvatarFallback>{profile.name[0]}</AvatarFallback>
                   </Avatar>
                   {!m.locked && <PresenceDot online={profile.online} />}
                   </span>
                   <div>
                     {profileName(m, profile.name, profile.age)}
                     <p className="text-xs font-bold text-amber-500 flex items-center gap-1">
                       <Star className="w-3 h-3 fill-current" /> Super Liked!
                     </p>
                   </div>
                 </div>
                 <p className="relative z-10 mt-4 line-clamp-2 text-sm text-slate-600">{profile.bio}</p>
                 <div className="relative z-10 mt-5 flex flex-col gap-2">
                   <div className="w-full flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 text-sm font-bold text-white shadow-sm animate-pulse">
                     <Star className="mr-1.5 h-4 w-4 fill-current" /> Awaiting Match
                   </div>
                   <button disabled={deletingRequestId === m.id} onClick={() => handleWithdrawLike(m.id)} className="flex items-center justify-center gap-1.5 text-xs text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 text-center py-1 mt-1 transition-colors">
                     <Trash2 className="h-3.5 w-3.5" /> {deletingRequestId === m.id ? "Deleting..." : "Delete Super Like"}
                   </button>
                 </div>
               </motion.div>
             );
           })}
           {superLikes.length === 0 && <div className="col-span-full text-amber-600/60 text-sm py-4 font-medium">You haven't super liked anyone yet.</div>}
         </div>
       )}

       </>}
     </TabsContent>

     {/* BLOCKED USERS */}
     <TabsContent value="blocked" className="mt-0 focus-visible:outline-none">
       {isLoading ? <MatchSkeleton /> : <>
       <div className="mb-6"><p className="text-sm text-muted-foreground">Users you have blocked ({summary.blocked}).</p></div>
       {blockedUsers.length === 0 ? (
         <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center text-muted-foreground">You haven't blocked anyone.</div>
       ) : (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {blockedUsers.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             return (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={m.id} onClick={(event) => cardClick(event, m)} className="cursor-pointer rounded-2xl bg-slate-50 border border-slate-200 p-5 shadow-sm grayscale opacity-70 transition-all hover:opacity-100">
                 <div className="flex items-center gap-3">
                   <Avatar className="h-12 w-12">
                     <AvatarImage src={profile.photo} />
                     <AvatarFallback>{profile.name[0]}</AvatarFallback>
                   </Avatar>
                   <div>
                     {profileName(m, profile.name, profile.age, 'text-slate-700 line-through decoration-slate-400')}
                     <p className="text-xs font-medium text-slate-500">Blocked</p>
                   </div>
                 </div>
                 <div className="mt-5">
                   <Button onClick={() => handleUnblock(m.id)} className="w-full rounded-full bg-slate-800 hover:bg-slate-700 text-white shadow-sm">
                     <UserCheck className="mr-2 h-4 w-4" /> Unblock User
                   </Button>
                 </div>
               </motion.div>
             );
           })}
         </div>
       )}

       </>}
     </TabsContent>
     <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4" aria-label="Matches pagination">
       <p className="text-sm text-slate-500">Page {currentPage + 1}{pageQuery.isFetching && !isLoading ? ' ? Updating...' : ''}</p>
       <div className="flex gap-2">
         <Button variant="outline" disabled={currentPage === 0 || isLoading} onClick={() => changePage(currentPage - 1)}>Previous</Button>
         <Button variant="outline" disabled={!pageQuery.data?.hasMore || isLoading} onClick={() => changePage(currentPage + 1)}>Next</Button>
       </div>
     </div>
   </Tabs>
 </div>
 );
}
