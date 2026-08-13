"use client";
import { apiFetch } from "@/config/runtime";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Ban, Clock, RefreshCw, Sparkles, Star, Trash2, UserCheck, LockKeyhole, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner"; 
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type MatchStatus = "PENDING" | "MATCHED" | "DECLINED" | "BLOCKED";
type DBMatch = { id: string; senderId: string; receiverId: string; status: MatchStatus; isSuperLike?: boolean; locked?: boolean; createdAt?: string };
type ReceivedFirstImpression = { id: string; sender: { id: string | null; name: string; photo: string | null }; content: string | null; locked: boolean; createdAt: string };
type MatchTab = "active" | "received" | "pending" | "blocked";
type MatchSummary = { active: number; sent: number; received: number; blocked: number };
const MATCH_PAGE_SIZE = 12;

async function readMatches(res: Response): Promise<DBMatch[]> {
 if (!res.ok) {
   const body = await res.json().catch(() => null);
   throw new Error(body?.message || `Matches request failed (${res.status})`);
 }
 const data = await res.json().catch(() => []);
 return Array.isArray(data) ? data : [];
}

export default function MatchesDashboard() {
 const [activeMatches, setActiveMatches] = useState<DBMatch[]>([]);
 const [sentLikes, setSentLikes] = useState<DBMatch[]>([]);
 const [receivedLikes, setReceivedLikes] = useState<DBMatch[]>([]);
 const [blockedUsers, setBlockedUsers] = useState<DBMatch[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const [mainTab, setMainTab] = useState<MatchTab>("active");
 const [pendingTab, setPendingTab] = useState<"sent" | "super">("sent");
 const [myId, setMyId] = useState<string | null>(null);
 const [deletingRequestId, setDeletingRequestId] = useState<string | null>(null);
 const [acceptingRequestId, setAcceptingRequestId] = useState<string | null>(null);
 const [fetchError, setFetchError] = useState(false);
 const [firstImpressions, setFirstImpressions] = useState<ReceivedFirstImpression[]>([]);
 const [showMatchPlanPopup, setShowMatchPlanPopup] = useState(false);
 const [summary, setSummary] = useState<MatchSummary>({ active: 0, sent: 0, received: 0, blocked: 0 });
 const loadedTabs = useRef(new Set<MatchTab>());
 const loadingTabs = useRef(new Set<MatchTab>());
 const loadingMoreTabs = useRef(new Set<MatchTab>());
 const exhaustedTabs = useRef(new Set<MatchTab>());
 const nextOffsets = useRef<Record<MatchTab, number>>({ active: 0, received: 0, pending: 0, blocked: 0 });
 const selectedTab = useRef<MatchTab>('active');

 useEffect(() => {
   // Remove the old full-response cache; embedded profile photos can exceed
   // mobile browsers' small sessionStorage quota.
   try { sessionStorage.removeItem("connectlove:matches"); } catch {}
   const token = getToken();
   if (token) {
     try {
       const payload = JSON.parse(atob(token.split('.')[1]));
       setMyId(payload.userId || payload.sub);
     } catch(e) {}
   }
 }, []);

 const getProfile = (m: any) => {
   if (!myId) return null;
   const targetId = m.senderId === myId ? m.receiverId : m.senderId;
   const realProfile = m.senderId === myId ? m.receiver : m.sender;
   if (!realProfile) return null;
   return {
     ...realProfile,
     name: realProfile.name || "Unknown",
     age: realProfile.age || 25,
     photo: (realProfile.photos && realProfile.photos.length > 0) ? realProfile.photos[0] : (realProfile.avatarUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop"),
      online: !!realProfile.isOnline
   };
 };

 const refreshSummary = async () => {
   const token = getToken();
   if (!token) return;
   const response = await apiFetch('/matches/summary', { headers: { Authorization: `Bearer ${token}` } });
   if (response.ok) setSummary(await response.json());
 };

 const appendTabMatches = (tab: MatchTab, matches: DBMatch[]) => {
   const append = (current: DBMatch[]) => [...current, ...matches.filter((item) => !current.some((existing) => existing.id === item.id))];
   if (tab === 'active') setActiveMatches(append);
   if (tab === 'received') setReceivedLikes(append);
   if (tab === 'pending') setSentLikes(append);
   if (tab === 'blocked') setBlockedUsers(append);
 };

 const loadNextPage = async (tab: MatchTab) => {
   if (selectedTab.current !== tab || exhaustedTabs.current.has(tab) || loadingMoreTabs.current.has(tab)) return;
   const token = getToken();
   if (!token) return;
   loadingMoreTabs.current.add(tab);
   try {
     const response = await apiFetch(`/matches?filter=${tab === 'pending' ? 'sent' : tab}&limit=${MATCH_PAGE_SIZE}&offset=${nextOffsets.current[tab]}`, { headers: { Authorization: `Bearer ${token}` } });
     const matches = await readMatches(response);
     if (selectedTab.current !== tab) return;
     appendTabMatches(tab, matches);
     nextOffsets.current[tab] += matches.length;
     if (matches.length < MATCH_PAGE_SIZE) {
       exhaustedTabs.current.add(tab);
     } else {
       // Yield briefly so the cards already received can paint before the
       // next page starts. This loads every record without a large first load.
       window.setTimeout(() => void loadNextPage(tab), 80);
     }
   } catch (error) {
     console.error(`Failed to load more ${tab} matches`, error);
   } finally {
     loadingMoreTabs.current.delete(tab);
   }
 };

 const loadTab = async (tab: MatchTab, force = false) => {
   if ((!force && loadedTabs.current.has(tab)) || loadingTabs.current.has(tab)) return;
   const token = getToken();
   if (!token) return;
   loadingTabs.current.add(tab);
   setFetchError(false);
   if (tab === 'active') setIsLoading(true);
   if (force) {
     exhaustedTabs.current.delete(tab);
     nextOffsets.current[tab] = 0;
   }
   try {
     const response = await apiFetch(`/matches?filter=${tab === 'pending' ? 'sent' : tab}&limit=${MATCH_PAGE_SIZE}&offset=0`, { headers: { Authorization: `Bearer ${token}` } });
     const matches = await readMatches(response);
     if (tab === 'active') setActiveMatches(matches);
     if (tab === 'received') setReceivedLikes(matches);
     if (tab === 'pending') setSentLikes(matches);
     if (tab === 'blocked') setBlockedUsers(matches);
     loadedTabs.current.add(tab);
     nextOffsets.current[tab] = matches.length;
     if (matches.length < MATCH_PAGE_SIZE) exhaustedTabs.current.add(tab);
     if (tab === 'active') {
       void apiFetch('/first-impressions/received', { headers: { Authorization: `Bearer ${token}` } })
         .then(async (response) => response.ok ? response.json() : null)
         .then((result) => setFirstImpressions(Array.isArray(result?.items) ? result.items.filter((item: ReceivedFirstImpression) => item.locked) : []))
         .catch(() => undefined);
     }
   } catch (error) {
     console.error(`Failed to load ${tab} matches`, error);
     setFetchError(true);
   } finally {
     loadingTabs.current.delete(tab);
     if (tab === 'active') setIsLoading(false);
     if (selectedTab.current === tab && !exhaustedTabs.current.has(tab)) window.setTimeout(() => void loadNextPage(tab), 80);
   }
 };

 const refreshCurrentTab = async () => {
   loadedTabs.current.delete(mainTab);
   await Promise.all([loadTab(mainTab, true), refreshSummary()]);
 };

 useEffect(() => {
   void Promise.all([loadTab('active'), refreshSummary()]);
 }, []);

 const handleBlock = async (id: string) => {
   try {
     await apiFetch(`/matches/block/${id}`, {
       method: "PATCH",
       headers: { "Authorization": `Bearer ${getToken()}` },
     });
     toast.success("User blocked successfully");
     await refreshCurrentTab();
   } catch (error) {
     console.error("Failed to block user", error);
   }
 };

 const handleUnblock = async (id: string) => {
   try {
     await apiFetch(`/matches/unblock/${id}`, {
       method: "PATCH",
       headers: { "Authorization": `Bearer ${getToken()}` },
     });
     toast.success("User unblocked successfully");
     await refreshCurrentTab();
   } catch (error) {
     console.error("Failed to unblock user", error);
   }
 };

 const handleWithdrawLike = async (id: string) => {
    if (deletingRequestId) return;
    setDeletingRequestId(id);
    try {
      const response = await apiFetch(`/matches/pending/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Could not delete the pending request.");
      }
      toast.success("Pending request deleted");
      setSentLikes(prev => prev.filter(m => m.id !== id));
      loadedTabs.current.delete('pending');
      void refreshSummary();
    } catch (error) {
      console.error("Failed to withdraw", error);
      toast.error(error instanceof Error ? error.message : "Could not delete the pending request.");
    } finally {
      setDeletingRequestId(null);
    }
 };

 const handleAcceptMatch = async (match: DBMatch, profileName: string) => {
   if (acceptingRequestId) return;
   const matchId = match.id;
   const activeMatch = { ...match, status: "MATCHED" as MatchStatus, locked: false };
   setAcceptingRequestId(matchId);
   // Make the interaction instant. Roll back below only if the server rejects it.
   setReceivedLikes(prev => prev.filter(item => item.id !== matchId));
   setActiveMatches(prev => prev.some(item => item.id === matchId) ? prev : [activeMatch, ...prev]);
   try {
     const response = await apiFetch("/matches/respond", {
       method: "POST",
       headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
       body: JSON.stringify({ matchId, action: "accept" }),
     });
     if (!response.ok) {
       const data = await response.json().catch(() => null);
       throw new Error(data?.message || "Could not accept this match request.");
     }
     toast.success(match.locked ? "It's a Match! The profile is now unlocked." : `It's a Match! You and ${profileName} are now connected.`);
     loadedTabs.current.delete('active');
     loadedTabs.current.delete('received');
     await Promise.all([loadTab(mainTab, true), refreshSummary()]);
   } catch (error) {
     setActiveMatches(prev => prev.filter(item => item.id !== matchId));
     setReceivedLikes(prev => prev.some(item => item.id === matchId) ? prev : [match, ...prev]);
     const message = error instanceof TypeError
       ? "Server se connection nahi ho pa raha. Please try again."
       : error instanceof Error
         ? error.message
         : "Could not accept this match request.";
     toast.error(message);
     if (/plan allows.*matches|match.*limit|upgrade your plan to match/i.test(message)) setShowMatchPlanPopup(true);
   } finally {
     setAcceptingRequestId(null);
   }
 };

 const handlePassMatch = async (matchId: string) => {
   try {
     await apiFetch("/matches/respond", {
       method: "POST",
       headers: { "Content-Type": "application/json", "Authorization": `Bearer ${getToken()}` },
       body: JSON.stringify({ matchId, action: "decline" }),
     });
     toast.success("Passed on profile.");
     setReceivedLikes(prev => prev.filter(m => m.id !== matchId));
     loadedTabs.current.delete('received');
     void refreshSummary();
   } catch (error) {
     console.error("Failed to pass match", error);
   }
 };

 const safeSentLikes = Array.isArray(sentLikes) ? sentLikes : [];
 const safeReceivedLikes = Array.isArray(receivedLikes) ? receivedLikes : [];
 const totalPending = summary.sent + summary.received;
 const superLikes = safeSentLikes.filter(m => m.isSuperLike);
 const normalSentLikes = safeSentLikes.filter(m => !m.isSuperLike);

 if (isLoading) return (
   <div className="space-y-6" aria-busy="true" aria-label="Loading matches">
     <div><h1 className="text-2xl font-semibold text-slate-800">Your Matches</h1><p className="mt-1 text-sm text-muted-foreground">Loading your connections...</p></div>
     <div className="h-11 w-full animate-pulse rounded-2xl bg-slate-100 sm:w-96" />
     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
       {[0, 1, 2].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl border border-slate-100 bg-white shadow-sm" />)}
     </div>
   </div>
 );

 return (
 <div className="space-y-6">
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

   <Tabs value={mainTab} onValueChange={(value) => { const tab = value as MatchTab; selectedTab.current = tab; setMainTab(tab); if (loadedTabs.current.has(tab)) void loadNextPage(tab); else void loadTab(tab); }} className="w-full">
     <TabsList className="mb-6 grid h-auto w-full grid-cols-4 rounded-2xl bg-slate-100 p-1 text-slate-500 sm:inline-grid sm:w-auto sm:rounded-full">
       <TabsTrigger value="active" className="min-w-0 rounded-full px-1 py-2 text-[10px] transition-all data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm min-[380px]:text-xs sm:px-5 sm:text-sm">
         <span className="sm:hidden">Active ({summary.active})</span>
         <span className="hidden sm:inline">Active Matches ({summary.active})</span>
       </TabsTrigger>
       <TabsTrigger value="received" className="min-w-0 rounded-full px-1 py-2 text-[10px] transition-all data-[state=active]:bg-white data-[state=active]:text-[color:var(--brand)] data-[state=active]:shadow-sm min-[380px]:text-xs sm:px-5 sm:text-sm">
         <span className="sm:hidden">Received ({summary.received})</span>
         <span className="hidden sm:inline">Likes Received ({summary.received})</span>
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
       <div className="mb-6"><p className="text-sm text-muted-foreground">You have {summary.active} active matches. Say hello!</p></div>
       {firstImpressions.length > 0 && (
         <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {firstImpressions.map((item) => (
             <article key={item.id} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
               <div className="flex items-center gap-3">
                 <div className="relative">
                   <Avatar className="h-12 w-12"><AvatarImage src={item.sender.photo || undefined} /><AvatarFallback className="bg-blue-50 text-blue-500">?</AvatarFallback></Avatar>
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
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm transition-all">
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
                     {profile.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />}
                   </div>
                   <div>
                     <p className="text-base font-semibold text-slate-800">{profile.name}, {profile.age}</p>
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
     </TabsContent>

     {/* LIKES RECEIVED — kept beside Active Matches so incoming likes are always visible */}
     <TabsContent value="received" className="mt-0 focus-visible:outline-none">
       <div className="mb-6"><p className="text-sm text-muted-foreground">People who liked your profile. Match or pass them here.</p></div>
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
         {receivedLikes.map((m) => {
           const profile = getProfile(m);
           if (!profile) return null;
           const isSuper = m.isSuperLike;
           return <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={cn("relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all", isSuper ? "border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border border-slate-100 border-l-4 border-l-[color:var(--brand)]")}>
             {isSuper && <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-transparent" />}
             {m.locked && <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/75 p-5 text-center backdrop-blur-md"><LockKeyhole className="h-6 w-6 text-rose-500" /><p className="mt-2 text-sm font-bold text-slate-900">Like Locked</p><p className="mt-1 text-xs text-slate-500">Activate a plan to view and match.</p><Button asChild className="mt-3 h-8 rounded-full bg-[color:var(--brand)] px-4 text-white"><Link href="/user/premium">View Plans</Link></Button></div>}
             <div className={cn("relative z-10 flex items-center gap-3", m.locked && "select-none blur-md")}><Avatar className={cn("h-12 w-12", isSuper && "ring-2 ring-blue-300 ring-offset-2")}><AvatarImage src={profile.photo} /><AvatarFallback>{profile.name[0]}</AvatarFallback></Avatar><div><p className="text-base font-semibold text-slate-800">{profile.name}, {profile.age} {isSuper && <Star className="mb-0.5 ml-1 inline-block h-4 w-4 fill-blue-500 text-blue-500" />}</p><p className={cn("text-xs font-medium", isSuper ? "text-blue-500" : "text-[color:var(--brand)]")}>{isSuper ? "Super Liked you!" : "Liked you!"}</p></div></div>
             <p className={cn("relative z-10 mt-4 line-clamp-2 text-sm text-slate-500", m.locked && "select-none blur-md")}>{m.locked ? "Someone liked your profile" : profile.bio}</p>
             <div className="relative z-10 mt-5 flex gap-2"><Button disabled={acceptingRequestId !== null || m.locked} className={cn("flex-1 rounded-full text-white shadow-sm", isSuper ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-[color:var(--brand)]")} onClick={() => handleAcceptMatch(m, profile.name)}>{acceptingRequestId === m.id ? "Matching..." : "Match"}</Button><Button disabled={m.locked} variant="outline" className="rounded-full border-slate-200 text-slate-400 hover:text-red-500" onClick={() => handlePassMatch(m.id)}>Pass</Button></div>
           </motion.div>;
         })}
         {receivedLikes.length === 0 && <div className="col-span-full py-4 text-sm text-slate-400">No likes received yet.</div>}
       </div>
     </TabsContent>

     {/* PENDING REQUESTS */}
     <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
       <div className="mb-4"><p className="text-sm text-muted-foreground">Manage likes you have sent and your super likes.</p></div>
       
       <div className="flex gap-2 mb-6">
         <button onClick={() => setPendingTab('sent')} className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors", pendingTab === 'sent' ? "bg-rose-100 text-[color:var(--brand)]" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
           Sent Likes ({normalSentLikes.length})
         </button>
         <button onClick={() => setPendingTab('super')} className={cn("px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center", pendingTab === 'super' ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>
           <Star className="w-3.5 h-3.5 mr-1.5 fill-current" /> Super Likes ({superLikes.length})
         </button>
       </div>

       {pendingTab === 'sent' && (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {normalSentLikes.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             return (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm transition-all">
                 <div className="flex items-center gap-3">
                   <Avatar className="h-12 w-12 grayscale-[20%]">
                     <AvatarImage src={profile.photo} />
                     <AvatarFallback>{profile.name[0]}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="text-base font-semibold text-slate-800">{profile.name}, {profile.age}</p>
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

       {false && (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {receivedLikes.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             const isSuper = m.isSuperLike;
             return (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={m.id} className={cn(
                 "relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition-all",
                 isSuper ? "border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "border border-slate-100 border-l-4 border-l-[color:var(--brand)]"
               )}>
                 {isSuper && (
                   <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-transparent pointer-events-none" />
                 )}
                 <div className={cn("relative z-10 flex items-center gap-3", m.locked && "pointer-events-none select-none blur-md")}>
                   <Avatar className={cn("h-12 w-12", isSuper && "ring-2 ring-blue-300 ring-offset-2")}>
                     <AvatarImage src={profile.photo} />
                     <AvatarFallback>{profile.name[0]}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="text-base font-semibold text-slate-800">
                       {profile.name}, {profile.age} {isSuper && <Star className="inline-block w-4 h-4 ml-1 mb-0.5 text-blue-500 fill-blue-500" />}
                     </p>
                     <p className={cn("text-xs font-medium", isSuper ? "text-blue-500" : "text-[color:var(--brand)]")}>
                       {isSuper ? "Super Liked you!" : "Liked you!"}
                     </p>
                   </div>
                 </div>
                 <p className={cn("relative z-10 mt-4 line-clamp-2 text-sm text-slate-500", m.locked && "pointer-events-none select-none blur-md")}>{m.locked ? "Someone liked your profile" : profile.bio}</p>
                 <div className="relative z-10 mt-5 flex gap-2">
                   <Button disabled={acceptingRequestId !== null} className={cn("flex-1 rounded-full text-white shadow-sm", isSuper ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700" : "bg-[color:var(--brand)] hover:bg-[color:var(--brand)]/90")} onClick={() => handleAcceptMatch(m, profile.name)}>
                     {acceptingRequestId === m.id ? "Matching..." : "Match"}
                   </Button>
                   <Button variant="outline" className="rounded-full border-slate-200 text-slate-400 hover:text-red-500 shrink-0" onClick={() => handlePassMatch(m.id)}>
                     Pass
                   </Button>
                 </div>
               </motion.div>
             );
           })}
           {receivedLikes.length === 0 && <div className="col-span-full text-slate-400 text-sm py-4">No pending likes received.</div>}
         </div>
       )}

       {pendingTab === 'super' && (
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
           {superLikes.map((m) => {
             const profile = getProfile(m);
             if (!profile) return null;
             const targetId = m.senderId === myId ? m.receiverId : m.senderId;
             return (
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={m.id} className="relative group rounded-2xl bg-gradient-to-br from-white to-amber-50/30 p-5 shadow-[0_4px_20px_rgb(251,191,36,0.15)] border border-amber-200 transition-all hover:shadow-[0_8px_30px_rgb(251,191,36,0.25)] hover:-translate-y-1 overflow-hidden">
                 <div className="absolute -right-4 -top-4 opacity-10 rotate-12 pointer-events-none">
                   <Star className="w-24 h-24 text-amber-500 fill-amber-500" />
                 </div>
                 <div className="relative z-10 flex items-center gap-3">
                   <Avatar className="h-12 w-12 ring-2 ring-amber-300 shadow-md">
                     <AvatarImage src={profile.photo} />
                     <AvatarFallback>{profile.name[0]}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="text-base font-semibold text-slate-800">{profile.name}, {profile.age}</p>
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
     </TabsContent>

     {/* BLOCKED USERS */}
     <TabsContent value="blocked" className="mt-0 focus-visible:outline-none">
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
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={m.id} className="rounded-2xl bg-slate-50 border border-slate-200 p-5 shadow-sm grayscale opacity-70 transition-all hover:opacity-100">
                 <div className="flex items-center gap-3">
                   <Avatar className="h-12 w-12">
                     <AvatarImage src={profile.photo} />
                     <AvatarFallback>{profile.name[0]}</AvatarFallback>
                   </Avatar>
                   <div>
                     <p className="text-base font-semibold text-slate-700 line-through decoration-slate-400">{profile.name}, {profile.age}</p>
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
     </TabsContent>
   </Tabs>
 </div>
 );
}
